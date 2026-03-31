// ─────────────────────────────────────────────────────────────
// HappySanta — Lists Screen
// Tabbed: All / This Year / Past lists
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore }   from '@/store/authStore';
import { useListsStore }  from '@/store/listsStore';
import { ListCard }       from '@/components/lists/ListCard';
import { COLORS, FONTS, CURRENT_YEAR } from '@/utils/constants';
import type { GiftList }  from '@/types';

type Tab = 'all' | 'this_year' | 'past';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All Lists' },
  { key: 'this_year', label: `🎄 ${CURRENT_YEAR}` },
  { key: 'past',      label: 'Past' },
];

export function ListsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { lists, subscribe } = useListsStore();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribe(user.uid);
    return unsub;
  }, [user]);

  const filteredLists: GiftList[] = lists.filter((l) => {
    if (activeTab === 'this_year') return l.year === CURRENT_YEAR;
    if (activeTab === 'past')      return l.year < CURRENT_YEAR;
    return true;
  });

  const renderItem: ListRenderItem<GiftList> = ({ item }) => (
    <ListCard
      list={item}
      onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.bgMidnight }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gift Lists 🎁</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateList')}
          >
            <LinearGradient colors={[COLORS.santaRed, '#8B0000']} style={styles.addBtnGradient}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>New List</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <FlatList
        data={filteredLists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎄</Text>
            <Text style={styles.emptyTitle}>No lists yet!</Text>
            <Text style={styles.emptyBody}>
              Create your first Christmas gift list and let HappySanta AI suggest perfect gifts.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateList')}
              style={styles.emptyBtn}
            >
              <LinearGradient colors={[COLORS.santaRed, '#8B0000']} style={styles.emptyBtnGradient}>
                <Text style={styles.emptyBtnText}>🤖 Create List with AI</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgDark },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title:           { fontFamily: FONTS.christmas, fontSize: 26, color: COLORS.textPrimary },
  addBtn:          { borderRadius: 10, overflow: 'hidden' },
  addBtnGradient:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 14 },
  addBtnText:      { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 14 },
  tabs:            { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  tab:             { flex: 1, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  tabActive:       { backgroundColor: 'rgba(196,30,58,0.15)', borderColor: COLORS.santaRed },
  tabText:         { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 13 },
  tabTextActive:   { color: COLORS.santaRed },
  list:            { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  empty:           { alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyEmoji:      { fontSize: 64, marginBottom: 12 },
  emptyTitle:      { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 18, marginBottom: 8 },
  emptyBody:       { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  emptyBtn:        { borderRadius: 14, overflow: 'hidden', width: '80%' },
  emptyBtnGradient:{ paddingVertical: 14, alignItems: 'center' },
  emptyBtnText:    { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 15 },
});
