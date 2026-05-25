import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Box, Text } from '@/components/ui/primitives';
import { BackButton } from '@/components/ui/BackButton';
import { StepBar } from '@/components/ui/StepBar';
import { AnimatedBlob } from '@/components/ui/AnimatedBlob';
import { createChildWithCode } from '@/services/children';
import { saveParentProfile } from '@/services/auth';
import { PRIMARY, primaryAlpha } from '@/constants/palette';

export default function ParentFamilySetupScreen() {
  const insets = useSafeAreaInsets();
  const [parentName, setParentName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canContinue = parentName.trim().length > 0 && familyName.trim().length > 0;

  return (
    <Box flex={1} backgroundColor="background">

      <AnimatedBlob
        size={300} color={primaryAlpha(0.13)}
        duration={3500} opacityFrom={0.65} opacityTo={1} scaleTarget={1.12}
        style={{ top: -60, left: -70 }}
      />
      <AnimatedBlob
        size={180} color={primaryAlpha(0.09)}
        duration={2700} delay={600} opacityFrom={0.35} opacityTo={0.65} scaleTarget={1.07}
        style={{ bottom: 100, right: -50 }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box style={{ height: insets.top + 16 }} />
        <BackButton />
        <Box style={{ height: 12 }} />
        <StepBar step={3} total={4} />
        <Text variant="label" style={{ paddingHorizontal: 24, marginBottom: 12 }}>STAP 3 VAN 4 — GEZIN</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Heading */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 340, delay: 60 }}
            style={{ marginBottom: 24 }}
          >
            <Text variant="title" marginBottom="xs">Even kennismaken</Text>
            <Text variant="subtitle">Snel twee vragen, dan kunnen we beginnen.</Text>
          </MotiView>

          {/* Form card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 140 }}
          >
            <View style={styles.formCard}>

              <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>JOUW NAAM</Text>
              <Box style={[styles.inputBox, { marginBottom: 16 }]}>
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

              <Text variant="label" marginBottom="sm" style={{ color: '#6b6560' }}>NAAM VAN JE GEZIN</Text>
              <Box style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder="bijv. Familie Janssen"
                  placeholderTextColor="#8a8885"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                />
              </Box>

            </View>
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pinned footer — outside KAV so it doesn't jump */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 340, delay: 260 }}
        style={{ paddingHorizontal: 24, gap: 12, paddingBottom: Math.max(insets.bottom + 10, 24) }}
      >
        {error ? (
          <Text variant="errorText" style={{ textAlign: 'center' }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, (!canContinue || loading) && styles.btnDisabled]}
          onPress={async () => {
            setError('');
            setLoading(true);
            try {
              const [child] = await Promise.all([
                createChildWithCode(familyName.trim()),
                saveParentProfile(parentName.trim(), familyName.trim()),
              ]);
              router.push({
                pathname: '/(onboarding)/parent/success',
                params: {
                  parentName: parentName.trim(),
                  familyName: familyName.trim(),
                  inviteCode: child.invite_code ?? '',
                },
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
            : <Text variant="btnPrimary">Verder</Text>}
        </TouchableOpacity>
      </MotiView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, flexGrow: 1 },
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
  btnPrimary: {
    height: 52, backgroundColor: PRIMARY, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
});
