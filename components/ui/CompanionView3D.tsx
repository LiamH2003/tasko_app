import { useRef, useCallback, useEffect } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// ─── React Native polyfills ───────────────────────────────────────────────────

// GLTFParser calls navigator.userAgent.match() — undefined in RN.
if (typeof navigator !== 'undefined' && navigator.userAgent == null) {
  (navigator as any).userAgent = '';
}

// Three.js ImageLoader needs document.createElementNS(ns, 'img').
// We strip embedded images from the GLB so GLTFLoader never actually calls
// ImageLoader, but GLTFParser instantiates the loader in its constructor,
// so the stub must exist.
if (typeof document === 'undefined') {
  const makeImg = (): Record<string, any> => {
    const _l: Record<string, Function[]> = {};
    const el: Record<string, any> = {
      style: {}, nodeName: 'IMG', complete: false,
      width: 1, height: 1, onload: null, onerror: null,
      addEventListener(t: string, fn: Function) { (_l[t] ??= []).push(fn); },
      removeEventListener(t: string, fn: Function) {
        _l[t] = (_l[t] ?? []).filter(f => f !== fn);
      },
      dispatchEvent(e: { type: string }) {
        (_l[e.type] ?? []).forEach(fn => fn(e));
      },
    };
    Object.defineProperty(el, 'src', {
      get: () => el._src,
      set(v: string) {
        el._src = v;
        el.localUri = v;
        setTimeout(() => {
          el.complete = true;
          const ev = { type: 'load', target: el };
          el.dispatchEvent(ev);
          if (typeof el.onload === 'function') el.onload(ev);
        }, 0);
      },
    });
    return el;
  };
  (global as any).document = {
    createElementNS: (_ns: string, tag: string) =>
      tag === 'img' ? makeImg() : { style: {} },
    createElement: (tag: string) =>
      tag === 'img' ? makeImg() : { style: {} },
  };
}

// ─── GLB helpers ─────────────────────────────────────────────────────────────

/**
 * Reads the dimensions and raw bytes of the first image stored in the GLB
 * binary chunk without decoding the PNG pixels.  We get dimensions from the
 * PNG IHDR chunk (bytes 16–23 in big-endian) so we can tell Three.js the
 * image size without a full PNG decode.
 */
function extractPNGFromGLB(
  buffer: ArrayBuffer,
): { pngBytes: Uint8Array; width: number; height: number } | null {
  try {
    const view    = new DataView(buffer);
    const jsonLen = view.getUint32(12, true);

    // Decode JSON, stripping any null-byte padding defensive-ly
    const rawText = new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen));
    const jsonText = rawText.replace(/\0/g, '');
    const json: any = JSON.parse(jsonText);

    if (!Array.isArray(json.images) || json.images.length === 0) return null;
    const img = json.images[0];
    if (img.bufferView == null) return null;

    const bv         = json.bufferViews[img.bufferView];
    const binStart   = 20 + jsonLen;  // offset to BIN chunk header
    const pngOffset  = bv.byteOffset ?? 0;

    // BIN chunk data starts at binStart + 8 (skip 4-byte length + 4-byte type)
    const pngBytes = new Uint8Array(
      buffer.slice(binStart + 8 + pngOffset, binStart + 8 + pngOffset + bv.byteLength),
    );

    // Read PNG IHDR dimensions (big-endian uint32 at bytes 16 and 20)
    const pngView = new DataView(pngBytes.buffer, pngBytes.byteOffset);
    const width   = pngView.getUint32(16, false);
    const height  = pngView.getUint32(20, false);

    return { pngBytes, width, height };
  } catch (e) {
    console.warn('[3D] extractPNGFromGLB failed:', e);
    return null;
  }
}

/**
 * Returns a new GLB with the images/textures/samplers arrays removed and all
 * material texture slots + transmission-related extensions cleared.
 * The BIN chunk (geometry data) is preserved verbatim so the mesh loads normally.
 */
