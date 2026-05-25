import { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { joinFamilyByCode } from '@/services/auth';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function JoinFamilyScreen() {
  const insets = useSafeAreaInsets();
  const [parentName, setParentName] = useState('');
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput | null>(null);

  const canContinue = parentName.trim().length > 0 && code.length === 4;

  return (
    <Box flex={1} backgroundColor="background">

      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <AnimatedBlob
          size={300} color={primaryAlpha(0.13)}
          duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
          style={{ top: -60, left: -70 }}
        />
        <AnimatedBlob
          size={160} color={primaryAlpha(0.08)}
          duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
          style={{ bottom: 100, right: -50 }}
        />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={4} total={5} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 4 VAN 5 — GEZIN</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 60 }}
            style={{ marginBottom: 24 }}
          >
            <Text variant="title" marginBottom="xs">Aansluiten bij gezin</Text>
            <Text variant="subtitle">Voer de gezinscode in die je van je partner hebt gekregen.</Text>
          </MotiView>

          {/* Name card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 120 }}
            style={{ marginBottom: 12 }}
          >
            <View style={styles.formCard}>
              <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>JOUW NAAM</Text>
              <Box style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={parentName}
                  onChangeText={setParentName}
                  placeholder="Jouw naam of bijnaam"
                  placeholderTextColor="#8a8885"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </Box>
            </View>
          </MotiView>

          {/* Code card — same pattern as child invite-code */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 200 }}
          >
            <View style={styles.formCard}>
              <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>GEZINSCODE</Text>
              <Text variant="cardSub" style={{ marginBottom: 16, lineHeight: 18 }}>
                Je partner vindt deze code terug in de instellingen van het dashboard.
              </Text>

              <View style={{ position: 'relative' }}>
                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase())}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  maxLength={4}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  caretHidden
                  style={styles.overlayInput}
                />
                <Box flexDirection="row" alignItems="center" gap="sm" pointerEvents="none">
                  <Text style={styles.prefix}>TASKO–</Text>
                  <Box flexDirection="row" gap="sm" style={{ flex: 1 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <MotiView
                        key={i}
                        animate={{
                          borderColor: i < code.length
                            ? PRIMARY
                            : (i === code.length && focused ? PRIMARY : primaryAlpha(0.25)),
                          backgroundColor: i < code.length
                            ? primaryAlpha(0.08)
                            : 'rgba(255,255,255,0.7)',
                        }}
                        transition={{ type: 'timing', duration: 150 }}
                        style={styles.codeBox}
                      >
                        <Text style={styles.codeDigit}>{code[i] ?? ''}</Text>
                      </MotiView>
                    ))}
                  </Box>
                </Box>
              </View>
            </View>
          </MotiView>

          {error ? (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
              <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
            </MotiView>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 280 }}
        style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        <TouchableOpacity
          style={[styles.btnPrimary, (!canContinue || loading) && styles.btnDisabled]}
          onPress={async () => {
            setError('');
            setLoading(true);
            try {
              const familyName = await joinFamilyByCode(`TASKO-${code}`, parentName.trim());
              router.push({
                pathname: '/(onboarding)/parent/success',
                params: { parentName: parentName.trim(), familyName, inviteCode: '', joined: 'true' },
              });
            } catch (e: any) {
              setError(e.message ?? 'Er is iets misgegaan. Probeer opnieuw.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={!canContinue || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#e8e5dd" />
            : <Text variant="btnPrimary">Aansluiten</Text>}
        </TouchableOpacity>
      </MotiView>

    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 16 },
  formCard: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  inputBox: {
    height: 50, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12, borderWidth: 1.5, borderColor: primaryAlpha(0.3),
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 14, color: '#1a1918', padding: 0 },
  prefix: { fontSize: 18, fontWeight: '700', color: '#1a1918' },
  codeBox: {
    flex: 1, height: 60, borderRadius: 14,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  codeDigit: { fontSize: 22, fontWeight: '700', color: '#1a1918', textAlign: 'center' },
  overlayInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
