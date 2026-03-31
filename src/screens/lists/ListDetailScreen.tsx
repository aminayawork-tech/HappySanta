// ─────────────────────────────────────────────────────────────
// HappySanta — List Detail Screen
// Shows all gift items with prices, progress, and actions.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useListsStore }      from '@/store/listsStore';
import { useRecipientsStore } from '@/store/recipientsStore';
import { GiftItemRow }        from '@/components/lists/GiftItemRow';
import { BudgetProgress }     from '@/components/lists/BudgetProgress';
import { COLORS, FONTS }      from '@/utils/constants';
import { formatPrice }        from '@/utils/helpers';
import type { GiftItem }      from '@/types';

type RouteParams = { listId: string };

export function ListDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { listId } = route.params;

  const {
    getListById,
    activeListItems,
    subscribeToItems,
    updateItemStatus,
    removeItem,
    refreshItemPrice,
  } = useListsStore();
  const { getById } = useRecipientsStore();

  const [refreshing, setRefreshing] = useState(false);

  const list = getListById(listId);
  const recipient = list?.recipientId ? getById(list.recipientId) : null;

  useEffect(() => {
    const unsub = subscribeToItems(listId);
    return unsub;
  }, [listId]);

  const boughtItems = activeListItems.filter((i) => i.status === 'bought' || i.status === 'gifted');
  const savedItems  = activeListItems.filter((i) => i.status === 'saved' || i.status === 'suggested');
  const totalSpent  = boughtItems.reduce((sum, i) => sum + (i.amazonPrice ?? i.estimatedPriceMax), 0);

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      await Promise.all(
        activeListItems
          .filter((i) => i.asin)
          .map((i) => refreshItemPrice(listId, i)),
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!list?.shareToken) return;
    await Share.share({
      title:   `${list.title} — HappySanta`,
      message: `Check out my Christmas wish list! 🎄\nhttps://happysanta.app/list/${list.shareToken}`,
      url:     `https://happysanta.app/list/${list.shareToken}`,
    });
  };

  const handleDeleteItem = (item: GiftItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.title}" from this list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(listId, item.id) },
      ],
    );
  };

  const renderItem: ListRenderItem<GiftItem> = ({ item }) => (
    <GiftItemRow
      item={item}
      onPress={() => navigation.navigate('ProductDetail', { item, listId })}
      onMarkBought={() =>
        updateItemStatus(listId, item.id, item.status === 'bought' ? 'saved' : 'bought')
      }
      onDelete={() => handleDeleteItem(item)}
    />
  );

  if (!list) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgDark, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.textSecondary }}>List not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.bgMidnight, COLORS.bgDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Ionicons name="share-outline" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('AISuggestions', { listId })}
                style={styles.aiBtn}
              >
                <LinearGradient
                  colors={[COLORS.santaRed, '#8B0000']}
                  style={styles.aiBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.aiBtnText}>🤖 AI Suggest</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* List summary */}
          <View style={styles.summary}>
            <Text style={styles.recipientAvatar}>{recipient?.avatarEmoji ?? '🎁'}</Text>
            <View>
              <Text style={styles.listTitle}>{list.title}</Text>
              <Text style={styles.listMeta}>
                Budget: {formatPrice(list.budget)} • {activeListItems.length} items
              </Text>
            </View>
          </View>

          {/* Budget progress */}
          <BudgetProgress budget={list.budget} spent={totalSpent} />
        </SafeAreaView>
      </LinearGradient>

      {/* Items */}
      <FlatList
        data={activeListItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefreshPrices}
            tintColor={COLORS.santaRed}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤖</Text>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyBody}>Tap "AI Suggest" to get HappySanta to build this list!</Text>
          </View>
        }
        ListHeaderComponent={
          activeListItems.length > 0 ? (
            <View style={styles.statsBar}>
              <StatBadge label="Saved" count={savedItems.length} color={COLORS.gold} />
              <StatBadge label="Bought" count={boughtItems.length} color={COLORS.forestGreen} />
              <StatBadge label="Spent" count={formatPrice(totalSpent)} color={COLORS.santaRed} />
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number | string; color: string }) {
  return (
    <View style={[statStyles.badge, { borderColor: color + '40' }]}>
      <Text style={[statStyles.count, { color }]}>{count}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  badge: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1 },
  count: { fontFamily: FONTS.bodyBold, fontSize: 16 },
  label: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
});

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgDark },
  header:          { paddingBottom: 20 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:         { padding: 4 },
  headerActions:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn:       { padding: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  aiBtn:           { borderRadius: 10, overflow: 'hidden' },
  aiBtnGradient:   { paddingVertical: 8, paddingHorizontal: 14 },
  aiBtnText:       { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 13 },
  summary:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, marginBottom: 16 },
  recipientAvatar: { fontSize: 40 },
  listTitle:       { fontFamily: FONTS.christmas, fontSize: 20, color: COLORS.textPrimary },
  listMeta:        { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  list:            { paddingHorizontal: 16, paddingTop: 12 },
  statsBar:        { flexDirection: 'row', gap: 8, marginBottom: 12 },
  empty:           { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji:      { fontSize: 56, marginBottom: 12 },
  emptyTitle:      { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 18, marginBottom: 8 },
  emptyBody:       { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
