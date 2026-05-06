import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { Button } from '@/components/ui/Button';

type MonsterDef = {
  id: string;
  name: string;
  description: string;
  trait: string;
  traitIcon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const MONSTERS: MonsterDef[] = [
  {
    id: 'blub',
    name: 'Blub',
    description: 'Zacht en rustig — altijd er voor jou',
    trait: 'Kalm',
    traitIcon: 'heart-outline',
    color: '#49c9d5',
  },
  {
    id: 'flams',
    name: 'Flams',
    description: 'Energiek en vol vuur — super enthousiast!',
    trait: 'Energiek',
    traitIcon: 'flame-outline',
    color: '#e8743c',
  },
  {
    id: 'mossy',
    name: 'Mossy',
    description: 'Van de natuur — rustig en betrouwbaar',
    trait: 'Rustig',
    traitIcon: 'leaf-outline',
    color: '#4a9e5c',
  },
  {
    id: 'sunni',
    name: 'Sunni',
    description: 'Vrolijk en stralend — brengt zon in je dag!',
    trait: 'Vrolijk',
    traitIcon: 'sunny-outline',
    color: '#f6c644',
  },
];

export default function MonsterSelectScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const canContinue = selectedId !== null;

  return (
    <View style={styles.container}>
      <OnboardingHeader step={3} totalSteps={4} role="KIND" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kies jouw Tasko!</Text>
        <Text style={styles.subtitle}>Dit is jouw Tasko. Hij groeit mee met jou!</Text>

        <View style={styles.grid}>
          {MONSTERS.map((m) => {
            const selected = selectedId === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => setSelectedId(m.id)}
                activeOpacity={0.8}
              >
                {selected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                  </View>
                )}
                <View style={[styles.monsterAvatar, { backgroundColor: m.color + '33' }]}>
                  <Image
                    source={require('@/assets/images/mascot.svg')}
                    style={styles.monsterImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={[styles.monsterName, selected && styles.monsterNameSelected]}>
                  {m.name}
                </Text>
                <Text style={styles.monsterDesc}>{m.description}</Text>
                <View style={[styles.traitChip, { backgroundColor: m.color + '22' }]}>
                  <Ionicons name={m.traitIcon} size={12} color={m.color} />
                  <Text style={[styles.traitText, { color: m.color }]}>{m.trait}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.nicknameLabel}>Hoe wil je dat Tasko noemt?</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Geef jouw Tasko een bijnaam"
          placeholderTextColor={Colors.text.muted}
          maxLength={20}
        />

        <Button
          label="Kies deze Tasko"
          onPress={() => router.push('/(onboarding)/child/welcome')}
          disabled={!canContinue}
        />
        <Text style={styles.hint}>Je kan dit later altijd veranderen in instellingen</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  monsterAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  monsterImage: {
    width: 56,
    height: 56,
  },
  monsterName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  monsterNameSelected: {
    color: Colors.primary,
  },
  monsterDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  traitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  traitText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  nicknameLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    marginBottom: 20,
  },
  hint: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 12,
  },
});
