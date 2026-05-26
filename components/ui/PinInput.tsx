import { useRef, useState } from 'react';
import { TextInput, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

interface Props {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export function PinInput({ value, onChange, length = 4, autoFocus = false, onBlur: onBlurProp }: Props) {
  const inputRef = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={{ position: 'relative' }}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, length))}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlurProp?.(); }}
          maxLength={length}
          keyboardType="number-pad"
          caretHidden
          autoFocus={autoFocus}
          style={styles.overlayInput}
        />
        <Box flexDirection="row" gap="sm" pointerEvents="none">
          {Array.from({ length }).map((_, i) => (
            <MotiView
              key={i}
              animate={{
                borderColor: i < value.length
                  ? PRIMARY
                  : (i === value.length && focused ? PRIMARY : primaryAlpha(0.25)),
                backgroundColor: i < value.length
                  ? primaryAlpha(0.08)
                  : 'rgba(255,255,255,0.7)',
              }}
              transition={{ type: 'timing', duration: 150 }}
              style={styles.box}
            >
              <Text style={styles.digit}>{value[i] ?? ''}</Text>
            </MotiView>
          ))}
        </Box>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  box: {
    flex: 1, height: 64, borderRadius: 14,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  digit: { fontSize: 24, fontWeight: '700', color: '#1a1918', textAlign: 'center' },
});
