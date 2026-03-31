// ─────────────────────────────────────────────────────────────
// HappySanta — Gift Item Row
// Shows a single gift item in the list with price, status,
// and action buttons.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/utils/constants';
import { formatPrice } from '@/utils/helpers';
import { isAtAllTimeLow } from '@/services/keepa/keepaApi';
import type { GiftItem } from '@/types';

interface GiftItemRowProps {
  item:         GiftItem;
  onPress:      () => void;
  onMarkBought: () => void;
  onDelete:     () => void;
}

export function GiftItemRow({ item, onPress, onMarkBought, onDelete }: GiftItemRowProps) {
  const isBought = item.status === 'bought' || item.status === 'gifted';
  const isATL    = item.amazonPrice != null && item.allTimeLow != null
    ? isAtAllTimeLow(item.amazonPrice, item.allTimeLow)
    : false;

  const displayPrice = item.amazonPrice != null
    ? formatPrice(item.amazonPrice)
    : formatPrice(item.estimatedPriceMax);

  return (
    <TouchableOpacity
      style={[styles.row, isBought && styles.rowBought]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      {item.amazonImageUrl ? (
        <Image source={{ uri: item.amazonImageUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text style={{ fontSize: 20 }}>🎁</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, isBought && styles.titleBought]} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{displayPrice}</Text>
          {isATL && <View style={styles.atlBadge}><Text style={styles.atlText}>🔥 All-time low!</Text></View>}
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, STATUS_STYLES[item.status]]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onMarkBought}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isBought ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={24}
            color={isBought ? COLORS.success : COLORS.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error + '99'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const STATUS_LABELS: Record<GiftItem['status'], string> = {
  suggested: 'Suggested',
  saved:     'On List',
  bought:    '✓ Bought',
  gifted:    '🎁 Gifted',
};

const STATUS_STYLES: Record<GiftItem['status'], object> = {
  suggested: { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.3)' },
  saved:     { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' },
  bought:    { backgroundColor: 'rgba(76,175,80,0.1)',  borderColor: 'rgba(76,175,80,0.3)' },
  gifted:    { backgroundColor: 'rgba(196,30,58,0.1)',  borderColor: 'rgba(196,30,58,0.3)' },
};

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgCard,
    borderRadius:    12,
    marginBottom:    10,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.1,
    shadowRadius:    4,
    elevation:       2,
  },
  rowBought:        { opacity: 0.65 },
  thumb:            { width: 72, height: 72, backgroundColor: '#fff' },
  thumbPlaceholder: { backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center' },
  content:          { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 5 },
  title:            { fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 14, lineHeight: 20 },
  titleBought:      { textDecorationLine: 'line-through', color: COLORS.textMuted },
  priceRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  price:            { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16 },
  atlBadge:         { backgroundColor: 'rgba(255,69,0,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  atlText:          { fontFamily: FONTS.bodySemiBold, color: '#FF4500', fontSize: 10 },
  statusBadge:      { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusText:       { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 11 },
  actions:          { flexDirection: 'column', gap: 10, paddingHorizontal: 10, paddingVertical: 12 },
});
