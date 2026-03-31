// ─────────────────────────────────────────────────────────────
// HappySanta — Recipients Screen
// Shows all family/friend recipients with swipe-to-delete.
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore }      from '@/store/authStore';
import { useRecipientsStore }from '@/store/recipientsStore';
import { RecipientCard }     from '@/components/recipients/RecipientCard';
import { COLORS, FONTS }     from '@/utils/constants';
import type { Recipient }    from '@/types';

export function RecipientsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { recipients, subscribe, removeRecipient, isLoading } = useRecipientsStore();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribe(user.uid);
    return unsub;
  }, [user]);

  const handleDelete = (recipient: Recipient) => {
    Alert.alert(
      'Remove Recipient',
      `Remove ${recipient.name} from your family? Their gift lists will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeRecipient(recipient.id),
        },
      ],
    );
  };

  const renderItem: ListRenderItem<Recipient> = ({ item }) => (
    <RecipientCard
      recipient={item}
      onPress={() => navigation.navigate('RecipientDetail', { recipientId: item.id })}
      onEdit={() => navigation.navigate('AddRecipient', { recipientId: item.id })}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.bgMidnight }}>
        <View style={styles.header}>
          <Text style={styles.title}>My Family 👨‍👩‍👧‍👦</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddRecipient')}
          >
            <LinearGradient
              colors={[COLORS.santaRed, '#8B0000']}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={recipients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👪</Text>
            <Text style={styles.emptyTitle}>No recipients yet</Text>
            <Text style={styles.emptyBody}>
              Add your family and friends to start building Christmas lists for them.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddRecipient')}
            >
              <LinearGradient colors={[COLORS.santaRed, '#8B0000']} style={styles.emptyBtnGradient}>
                <Text style={styles.emptyBtnText}>+ Add First Recipient</Text>
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
  list:            { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  empty:           { alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyEmoji:      { fontSize: 64, marginBottom: 12 },
  emptyTitle:      { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 18, marginBottom: 8 },
  emptyBody:       { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  emptyBtn:        { borderRadius: 14, overflow: 'hidden', width: '80%' },
  emptyBtnGradient:{ paddingVertical: 14, alignItems: 'center' },
  emptyBtnText:    { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 15 },
});
