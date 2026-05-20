import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { signIn } from '@/services/auth';
import { signInWithProvider } from '@/services/oauth';

export default function ParentLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  const canLogin = email.includes('@') && password.length >= 1;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // Auth listener in store triggers → _layout.tsx redirects to /(parent)
    } catch (e: any) {
      setError(e.message ?? 'Inloggen mislukt. Controleer je gegevens.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setError('');
    setSocialLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch (e: any) {
      setError(e.message ?? 'Inloggen mislukt. Probeer opnieuw.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Log in als ouder</Text>
          <Text style={styles.subtitle}>Welkom terug. Kies hoe je wilt inloggen.</Text>

          {/* Social buttons */}
          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => handleSocialLogin('google')}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === 'google'
              ? <ActivityIndicator color={Colors.text.primary} size="small" style={styles.socialIcon} />
              : <Image source={require('@/assets/images/icons/logo_google.svg')} style={styles.socialIcon} contentFit="contain" />}
            <Text style={styles.socialText}>Doorgaan met Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => handleSocialLogin('apple')}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === 'apple'
              ? <ActivityIndicator color={Colors.text.primary} size="small" style={styles.socialIcon} />
              : <Image source={require('@/assets/images/icons/logo_apple.svg')} style={styles.socialIcon} contentFit="contain" />}
            <Text style={styles.socialText}>Doorgaan met Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => handleSocialLogin('facebook')}
            disabled={socialLoading !== null || loading}
          >
            {socialLoading === 'facebook'
              ? <ActivityIndicator color={Colors.text.primary} size="small" style={styles.socialIcon} />
              : <Image source={require('@/assets/images/icons/logo_fb.svg')} style={styles.socialIcon} contentFit="contain" />}
            <Text style={styles.socialText}>Doorgaan met Facebook</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OF MET E-MAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <Text style={styles.label}>E-mailadres</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="jan@voorbeeld.be"
            placeholderTextColor={Colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password */}
          <Text style={styles.label}>Wachtwoord</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
              placeholder="Wachtwoord"
              placeholderTextColor={Colors.text.muted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
            <Text style={styles.forgotText}>Wachtwoord vergeten?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginBtn, (!canLogin || loading) && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!canLogin || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.background} />
              : <Text style={styles.loginBtnText}>Log in</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerRow}
            onPress={() => router.push('/(onboarding)/role-select')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>
              Nog geen account?{' '}
              <Text style={styles.registerLink}>Maak er één aan</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backText: { fontSize: FontSize.md, color: Colors.primary },

  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.text.secondary, lineHeight: 21, marginBottom: Spacing.xl },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  socialIcon: { width: 22, height: 22 },
  socialText: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.medium },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.semibold, letterSpacing: 0.5 },

  label: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium, marginBottom: Spacing.sm },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  inputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  inputFlex: { flex: 1, color: Colors.text.primary, fontSize: FontSize.md, padding: 0 },

  forgotRow: { alignItems: 'flex-end', marginBottom: Spacing.xl },
  forgotText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  errorText: { fontSize: FontSize.sm, color: Colors.status.error, textAlign: 'center', marginBottom: Spacing.sm },

  loginBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  loginBtnDisabled: { opacity: 0.4 },
  loginBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.background },

  registerRow: { alignItems: 'center', paddingTop: Spacing.sm },
  registerText: { fontSize: FontSize.sm, color: Colors.text.muted },
  registerLink: { color: Colors.primary, fontWeight: FontWeight.medium },
});
