// ─────────────────────────────────────────────────────────────
// HappySanta — AI Suggestion Card
// Displays one AI-generated gift idea with Amazon product.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/utils/constants';
import { formatPrice, formatPriceRange } from '@/utils/helpers';
import type { AISuggestion } from '@/types';

interface SuggestionCardProps {
  suggestion:    AISuggestion;
  onAddToList:   () => void;
  onViewOnAmazon:() => void;
}

export function SuggestionCard({ suggestion, onAddToList, onViewOnAmazon }: SuggestionCardProps) {
  const product = suggestion.amazonProduct;

  return (
    <View style={styles.card}>
      {/* Product image or placeholder */}
      {product?.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.imagePlaceholder}>
          {suggestion.isLoading ? (
            <ActivityIndicator color={COLORS.santaRed} />
          ) : (
            <Text style={{ fontSize: 32 }}>🎁</Text>
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Gift title (AI) */}
        <Text style={styles.giftTitle}>{suggestion.title}</Text>

        {/* Amazon product title (if available) */}
        {product?.title && (
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
        )}

        {/* AI reason */}
        <View style={styles.reasonRow}>
          <Text style={styles.reasonIcon}>🎅</Text>
          <Text style={styles.reasonText} numberOfLines={2}>
            {suggestion.reason}
          </Text>
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {product?.price
              ? formatPrice(product.price / 100)
              : formatPriceRange(suggestion.estimatedPriceMin, suggestion.estimatedPriceMax)}
          </Text>

          {/* Prime badge */}
          {product?.isPrime && (
            <View style={styles.primeBadge}>
              <Text style={styles.primeText}>✓ Prime</Text>
            </View>
          )}

          {/* Rating */}
          {product?.rating != null && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* View on Amazon */}
          <TouchableOpacity
            onPress={onViewOnAmazon}
            disabled={!product?.url}
            style={styles.amazonBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.amazonBtnText}>Amazon</Text>
          </TouchableOpacity>

          {/* Add to List */}
          <TouchableOpacity
            onPress={onAddToList}
            style={styles.addBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.santaRed, '#8B0000']}
              style={styles.addBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add to List</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    16,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.07)',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    8,
    elevation:       4,
  },
  image: {
    width:           '100%',
    height:          200,
    backgroundColor: '#ffffff',
  },
  imagePlaceholder: {
    width:           '100%',
    height:          160,
    backgroundColor: COLORS.bgInput,
    alignItems:      'center',
    justifyContent:  'center',
  },
  content:          { padding: 14, gap: 8 },
  giftTitle:        { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 17 },
  productTitle:     { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  reasonRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  reasonIcon:       { fontSize: 14, marginTop: 1 },
  reasonText:       { flex: 1, fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  priceRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  price:            { fontFamily: FONTS.christmas, color: COLORS.textPrimary, fontSize: 22 },
  primeBadge:       { backgroundColor: 'rgba(0,120,200,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  primeText:        { fontFamily: FONTS.bodySemiBold, color: '#0078C8', fontSize: 11 },
  ratingBadge:      { backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText:       { fontFamily: FONTS.bodySemiBold, color: COLORS.gold, fontSize: 11 },
  actions:          { flexDirection: 'row', gap: 10, marginTop: 4 },
  amazonBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  amazonBtnText:    { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13 },
  addBtn:           { flex: 1, borderRadius: 10, overflow: 'hidden' },
  addBtnGradient:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  addBtnText:       { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 14 },
});
