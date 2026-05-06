import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

export default function SettingsScreen() {
  const [lieConsequence, setLieConsequence] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Instellingen</Text>

      <Text style={styles.sectionTitle}>Eerlijkheid</Text>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Gevolg voor liegen</Text>
          <Text style={styles.rowDescription}>Monster verliest kleine hoeveelheid XP</Text>
        </View>
        <Switch
          value={lieConsequence}
          onValueChange={setLieConsequence}
          trackColor={{ true: Colors.primary }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingTop: Spacing.xxl },
  header: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowText: { flex: 1, marginRight: Spacing.md },
  rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary, marginBottom: 2 },
  rowDescription: { fontSize: FontSize.sm, color: Colors.text.secondary },
});
