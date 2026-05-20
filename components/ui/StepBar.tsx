import { MotiView } from 'moti';
import { Box } from './primitives';

interface StepBarProps {
  step: number;
  total?: number;
}

export function StepBar({ step, total = 4 }: StepBarProps) {
  return (
    <Box flexDirection="row" gap="xs" paddingHorizontal="lg" marginBottom="lg">
      {Array.from({ length: total }, (_, i) => (
        <MotiView
          key={i}
          animate={{ backgroundColor: i < step ? '#49c9d5' : 'rgba(73,201,213,0.2)' }}
          transition={{ type: 'timing', duration: 300 }}
          style={{ flex: 1, height: 4, borderRadius: 2 }}
        />
      ))}
    </Box>
  );
}
