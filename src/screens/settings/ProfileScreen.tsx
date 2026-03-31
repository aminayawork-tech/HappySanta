// ─────────────────────────────────────────────────────────────
// HappySanta — Profile Tab Screen
// Simple profile with navigation to Settings.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore }  from '@/store/authStore';
import { useListsStore } from '@/store/listsStore';
import { COLORS, FONTS } from '@/utils/constants';
import { formatPrice }   from '@/utils/helpers';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { lists } = useListsStore();

  const totalBudget   = lists.reduce((sum, l) => sum + l.budget, 0);
  const completedLists = lists.filter((l) => l.status === 'complete').length;

  const firstName = user?.displayName?.split(' ')[0] ?? 'Santa';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgMidnight, COLORS.bgDark]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🎅</Text>
            </View>
            <Text style={styles.name}>{user?.displayName ?? 'Santa Claus'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard emoji="🎁" label="Lists" value={lists.length} />
          <StatCard emoji="✅" label="Completed" value={completedLists} />
          <StatCard emoji="💰" label="Budgeted" value={formatPrice(totalBudget)} />
        </View>

        {/* Quick links */}
        <View style={styles.menu}>
          <MenuRow
            icon="settings-outline"
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <MenuRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {}}
          />
          <MenuRow
            icon="star-outline"
            label="Rate HappySanta 🎄"
            onPress={() => {}}
            highlight
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: number | string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  highlight,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={highlight ? COLORS.santaRed : COLORS.textSecondary} />
      <Text style={[menuStyles.label, highlight && { color: COLORS.santaRed }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const statStyles = StyleSheet.create({
  card:  { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  emoji: { fontSize: 24, marginBottom: 2 },
  value: { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16 },
  label: { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 11 },
});

const menuStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  label: { flex: 1, fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 15 },
});

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bgDark },
  headerGradient: { paddingBottom: 24 },
  headerContent:  { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  avatar:         { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(196,30,58,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'rgba(196,30,58,0.4)' },
  avatarEmoji:    { fontSize: 40 },
  name:           { fontFamily: FONTS.christmas, fontSize: 24, color: COLORS.textPrimary, marginBottom: 4 },
  email:          { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13 },
  scroll:         { paddingHorizontal: 20, paddingTop: 16 },
  statsRow:       { flexDirection: 'row', gap: 10, marginBottom: 20 },
  menu:           { backgroundColor: COLORS.bgCard, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
});
