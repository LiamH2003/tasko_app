import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

const CHILDREN = [
  { id: 'emma', name: 'Emma', avatar: '👧', age: 9, level: 4, routines: 5 },
  { id: 'luca', name: 'Luca', avatar: '👦', age: 11, level: 2, routines: 4 },
];

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

export default function ParentSettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Instellingen</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Family profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>👨‍👩‍👧‍👦</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Familie De Smedt</Text>
            <Text style={styles.profileEmail}>papa@desmedt.be</Text>
          </View>
        </View>

        {/* Access code */}
        <SectionHeader label="TOEGANGSCODE KINDEREN" />
        <View style={styles.codeCard}>
          <Text style={styles.codeInfo}>
            Kinderen voeren deze code in bij eerste aanmelding op hun toestel. Deel hem nooit met onbekenden.
          </Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>TK-8472</Text>
            <TouchableOpacity style={styles.copyBtn} activeOpacity={0.8}>
              <Text style={styles.copyBtnText}>Kopieer</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeActionBtn} activeOpacity={0.8}>
              <Ionicons name="share-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.codeActionText}>Deel via bericht</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.codeActionBtn} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.codeActionText}>Nieuwe code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription */}
        <SectionHeader label="SUBSCRIPTIE" />
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
            <View style={styles.linkIconBox}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.text.muted} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.linkLabel}>Subscriptie aanpassen</Text>
              <Text style={styles.linkSub}>Pro plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Children */}
        <SectionHeader label="KINDEREN" />
        <View style={styles.section}>
          {CHILDREN.map((child, i) => (
            <View key={child.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarEmoji}>{child.avatar}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{child.name}</Text>
                  <Text style={styles.memberSub}>{child.age} jaar · Niveau {child.level} · {child.routines} routines</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
                  <Text style={styles.editBtnText}>Bewerken</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Parents */}
        <SectionHeader label="OUDERS" />
        <View style={styles.section}>
          <View style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarEmoji}>👨</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>Jan</Text>
              <Text style={styles.memberSub}>Admin (Uw account)</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Bewerken</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium },
  navTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  // Profile
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  profileAvatar: { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.primaryDeepest, alignItems: 'center', justifyContent: 'center' },
  profileAvatarEmoji: { fontSize: 26 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  profileEmail: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },

  // Section
  sectionHeader: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.sm },
  section: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },

  // Access code
  codeCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  codeInfo: { fontSize: FontSize.xs, color: Colors.text.muted, lineHeight: 18 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md },
  codeText: { fontSize: 22, fontWeight: FontWeight.bold, color: Colors.text.primary, letterSpacing: 3 },
  copyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  copyBtnText: { fontSize: FontSize.sm, color: Colors.background, fontWeight: FontWeight.semibold },
  codeActions: { flexDirection: 'row', gap: Spacing.sm },
  codeActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.card, borderRadius: Radius.md, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  codeActionText: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },

  // Link row (subscription)
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  linkIconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  linkText: { flex: 1 },
  linkLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text.primary },
  linkSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },

  // Member row
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDeepest, alignItems: 'center', justifyContent: 'center' },
  memberAvatarEmoji: { fontSize: 20 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  memberSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  editBtn: { backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  editBtnText: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: FontWeight.medium },
});
