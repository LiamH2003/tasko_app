import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const OPTIONS = [
  {
    key: 'parent',
    title: 'Ik ben een ouder',
    description: 'Ik wil Tasko instellen voor mijn kind',
    icon: <Ionicons name="person-outline" size={22} color={Colors.primary} />,
    route: '/(onboarding)/parent/account' as const,
  },
  {
    key: 'child',
    title: 'Ik ben een kind',
    description: 'Mijn ouder heeft een code voor mij klaar',
    icon: (
      <Image
        source={require('@/assets/images/mascot.svg')}
        style={{ width: 22, height: 22 }}
        contentFit="contain"
      />
    ),
    route: '/(onboarding)/child/invite-code' as const,
  },
];

export default function RoleSelectScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={18} color={Colors.primary} />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Wie ben jij?</Text>
        <Text style={styles.subtitle}>
          Kies je rol zodat we Tasko goed voor je kunnen instellen.
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.card}
              onPress={() => router.push(opt.route)}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconWrap}>
                {opt.icon}
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{opt.title}</Text>
                <Text style={styles.cardDescription}>{opt.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.loginRow}
        onPress={() => router.push('/(onboarding)/login-welcome')}
        activeOpacity={0.7}
      >
        <Text style={styles.loginText}>
          Al een account?{' '}
          <Text style={styles.loginLink}>Log in</Text>
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.regular,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },

  options: {
    gap: Spacing.md,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  cardDescription: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginTop: 2,
    lineHeight: 18,
  },

  loginRow: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
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
