import { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  style?: ViewStyle;
}

export function AnimatedFloat({ children, amplitude = 7, duration = 2600, style }: Props) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(withTiming(-amplitude, { duration }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}