function stripGLBTextures(buffer: ArrayBuffer): ArrayBuffer {
  const view    = new DataView(buffer);
  const jsonLen = view.getUint32(12, true);

  const rawText  = new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen));
  const jsonText = rawText.replace(/\0/g, '');
  const json: any = JSON.parse(jsonText);

  // Remove image/texture data
  delete json.images;
  delete json.textures;
  delete json.samplers;

  // Remove texture references and transmission from every material
  const TRANSMISSION_EXTS = [
    'KHR_materials_transmission',
    'KHR_materials_volume',
    'KHR_materials_ior',
  ];

  if (Array.isArray(json.materials)) {
    for (const mat of json.materials) {
      if (mat.pbrMetallicRoughness) {
        delete mat.pbrMetallicRoughness.baseColorTexture;
        delete mat.pbrMetallicRoughness.metallicRoughnessTexture;
      }
      delete mat.normalTexture;
      delete mat.occlusionTexture;
      delete mat.emissiveTexture;
      if (mat.extensions) {
        for (const ext of TRANSMISSION_EXTS) delete mat.extensions[ext];
        if (Object.keys(mat.extensions).length === 0) delete mat.extensions;
      }
    }
  }

  // Remove transmission extension declarations so Three.js never runs renderTransmissionPass
  for (const key of ['extensionsUsed', 'extensionsRequired'] as const) {
    if (Array.isArray(json[key])) {
      json[key] = json[key].filter((e: string) => !TRANSMISSION_EXTS.includes(e));
      if (json[key].length === 0) delete json[key];
    }
  }

  // ── Rebuild JSON chunk (4-byte aligned, space-padded per GLB spec) ──────────
  const newJsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const pad          = (4 - (newJsonBytes.length % 4)) % 4;
  const jsonChunk    = new Uint8Array(newJsonBytes.length + pad);
  jsonChunk.set(newJsonBytes);
  for (let i = newJsonBytes.length; i < jsonChunk.length; i++) jsonChunk[i] = 0x20;

  // ── Keep original BIN chunk verbatim ─────────────────────────────────────────
  const binStart  = 20 + jsonLen;
  const binChunk  = new Uint8Array(buffer, binStart, buffer.byteLength - binStart);

  // ── Assemble new GLB ──────────────────────────────────────────────────────────
  const total = 12 + 8 + jsonChunk.length + binChunk.length;
  const out   = new ArrayBuffer(total);
  const outV  = new DataView(out);
  const outB  = new Uint8Array(out);

  outV.setUint32(0,  0x46546C67,        true); // 'glTF'
  outV.setUint32(4,  2,                 true); // version 2
  outV.setUint32(8,  total,             true);

  outV.setUint32(12, jsonChunk.length,  true);
  outV.setUint32(16, 0x4E4F534A,        true); // 'JSON'
  outB.set(jsonChunk, 20);

  outB.set(binChunk, 20 + jsonChunk.length);   // BIN chunk (header + data)

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  size?: number;
}

