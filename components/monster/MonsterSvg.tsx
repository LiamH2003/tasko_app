import { View } from 'react-native';

interface MonsterSvgProps {
  size?: number;
}

// Pure React Native implementation — no react-native-svg required.
// Coordinates derived from the Figma SVG (viewBox 0 0 160 160).
export function MonsterSvg({ size = 160 }: MonsterSvgProps) {
  const s = (n: number) => (n / 160) * size;

  return (
    <View style={{ width: size, height: size }}>

      {/* Soft glow ring */}
      <View style={{
        position: 'absolute',
        top: s(20), left: s(16),
        width: s(128), height: s(128),
        borderRadius: s(64),
        backgroundColor: 'rgba(73,201,213,0.10)',
      }} />

      {/* Left ear — CSS border triangle */}
      <View style={{
        position: 'absolute',
        top: s(20), left: s(30),
        width: 0, height: 0,
        borderLeftWidth: s(14), borderRightWidth: s(14), borderBottomWidth: s(36),
        borderStyle: 'solid',
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderBottomColor: '#3797a0',
      }} />

      {/* Right ear — CSS border triangle */}
      <View style={{
        position: 'absolute',
        top: s(20), right: s(30),
        width: 0, height: 0,
        borderLeftWidth: s(14), borderRightWidth: s(14), borderBottomWidth: s(36),
        borderStyle: 'solid',
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderBottomColor: '#3797a0',
      }} />

      {/* Head — teal ellipse */}
      <View style={{
        position: 'absolute',
        top: s(44), left: s(28),
        width: s(104), height: s(96),
        borderRadius: s(48),
        backgroundColor: '#49c9d5',
        overflow: 'hidden',
      }}>

        {/* Left eye — sclera */}
        <View style={{
          position: 'absolute',
          top: s(32), left: s(26),
          width: s(24), height: s(24),
          borderRadius: s(12),
          backgroundColor: '#fafbf6',
        }}>
          {/* Pupil */}
          <View style={{
            position: 'absolute',
            top: s(6), left: s(6),
            width: s(12), height: s(12),
            borderRadius: s(6),
            backgroundColor: '#1f1e1a',
          }}>
            {/* Gleam */}
            <View style={{
              position: 'absolute',
              top: s(1), right: s(1),
              width: s(4), height: s(4),
              borderRadius: s(2),
              backgroundColor: '#fafbf6',
            }} />
          </View>
        </View>

        {/* Right eye — sclera */}
        <View style={{
          position: 'absolute',
          top: s(32), right: s(26),
          width: s(24), height: s(24),
          borderRadius: s(12),
          backgroundColor: '#fafbf6',
        }}>
          {/* Pupil */}
          <View style={{
            position: 'absolute',
            top: s(6), left: s(6),
            width: s(12), height: s(12),
            borderRadius: s(6),
            backgroundColor: '#1f1e1a',
          }}>
            {/* Gleam */}
            <View style={{
              position: 'absolute',
              top: s(1), right: s(1),
              width: s(4), height: s(4),
              borderRadius: s(2),
              backgroundColor: '#fafbf6',
            }} />
          </View>
        </View>

        {/* Nose */}
        <View style={{
          position: 'absolute',
          top: s(54), left: s(48),
          width: s(8), height: s(6),
          borderRadius: s(3),
          backgroundColor: '#2c7980',
        }} />

        {/* Left blush */}
        <View style={{
          position: 'absolute',
          top: s(57), left: s(20),
          width: s(16), height: s(10),
          borderRadius: s(5),
          backgroundColor: '#3797a0',
          opacity: 0.4,
        }} />

        {/* Right blush */}
        <View style={{
          position: 'absolute',
          top: s(57), right: s(20),
          width: s(16), height: s(10),
          borderRadius: s(5),
          backgroundColor: '#3797a0',
          opacity: 0.4,
        }} />
      </View>

      {/* Whiskers — left */}
      <View style={{
        position: 'absolute',
        top: s(93), left: s(18),
        width: s(38), height: s(1.5),
        backgroundColor: 'rgba(250,251,246,0.75)',
        borderRadius: s(1),
        transform: [{ rotate: '-7deg' }],
      }} />
      <View style={{
        position: 'absolute',
        top: s(103), left: s(16),
        width: s(40), height: s(1.5),
        backgroundColor: 'rgba(250,251,246,0.75)',
        borderRadius: s(1),
        transform: [{ rotate: '-2deg' }],
      }} />

      {/* Whiskers — right */}
      <View style={{
        position: 'absolute',
        top: s(93), right: s(18),
        width: s(38), height: s(1.5),
        backgroundColor: 'rgba(250,251,246,0.75)',
        borderRadius: s(1),
        transform: [{ rotate: '7deg' }],
      }} />
      <View style={{
        position: 'absolute',
        top: s(103), right: s(16),
        width: s(40), height: s(1.5),
        backgroundColor: 'rgba(250,251,246,0.75)',
        borderRadius: s(1),
        transform: [{ rotate: '2deg' }],
      }} />

    </View>
  );
}
