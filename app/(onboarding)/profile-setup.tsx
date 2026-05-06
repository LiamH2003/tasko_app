import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={16} color={Colors.primary} />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Wie ben jij?</Text>
        <Text style={styles.subtitle}>
          Kies je rol zodat we Tasko goed voor je kunnen instellen.
        </Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(onboarding)/parent/account')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="person-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Ik ben een ouder</Text>
              <Text style={styles.cardSub}>Ik wil Tasko instellen voor mijn kind</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(onboarding)/child/invite-code')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="happy-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Ik ben een kind</Text>
              <Text style={styles.cardSub}>Mijn ouder heeft een code voor mij klaar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 32) }]}>
        <Text style={styles.loginText}>
          Al een account?{' '}
          <Text style={styles.loginLink}>Log in</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  loginText: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});
