// ─────────────────────────────────────────────────────────────
// HappySanta — Recipient Card Component
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RELATIONSHIP_LABELS } from '@/utils/constants';
import type { Recipient } from '@/types';

interface RecipientCardProps {
  recipient: Recipient;
  onPress:   () => void;
  onEdit:    () => void;
  onDelete:  () => void;
}

export function RecipientCard({ recipient, onPress, onEdit, onDelete }: RecipientCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.avatar}>{recipient.avatarEmoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{recipient.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {RELATIONSHIP_LABELS[recipient.relationship]}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎂 Age {recipient.age}</Text>
          </View>
          {recipient.address && (
            <View style={[styles.badge, { borderColor: COLORS.gold + '40' }]}>
              <Ionicons name="location" size={10} color={COLORS.gold} />
              <Text style={[styles.badgeText, { color: COLORS.gold }]}>Has address</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="create-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error + 'aa'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  COLORS.bgCard,
    borderRadius:     14,
    padding:          14,
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.07)',
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.15,
    shadowRadius:     4,
    elevation:        2,
  },
  avatar:  { fontSize: 38, marginRight: 14 },
  info:    { flex: 1, gap: 6 },
  name:    { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  badge:   {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              3,
    backgroundColor:  'rgba(255,255,255,0.06)',
    borderRadius:     10,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.1)',
  },
  badgeText: { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 11 },
  actions:   { flexDirection: 'column', gap: 8, marginLeft: 8 },
  actionBtn: { padding: 4 },
});
