import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';

export default function ParentVerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <OnboardingHeader step={2} totalSteps={4} role="OUDER" />
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="mail-outline" size={52} color={Colors.primary} />
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>Check je inbox</Text>
        <Text style={styles.description}>
          We hebben een bevestigingslink{'\n'}gestuurd naar{'\n'}
          <Text style={styles.email}>jan@voorbeeld.be</Text>
        </Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>of</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.resendLink}>Geen e-mail ontvangen? Stuur opnieuw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconBox: {
    width: 104,
    height: 104,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.surface,
    borderRadius: 11,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 28,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
  },
  resendLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
