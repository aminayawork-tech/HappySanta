// ─────────────────────────────────────────────────────────────
// HappySanta — Product Detail Screen (Modal)
// Full product view with price history chart, affiliate link,
// and delivery address pre-fill.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useListsStore }      from '@/store/listsStore';
import { useRecipientsStore } from '@/store/recipientsStore';
import { PriceHistoryChart }  from '@/components/common/PriceHistoryChart';
import { COLORS, FONTS }      from '@/utils/constants';
import { formatPrice, formatDate, isValidEmail } from '@/utils/helpers';
import { isAtAllTimeLow }     from '@/services/keepa/keepaApi';
import { saveGiftItem }       from '@/services/firebase/firestore';
import type { GiftItem }      from '@/types';

type RouteParams = { item: GiftItem; listId: string };

export function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { item: initialItem, listId } = route.params;

  const { activeListItems, refreshItemPrice, updateItemStatus } = useListsStore();
  const { getById }       = useRecipientsStore();

  // Use live item from store if available (for real-time price updates)
  const liveItem = activeListItems.find((i) => i.id === initialItem.id) ?? initialItem;
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(liveItem.priceAlertEnabled);

  const isATL = liveItem.allTimeLow != null && liveItem.amazonPrice != null
    ? isAtAllTimeLow(liveItem.amazonPrice, liveItem.allTimeLow)
    : false;

  useEffect(() => {
    refreshItemPrice(listId, liveItem);
  }, []);

  const togglePriceAlert = async (enabled: boolean) => {
    setPriceAlertEnabled(enabled);
    await saveGiftItem(listId, { ...liveItem, priceAlertEnabled: enabled });
  };

  const handleBuyOnAmazon = async () => {
    const url = liveItem.amazonUrl;
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Cannot open link', url);
    }
  };

  const handleShipToRecipient = () => {
    // Pre-fill the Amazon address by showing the address for copy
    const listFromStore = useListsStore.getState().getListById(listId);
    const recipient = listFromStore?.recipientId
      ? useRecipientsStore.getState().getById(listFromStore.recipientId)
      : null;

    if (!recipient?.address) {
      Alert.alert(
        'No Delivery Address',
        `No address saved for ${recipient?.name ?? 'this recipient'}. Would you like to add one?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Address',
            onPress: () =>
              navigation.navigate('AddRecipient', { recipientId: listFromStore?.recipientId }),
          },
        ],
      );
      return;
    }

    const addr = recipient.address;
    const formatted = `${addr.fullName}\n${addr.line1}${addr.line2 ? '\n' + addr.line2 : ''}\n${addr.city}, ${addr.state} ${addr.zipCode}\n${addr.country}`;

    Alert.alert(
      `Ship to ${recipient.name}`,
      `When buying on Amazon, select "Ship as Gift" and enter:\n\n${formatted}`,
      [
        { text: 'Got it', style: 'default' },
        { text: 'Buy on Amazon', onPress: handleBuyOnAmazon },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{liveItem.title}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Product image */}
          {liveItem.amazonImageUrl ? (
            <Image
              source={{ uri: liveItem.amazonImageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 48 }}>🎁</Text>
            </View>
          )}

          {/* ATL badge */}
          {isATL && (
            <View style={styles.atlBadge}>
              <Text style={styles.atlText}>🎉 ALL-TIME LOW PRICE!</Text>
            </View>
          )}

          {/* Price block */}
          <View style={styles.priceBlock}>
            <View>
              <Text style={styles.currentPriceLabel}>Current Price</Text>
              <Text style={styles.currentPrice}>
                {liveItem.amazonPrice != null
                  ? formatPrice(liveItem.amazonPrice)
                  : formatPrice(liveItem.estimatedPriceMax)}
              </Text>
            </View>
            {liveItem.allTimeLow != null && (
              <View style={styles.atlInfo}>
                <Text style={styles.atlInfoLabel}>All-Time Low</Text>
                <Text style={styles.atlInfoPrice}>{formatPrice(liveItem.allTimeLow)}</Text>
                {liveItem.allTimeLowDate && (
                  <Text style={styles.atlDate}>{formatDate(liveItem.allTimeLowDate)}</Text>
                )}
              </View>
            )}
          </View>

          {/* AI Reason */}
          <View style={styles.reasonCard}>
            <Text style={styles.reasonLabel}>🎅 Why HappySanta chose this:</Text>
            <Text style={styles.reasonText}>{liveItem.aiReason}</Text>
          </View>

          {/* Amazon product details */}
          {liveItem.amazonTitle && (
            <View style={styles.amazonCard}>
              <Text style={styles.amazonTitle} numberOfLines={3}>{liveItem.amazonTitle}</Text>
              {liveItem.amazonRating != null && (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingStars}>{'⭐'.repeat(Math.round(liveItem.amazonRating))}</Text>
                  <Text style={styles.ratingText}>
                    {liveItem.amazonRating.toFixed(1)}
                    {liveItem.amazonReviewCount != null
                      ? ` (${liveItem.amazonReviewCount.toLocaleString()} reviews)`
                      : ''}
                  </Text>
                </View>
              )}
              {liveItem.amazonIsPrime && (
                <View style={styles.primeBadge}>
                  <Text style={styles.primeText}>✓ Prime eligible</Text>
                </View>
              )}
            </View>
          )}

          {/* Price history chart */}
          {liveItem.priceHistory && liveItem.priceHistory.length > 2 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>📈 Price History</Text>
              <PriceHistoryChart data={liveItem.priceHistory} allTimeLow={liveItem.allTimeLow} />
            </View>
          )}

          {/* Price alert toggle */}
          <View style={styles.alertToggle}>
            <View>
              <Text style={styles.alertLabel}>🔔 All-Time Low Alert</Text>
              <Text style={styles.alertSub}>
                Get notified when this hits its cheapest-ever price
              </Text>
            </View>
            <Switch
              value={priceAlertEnabled}
              onValueChange={togglePriceAlert}
              trackColor={{ false: COLORS.bgInput, true: COLORS.santaRed + '80' }}
              thumbColor={priceAlertEnabled ? COLORS.santaRed : COLORS.textMuted}
            />
          </View>

          {/* Mark bought */}
          <TouchableOpacity
            style={styles.boughtToggle}
            onPress={() =>
              updateItemStatus(listId, liveItem.id, liveItem.status === 'bought' ? 'saved' : 'bought')
            }
          >
            <Ionicons
              name={liveItem.status === 'bought' ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={liveItem.status === 'bought' ? COLORS.success : COLORS.textMuted}
            />
            <Text style={[styles.boughtText, liveItem.status === 'bought' && { color: COLORS.success }]}>
              {liveItem.status === 'bought' ? 'Marked as Bought ✓' : 'Mark as Bought'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom action buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.shipBtn}
            onPress={handleShipToRecipient}
            activeOpacity={0.85}
          >
            <Ionicons name="location-outline" size={18} color={COLORS.textPrimary} />
            <Text style={styles.shipBtnText}>Ship as Gift</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={handleBuyOnAmazon}
            activeOpacity={0.85}
            disabled={!liveItem.amazonUrl}
          >
            <LinearGradient
              colors={[COLORS.santaRed, '#8B0000']}
              style={styles.buyBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyBtnText}>🛒 Buy on Amazon</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgCard },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  closeBtn:        { padding: 4 },
  headerTitle:     { flex: 1, fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16, marginHorizontal: 12 },
  scroll:          { paddingBottom: 20 },
  productImage:    { width: '100%', height: 280, backgroundColor: '#fff', marginBottom: 16 },
  imagePlaceholder:{ height: 200, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  atlBadge:        { marginHorizontal: 16, backgroundColor: COLORS.gold, borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginBottom: 12 },
  atlText:         { fontFamily: FONTS.bodyBold, color: COLORS.bgDark, fontSize: 14 },
  priceBlock:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 16 },
  currentPriceLabel: { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13, marginBottom: 4 },
  currentPrice:    { fontFamily: FONTS.christmas, color: COLORS.textPrimary, fontSize: 36 },
  atlInfo:         { alignItems: 'flex-end' },
  atlInfoLabel:    { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 12, marginBottom: 2 },
  atlInfoPrice:    { fontFamily: FONTS.bodyBold, color: COLORS.forestGreen, fontSize: 18 },
  atlDate:         { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11 },
  reasonCard:      { marginHorizontal: 16, backgroundColor: 'rgba(196,30,58,0.08)', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(196,30,58,0.2)' },
  reasonLabel:     { fontFamily: FONTS.bodyBold, color: COLORS.santaRed, fontSize: 13, marginBottom: 6 },
  reasonText:      { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  amazonCard:      { marginHorizontal: 16, backgroundColor: COLORS.bgDark, borderRadius: 12, padding: 14, marginBottom: 12 },
  amazonTitle:     { fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 14, lineHeight: 22, marginBottom: 8 },
  ratingRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ratingStars:     { fontSize: 14 },
  ratingText:      { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13 },
  primeBadge:      { backgroundColor: 'rgba(0,120,200,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  primeText:       { fontFamily: FONTS.bodySemiBold, color: '#0078C8', fontSize: 12 },
  chartSection:    { marginHorizontal: 16, marginBottom: 12 },
  chartTitle:      { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 15, marginBottom: 10 },
  alertToggle:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, backgroundColor: COLORS.bgDark, borderRadius: 12, padding: 14, marginBottom: 10 },
  alertLabel:      { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 14 },
  alertSub:        { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  boughtToggle:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, paddingVertical: 12 },
  boughtText:      { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 15 },
  bottomActions:   { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  shipBtn:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 18, backgroundColor: COLORS.bgInput, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  shipBtnText:     { fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 14 },
  buyBtn:          { flex: 1, borderRadius: 14, overflow: 'hidden', shadowColor: COLORS.santaRed, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  buyBtnGradient:  { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  buyBtnText:      { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 16 },
});
