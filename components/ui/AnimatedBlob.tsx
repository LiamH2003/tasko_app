import { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withDelay,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface Props {
  size: number;
  color: string;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
  scaleTarget?: number;
  opacityFrom?: number;
  opacityTo?: number;
}

export function AnimatedBlob({
  size, color, style,
  duration = 3000, delay = 0,
  scaleTarget = 1.1, opacityFrom = 0.5, opacityTo = 1,
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(opacityFrom);

  useEffect(() => {
    const anim = withRepeat(withTiming(scaleTarget, { duration }), -1, true);
    const animOpacity = withRepeat(withTiming(opacityTo, { duration }), -1, true);
    scale.value = delay > 0 ? withDelay(delay, anim) : anim;
    opacity.value = delay > 0 ? withDelay(delay, animOpacity) : animOpacity;
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          elevation: 0,
          zIndex: 0,
        },
        style,
        animStyle,
      ]}
    />
  );
}
