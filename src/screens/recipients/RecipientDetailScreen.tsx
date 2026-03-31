// ─────────────────────────────────────────────────────────────
// HappySanta — Recipient Detail Screen
// Shows recipient profile, their gift lists, and quick actions.
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRecipientsStore } from '@/store/recipientsStore';
import { useListsStore }      from '@/store/listsStore';
import { useAuthStore }       from '@/store/authStore';
import { ListCard }           from '@/components/lists/ListCard';
import {
  COLORS, FONTS,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_EMOJIS,
} from '@/utils/constants';

type RouteParams = { recipientId: string };

export function RecipientDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { recipientId } = route.params;

  const { getById, removeRecipient } = useRecipientsStore();
  const { lists, fetchLists }        = useListsStore();
  const { user }                     = useAuthStore();

  const recipient = getById(recipientId);
  const recipientLists = lists.filter((l) => l.recipientId === recipientId);

  useEffect(() => {
    if (user) fetchLists(user.uid);
  }, [user]);

  if (!recipient) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Recipient not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.santaRed }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Remove Recipient',
      `Remove ${recipient.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeRecipient(recipientId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.bgMidnight, COLORS.bgDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddRecipient', { recipientId })}
                style={styles.actionBtn}
              >
                <Ionicons name="create-outline" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <Text style={styles.avatar}>{recipient.avatarEmoji}</Text>
            <Text style={styles.recipientName}>{recipient.name}</Text>
            <View style={styles.recipientMeta}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>
                  {RELATIONSHIP_EMOJIS[recipient.relationship]} {RELATIONSHIP_LABELS[recipient.relationship]}
                </Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>🎂 {recipient.age} years old</Text>
              </View>
            </View>
            {recipient.notes && (
              <Text style={styles.notes}>"{recipient.notes}"</Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Delivery address */}
        {recipient.address && (
          <View style={styles.addressCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={18} color={COLORS.gold} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>
              {recipient.address.fullName}
              {'\n'}
              {recipient.address.line1}
              {recipient.address.line2 ? `\n${recipient.address.line2}` : ''}
              {'\n'}
              {recipient.address.city}, {recipient.address.state} {recipient.address.zipCode}
              {'\n'}
              {recipient.address.country}
            </Text>
          </View>
        )}

        {/* Gift lists */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gift Lists</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateList', { recipientId })}
            style={styles.addListBtn}
          >
            <Ionicons name="add" size={16} color={COLORS.santaRed} />
            <Text style={styles.addListText}>New List</Text>
          </TouchableOpacity>
        </View>

        {recipientLists.length === 0 ? (
          <View style={styles.emptyLists}>
            <Text style={styles.emptyListsText}>No lists yet for {recipient.name}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateList', { recipientId })}
              style={styles.createListBtn}
            >
              <Text style={styles.createListBtnText}>🎄 Create Christmas List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listCards}>
            {recipientLists.map((list) => (
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

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgDark },
  notFound:        { flex: 1, backgroundColor: COLORS.bgDark, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText:    { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 16 },
  header:          { paddingBottom: 24 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:         { padding: 4 },
  headerActions:   { flexDirection: 'row', gap: 8 },
  actionBtn:       { padding: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  profileCard:     { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  avatar:          { fontSize: 72, marginBottom: 8 },
  recipientName:   { fontFamily: FONTS.christmas, fontSize: 30, color: COLORS.textPrimary, marginBottom: 10 },
  recipientMeta:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  metaBadge:       { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  metaText:        { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13 },
  notes:           { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  scroll:          { paddingHorizontal: 20, paddingTop: 16 },
  addressCard:     { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle:       { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 15 },
  addressText:     { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:    { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 17 },
  addListBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addListText:     { fontFamily: FONTS.bodySemiBold, color: COLORS.santaRed, fontSize: 14 },
  emptyLists:      { alignItems: 'center', paddingVertical: 24, gap: 12 },
  emptyListsText:  { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14 },
  createListBtn:   { backgroundColor: 'rgba(196,30,58,0.12)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(196,30,58,0.3)' },
  createListBtnText: { fontFamily: FONTS.bodyBold, color: COLORS.santaRed, fontSize: 14 },
  listCards:       { gap: 12 },
});
