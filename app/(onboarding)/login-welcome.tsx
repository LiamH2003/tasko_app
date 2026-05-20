import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const OPTIONS = [
  {
    key: 'parent',
    title: 'Ouder',
    description: 'Log in met e-mail en wachtwoord',
    icon: 'person-outline' as const,
    route: '/(onboarding)/parent/login' as const,
  },
  {
    key: 'child',
    title: 'Kind',
    description: 'Log in met je gezinscode',
    icon: 'people-outline' as const,
    route: '/(onboarding)/child/login' as const,
  },
];

export default function LoginWelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={18} color={Colors.primary} />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Welkom terug</Text>
        <Text style={styles.subtitle}>Wie wil er inloggen?</Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.card}
              onPress={() => router.push(opt.route)}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconWrap}>
                <Ionicons name={opt.icon} size={22} color={Colors.primary} />
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
        style={styles.registerRow}
        onPress={() => router.push('/(onboarding)/role-select')}
        activeOpacity={0.7}
      >
        <Text style={styles.registerText}>
          Nog geen account?{' '}
          <Text style={styles.registerLink}>Maak er één aan</Text>
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backText: { fontSize: FontSize.md, color: Colors.primary },

  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.text.secondary, marginBottom: Spacing.xl },

  options: { gap: Spacing.md },

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
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  cardDescription: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },

  registerRow: { alignItems: 'center', paddingBottom: Spacing.lg },
  registerText: { fontSize: FontSize.sm, color: Colors.text.muted },
  registerLink: { color: Colors.primary, fontWeight: FontWeight.medium },
});
