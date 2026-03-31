// ─────────────────────────────────────────────────────────────
// HappySanta — AI Suggestions Screen
// Shows AI-generated gift cards with Amazon product matches.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';

import { useListsStore }      from '@/store/listsStore';
import { useRecipientsStore } from '@/store/recipientsStore';
import { SantaLoader }        from '@/components/common/SantaLoader';
import { SuggestionCard }     from '@/components/lists/SuggestionCard';
import { COLORS, FONTS }      from '@/utils/constants';
import { uuid }               from '@/utils/helpers';
import type { AISuggestion, GiftItem } from '@/types';

type RouteParams = { listId: string };

export function AISuggestionsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { listId } = route.params;

  const { getListById, aiSuggestions, isSuggestingAI, fetchAISuggestions, addItemToList } = useListsStore();
  const { getById } = useRecipientsStore();

  const confettiRef = useRef<ConfettiCannon>(null);
  const list = getListById(listId);
  const recipient = list?.recipientId ? getById(list.recipientId) : null;

  // Kick off AI request when screen mounts
  useEffect(() => {
    if (!list || !recipient) return;
    fetchAISuggestions({
      age:          recipient.age,
      relationship: recipient.relationship,
      budget:       list.budget,
      interests:    list.interests,
      gender:       recipient.gender,
    });
  }, [listId]);

  const handleAddToList = async (suggestion: AISuggestion) => {
    if (!list) return;

    const item: Omit<GiftItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'> = {
      title:             suggestion.title,
      aiReason:          suggestion.reason,
      estimatedPriceMin: suggestion.estimatedPriceMin,
      estimatedPriceMax: suggestion.estimatedPriceMax,
      asin:              suggestion.amazonProduct?.asin,
      amazonTitle:       suggestion.amazonProduct?.title,
      amazonPrice:       suggestion.amazonProduct?.price
        ? suggestion.amazonProduct.price / 100  // cents → dollars
        : undefined,
      amazonImageUrl:    suggestion.amazonProduct?.imageUrl,
      amazonUrl:         suggestion.amazonProduct?.url,
      amazonRating:      suggestion.amazonProduct?.rating,
      amazonReviewCount: suggestion.amazonProduct?.reviewCount,
      amazonIsPrime:     suggestion.amazonProduct?.isPrime,
      priceAlertEnabled: true,
      status:            'saved',
    };

    try {
      await addItemToList(listId, item);
      confettiRef.current?.start();
    } catch {
      Alert.alert('Error', 'Could not add item to list. Please try again.');
    }
  };

  const handleRefresh = () => {
    if (!list || !recipient) return;
    fetchAISuggestions({
      age:          recipient.age,
      relationship: recipient.relationship,
      budget:       list.budget,
      interests:    list.interests,
      gender:       recipient.gender,
    });
  };

  const renderItem: ListRenderItem<AISuggestion> = ({ item }) => (
    <SuggestionCard
      suggestion={item}
      onAddToList={() => handleAddToList(item)}
      onViewOnAmazon={() => {
        if (item.amazonProduct?.url) Linking.openURL(item.amazonProduct.url);
      }}
    />
  );

  if (isSuggestingAI && aiSuggestions.length === 0) {
    return <SantaLoader message={`HappySanta is finding perfect gifts for ${recipient?.name ?? 'them'}... 🎅`} />;
  }

  return (
    <View style={styles.container}>
      {/* Confetti for adding items */}
      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut
        colors={[COLORS.santaRed, COLORS.gold, COLORS.forestGreen, '#fff']}
      />

      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.bgMidnight }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('ListDetail', { listId })} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🤖 AI Gift Ideas</Text>
            {recipient && (
              <Text style={styles.headerSub}>
                {recipient.avatarEmoji} {recipient.name} • ${list?.budget} budget
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isSuggestingAI}
            style={styles.refreshBtn}
          >
            {isSuggestingAI ? (
              <ActivityIndicator size="small" color={COLORS.santaRed} />
            ) : (
              <Ionicons name="refresh" size={22} color={COLORS.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Instructions banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          🎁 Tap <Text style={{ color: COLORS.santaRed, fontFamily: FONTS.bodyBold }}>Add to List</Text> on items you like.
          We'll track their prices and alert you at the all-time low!
        </Text>
      </View>

      <FlatList
        data={aiSuggestions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.viewListBtn}
            onPress={() => navigation.navigate('ListDetail', { listId })}
          >
            <LinearGradient
              colors={[COLORS.forestGreen, '#0d3d21']}
              style={styles.viewListGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.viewListText}>📋 View My List</Text>
            </LinearGradient>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgDark },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  backBtn:         { padding: 4 },
  headerCenter:    { flex: 1, alignItems: 'center' },
  headerTitle:     { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 17 },
  headerSub:       { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  refreshBtn:      { padding: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  infoBanner:      { backgroundColor: 'rgba(196,30,58,0.12)', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(196,30,58,0.2)' },
  infoText:        { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  list:            { paddingHorizontal: 16, paddingTop: 12, gap: 14, paddingBottom: 30 },
  viewListBtn:     { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  viewListGradient:{ paddingVertical: 15, alignItems: 'center' },
  viewListText:    { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 16 },
});
