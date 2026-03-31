// ─────────────────────────────────────────────────────────────
// HappySanta — Home Screen
// Dashboard: greeting, Christmas countdown, quick stats,
// recent lists, and quick-action buttons.
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore }      from '@/store/authStore';
import { useListsStore }     from '@/store/listsStore';
import { useRecipientsStore }from '@/store/recipientsStore';
import { SnowAnimation }     from '@/components/common/SnowAnimation';
import { ListCard }          from '@/components/lists/ListCard';
import { COLORS, FONTS }     from '@/utils/constants';
import { daysUntilChristmas, formatPrice } from '@/utils/helpers';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { lists, fetchLists, isLoading } = useListsStore();
  const { recipients } = useRecipientsStore();

  const days = daysUntilChristmas();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Santa';

  // Stats
  const totalBudget = lists.reduce((sum, l) => sum + l.budget, 0);
  const totalItems  = lists.reduce((sum, l) => sum + (l.items?.length ?? 0), 0);

  const refresh = async () => {
    if (user) await fetchLists(user.uid);
  };

  useEffect(() => {
    if (user) fetchLists(user.uid);
  }, [user]);

  const recentLists = lists.slice(0, 3);

  return (
    <View style={styles.container}>
      <SnowAnimation />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={COLORS.santaRed}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.bgMidnight, COLORS.bgDark]}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Ho ho ho, {firstName}! 🎅</Text>
                <Text style={styles.subGreeting}>Your Christmas HQ</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notifBtn}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Christmas countdown card */}
            <View style={styles.countdownCard}>
              <LinearGradient
                colors={[COLORS.santaRed, '#8B0000']}
                style={styles.countdownGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.countdownEmoji}>🎄</Text>
                <View>
                  <Text style={styles.countdownLabel}>Days until Christmas</Text>
                  <Text style={styles.countdownNumber}>
                    {days === 0 ? "🎁 Today!" : days.toString()}
                  </Text>
                </View>
                <View style={styles.countdownSnow}>
                  <Text style={{ fontSize: 28 }}>❄️</Text>
                </View>
              </LinearGradient>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="people" label="Recipients" value={recipients.length.toString()} color={COLORS.forestGreen} />
          <StatCard icon="gift"   label="Lists"       value={lists.length.toString()}       color={COLORS.santaRed}   />
          <StatCard icon="pricetag" label="Budgeted"  value={formatPrice(totalBudget)}      color={COLORS.gold}       />
        </View>

        {/* Quick actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          <QuickActionBtn
            icon="person-add"
            label="Add Recipient"
            color={COLORS.forestGreen}
            onPress={() => navigation.navigate('AddRecipient')}
          />
          <QuickActionBtn
            icon="add-circle"
            label="New List"
            color={COLORS.santaRed}
            onPress={() => navigation.navigate('CreateList')}
          />
          <QuickActionBtn
            icon="settings"
            label="Settings"
            color={COLORS.textMuted}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Recent lists */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Lists</Text>
          {lists.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Lists')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentLists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyTitle}>No lists yet!</Text>
            <Text style={styles.emptyBody}>
              Add a recipient and create your first Christmas list.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('CreateList')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.santaRed, '#8B0000']}
                style={styles.emptyBtnGradient}
              >
                <Text style={styles.emptyBtnText}>🎄 Create First List</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listCards}>
            {recentLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onPress={() => navigation.navigate('ListDetail', { listId: list.id })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[statStyles.card, { borderColor: color + '40' }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function QuickActionBtn({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={qaStyles.btn} onPress={onPress} activeOpacity={0.8}>
      <View style={[qaStyles.iconCircle, { backgroundColor: color + '20', borderColor: color + '50' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={qaStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bgDark },
  header:         { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 12, marginBottom: 16 },
  greeting:       { fontFamily: FONTS.christmas, fontSize: 26, color: COLORS.textPrimary },
  subGreeting:    { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  notifBtn:       { padding: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  countdownCard:  { borderRadius: 16, overflow: 'hidden', shadowColor: COLORS.santaRed, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  countdownGradient: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  countdownEmoji: { fontSize: 36 },
  countdownLabel: { fontFamily: FONTS.bodySemiBold, color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  countdownNumber:{ fontFamily: FONTS.christmas, color: '#fff', fontSize: 36 },
  countdownSnow:  { marginLeft: 'auto' },
  statsRow:       { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 20, marginBottom: 8 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionTitle:   { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 17 },
  seeAll:         { fontFamily: FONTS.bodySemiBold, color: COLORS.santaRed, fontSize: 13 },
  quickActions:   { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 8 },
  listCards:      { paddingHorizontal: 20, gap: 12 },
  emptyState:     { alignItems: 'center', paddingHorizontal: 40, paddingVertical: 32 },
  emptyEmoji:     { fontSize: 56, marginBottom: 12 },
  emptyTitle:     { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 18, marginBottom: 8 },
  emptyBody:      { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  emptyBtn:       { borderRadius: 14, overflow: 'hidden', width: '80%' },
  emptyBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  emptyBtnText:   { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 15 },
});

const statStyles = StyleSheet.create({
  card:  { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1 },
  value: { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16 },
  label: { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 11 },
});

const qaStyles = StyleSheet.create({
  btn:        { flex: 1, alignItems: 'center', gap: 8 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  label:      { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 12, textAlign: 'center' },
});
