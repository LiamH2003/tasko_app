import { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from './primitives';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
}: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <Box marginBottom="md">
      {label ? <Text variant="label" marginBottom="sm">{label}</Text> : null}
      <Box style={[styles.inputBox, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8a8885"
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setShow(v => !v)} hitSlop={8}>
            <Ionicons
              name={show ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#8a8885"
            />
          </TouchableOpacity>
        ) : null}
      </Box>
      {error ? <Text variant="errorText" marginTop="xs">{error}</Text> : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(73,201,213,0.3)',
    paddingHorizontal: 16,
    gap: 8,
  },
  inputError: {
    borderColor: '#fc6b6b',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1918',
    padding: 0,
  },
});
