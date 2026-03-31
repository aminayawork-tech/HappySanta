// ─────────────────────────────────────────────────────────────
// HappySanta — List Card Component
// Shows a gift list summary with budget progress bar.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useRecipientsStore } from '@/store/recipientsStore';
import { COLORS, FONTS }      from '@/utils/constants';
import { formatPrice, calcListProgress } from '@/utils/helpers';
import type { GiftList }      from '@/types';

interface ListCardProps {
  list:    GiftList;
  onPress: () => void;
}

export function ListCard({ list, onPress }: ListCardProps) {
  const { getById } = useRecipientsStore();
  const recipient   = getById(list.recipientId);
  const progress    = calcListProgress(list.budget, list.totalSpent ?? 0);
  const itemCount   = list.items?.length ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.avatar}>{recipient?.avatarEmoji ?? '🎁'}</Text>
        <View style={styles.titleBlock}>
          <Text style={styles.recipientName} numberOfLines={1}>
            {recipient?.name ?? 'Unknown'}
          </Text>
          <Text style={styles.listYear}>{list.year}</Text>
        </View>
        {list.status === 'complete' && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.completedText}>Done!</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </View>

      {/* Budget and items */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Budget</Text>
          <Text style={styles.statValue}>{formatPrice(list.budget)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={[styles.statValue, { color: COLORS.forestGreen }]}>
            {formatPrice(list.totalSpent ?? 0)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Items</Text>
          <Text style={styles.statValue}>{itemCount}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress * 100, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      {/* Interests tags */}
      {list.interests && list.interests.length > 0 && (
        <View style={styles.interests}>
          {list.interests.slice(0, 4).map((interest) => (
            <View key={interest} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {list.interests.length > 4 && (
            <Text style={styles.moreInterests}>+{list.interests.length - 4}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    16,
    padding:         16,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.07)',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    6,
    elevation:       3,
    gap:             12,
  },
  header:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:          { fontSize: 34 },
  titleBlock:      { flex: 1 },
  recipientName:   { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16 },
  listYear:        { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  completedBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  completedText:   { fontFamily: FONTS.bodySemiBold, color: COLORS.success, fontSize: 11 },
  statsRow:        { flexDirection: 'row', gap: 8 },
  stat:            { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, alignItems: 'center' },
  statLabel:       { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  statValue:       { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 14 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack:   { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill:    { height: '100%', backgroundColor: COLORS.santaRed, borderRadius: 3 },
  progressText:    { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 12, minWidth: 35, textAlign: 'right' },
  interests:       { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  interestTag:     { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  interestText:    { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11 },
  moreInterests:   { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11, alignSelf: 'center' },
});