export function CompanionView3D({ size = 220 }: Props) {
  const rafRef      = useRef<number>(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);

  const thetaRef = useRef(0);
  const phiRef   = useRef(Math.PI / 3);
  const RADIUS   = 3.5;
  const lastPos  = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      rendererRef.current?.dispose();
    };
  }, []);

  function updateCamera() {
    const cam = cameraRef.current;
    if (!cam) return;
    cam.position.set(
      RADIUS * Math.sin(phiRef.current) * Math.sin(thetaRef.current),
      RADIUS * Math.cos(phiRef.current),
      RADIUS * Math.sin(phiRef.current) * Math.cos(thetaRef.current),
    );
    cam.lookAt(0, 0, 0);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        lastPos.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e) => {
        if (!lastPos.current) return;
        const dx = e.nativeEvent.pageX - lastPos.current.x;
        const dy = e.nativeEvent.pageY - lastPos.current.y;
        lastPos.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        thetaRef.current -= dx * 0.012;
        phiRef.current    = Math.max(0.1, Math.min(Math.PI * 0.85, phiRef.current + dy * 0.012));
        updateCamera();
      },
      onPanResponderRelease: () => { lastPos.current = null; },
    })
  ).current;

  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    // Patch shader-log methods: expo-gl returns null; Three.js calls .trim() unconditionally.
    const origSIL = (gl as any).getShaderInfoLog?.bind(gl);
    (gl as any).getShaderInfoLog  = (...a: any[]) => {
      try { return origSIL?.(...a) ?? ''; } catch { return ''; }
    };
    const origPIL = (gl as any).getProgramInfoLog?.bind(gl);
    (gl as any).getProgramInfoLog = (...a: any[]) => {
      try { return origPIL?.(...a) ?? ''; } catch { return ''; }
    };

    const fakeCanvas = {
      width:        gl.drawingBufferWidth,
      height:       gl.drawingBufferHeight,
      clientWidth:  gl.drawingBufferWidth,
      clientHeight: gl.drawingBufferHeight,
      style:                  {} as Record<string, string>,
      addEventListener:       () => {},
      removeEventListener:    () => {},
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas:    fakeCanvas as unknown as HTMLCanvasElement,
        context:   gl as unknown as WebGLRenderingContext,
        antialias: false,
        alpha:     true,
      });
    } catch (err) {
      console.error('[3D] renderer init failed:', err);
      return;
    }

    // Disable shader-log inspection entirely — expo-gl null returns would crash .trim()
    renderer.debug.checkShaderErrors = false;

    renderer.setPixelRatio(1);
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight, false);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cameraRef.current = camera;
    updateCamera();

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x4ecdc4, 0.5);
    fill.position.set(-5, 1, -4);
    scene.add(fill);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    tick();

    // ── Load GLB ────────────────────────────────────────────────────────────────
    try {
      const asset = Asset.fromModule(
        require('../../assets/3D/tasko_companion_state1.glb'),
      );
      await asset.downloadAsync();

      const uri = asset.localUri ?? asset.uri;
      if (!uri) throw new Error('Asset has no URI');

      const buffer = await fetch(uri).then(r => r.arrayBuffer());

      // ── Extract embedded PNG texture and cache it to a local file ───────────
      // expo-gl's texImage2D override natively handles { localUri } image objects,
      // so we never need to decode the PNG bytes ourselves — we just write the
      // raw bytes to disk and hand the URI to Three.js.
      let glbTexture: THREE.Texture | null = null;
      const texInfo = extractPNGFromGLB(buffer);

      if (texInfo) {
        // Write raw PNG bytes to cache — expo-file-system v19 File.write() accepts Uint8Array.
        const cacheFile = new File(Paths.cache, 'companion_tex.png');
        cacheFile.write(texInfo.pngBytes);
        const fileUri   = cacheFile.uri;

        // Three.js calls gl.texImage2D(target, 0, internalFormat, format, type, image)
        // expo-gl intercepts this 6-arg form and loads from image.localUri natively.
        glbTexture = new THREE.Texture();
        glbTexture.image = {
          localUri: fileUri,
          width:    texInfo.width,
          height:   texInfo.height,
        } as any;
        glbTexture.generateMipmaps = false;
        glbTexture.wrapS           = THREE.ClampToEdgeWrapping;
        glbTexture.wrapT           = THREE.ClampToEdgeWrapping;
        glbTexture.minFilter       = THREE.LinearFilter;
        glbTexture.magFilter       = THREE.LinearFilter;
        glbTexture.colorSpace      = THREE.SRGBColorSpace;
        glbTexture.flipY           = false; // GLTF UVs already in WebGL orientation
        glbTexture.needsUpdate     = true;
      }

      // ── Strip textures + transmission extensions so GLTFLoader has no blobs ──
      const stripped = stripGLBTextures(buffer);

      await new Promise<void>((resolve, reject) => {
        new GLTFLoader().parse(
          stripped,
          '',
          (gltf) => {
            const model = gltf.scene;

            // Assign our cached texture to every mesh material
            model.traverse((node) => {
              if (!(node instanceof THREE.Mesh)) return;
              const mats = Array.isArray(node.material)
                ? node.material
                : [node.material];
              for (const mat of mats) {
                if (mat instanceof THREE.MeshStandardMaterial && glbTexture) {
                  mat.map          = glbTexture;
                  mat.needsUpdate  = true;
                }
              }
            });

            // Center and fit model in view
            const box    = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const sz     = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(sz.x, sz.y, sz.z);
            model.position.sub(center);
            model.scale.setScalar(2 / maxDim);
            scene.add(model);
            resolve();
          },
          reject,
        );
      });
    } catch (err) {
      console.error('[3D] failed:', err);
    }
  }, []);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      {...panResponder.panHandlers}
    >
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 20 },
});
