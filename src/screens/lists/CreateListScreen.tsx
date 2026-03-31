// ─────────────────────────────────────────────────────────────
// HappySanta — Create List Screen (Modal)
// Select recipient → set budget → pick interests → AI generate
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore }       from '@/store/authStore';
import { useListsStore }      from '@/store/listsStore';
import { useRecipientsStore } from '@/store/recipientsStore';
import {
  COLORS, FONTS,
  INTEREST_LABELS,
  INTEREST_EMOJIS,
  BUDGET_PRESETS,
  CURRENT_YEAR,
} from '@/utils/constants';
import type { GiftInterest, Recipient } from '@/types';

type RouteParams = { recipientId?: string };
const INTERESTS = Object.keys(INTEREST_LABELS) as GiftInterest[];

export function CreateListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const preselectedRecipientId = route.params?.recipientId;

  const { user }                        = useAuthStore();
  const { createList, isLoading }       = useListsStore();
  const { recipients, fetchRecipients } = useRecipientsStore();

  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    preselectedRecipientId
      ? (recipients.find((r) => r.id === preselectedRecipientId) ?? null)
      : null,
  );
  const [budget,    setBudget]    = useState(100);
  const [budgetStr, setBudgetStr] = useState('100');
  const [interests, setInterests] = useState<GiftInterest[]>([]);
  const [step,      setStep]      = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (user && recipients.length === 0) fetchRecipients(user.uid);
  }, [user]);

  const toggleInterest = (interest: GiftInterest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const handleBudgetChange = (val: string) => {
    setBudgetStr(val);
    const n = Number(val);
    if (!isNaN(n)) setBudget(n);
  };

  const handleCreateAndAI = async () => {
    if (!selectedRecipient || !user) return;
    if (budget < 10 || budget > 10000) {
      Alert.alert('Invalid Budget', 'Please enter a budget between $10 and $10,000');
      return;
    }

    try {
      const list = await createList(user.uid, {
        recipientId: selectedRecipient.id,
        year:        CURRENT_YEAR,
        title:       `Christmas ${CURRENT_YEAR} — ${selectedRecipient.name}`,
        budget,
        interests,
        status:      'draft',
      });

      // Navigate to AI suggestions screen
      navigation.replace('AISuggestions', { listId: list.id });
    } catch {
      // Error handled in store
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Christmas List</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Progress */}
          <View style={styles.progress}>
            {([1, 2, 3] as const).map((s) => (
              <View
                key={s}
                style={[styles.progressDot, step >= s && styles.progressDotActive]}
              />
            ))}
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* Step 1: Choose recipient */}
            {step === 1 && (
              <>
                <Text style={styles.stepTitle}>🎁 Who is this list for?</Text>
                {recipients.length === 0 ? (
                  <View style={styles.noRecipients}>
                    <Text style={styles.noRecipientsText}>
                      No recipients yet. Add someone first!
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddRecipient')}
                      style={styles.addRecipientBtn}
                    >
                      <Text style={styles.addRecipientBtnText}>+ Add Recipient</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.recipientGrid}>
                    {recipients.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => setSelectedRecipient(r)}
                        style={[
                          styles.recipientChip,
                          selectedRecipient?.id === r.id && styles.recipientChipActive,
                        ]}
                      >
                        <Text style={styles.recipientEmoji}>{r.avatarEmoji}</Text>
                        <Text style={styles.recipientName} numberOfLines={1}>{r.name}</Text>
                        <Text style={styles.recipientAge}>Age {r.age}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.nextBtn, !selectedRecipient && styles.nextBtnDisabled]}
                  disabled={!selectedRecipient}
                  onPress={() => setStep(2)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={selectedRecipient ? [COLORS.santaRed, '#8B0000'] : ['#444', '#333']}
                    style={styles.nextBtnGradient}
                  >
                    <Text style={styles.nextBtnText}>Next: Set Budget →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: Budget */}
            {step === 2 && (
              <>
                <Text style={styles.stepTitle}>
                  💰 What's your budget for {selectedRecipient?.name}?
                </Text>

                <View style={styles.budgetInput}>
                  <Text style={styles.currencySign}>$</Text>
                  <TextInput
                    style={styles.budgetTextInput}
                    value={budgetStr}
                    onChangeText={handleBudgetChange}
                    keyboardType="number-pad"
                    placeholder="100"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={6}
                  />
                </View>

                <Text style={styles.quickSelectLabel}>Or pick a preset:</Text>
                <View style={styles.presets}>
                  {BUDGET_PRESETS.map((b) => (
                    <TouchableOpacity
                      key={b}
                      onPress={() => { setBudget(b); setBudgetStr(b.toString()); }}
                      style={[styles.preset, budget === b && styles.presetActive]}
                    >
                      <Text style={[styles.presetText, budget === b && styles.presetTextActive]}>
                        ${b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.stepButtons}>
                  <TouchableOpacity onPress={() => setStep(1)} style={styles.backStepBtn}>
                    <Text style={styles.backStepText}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextBtnSmall}
                    onPress={() => setStep(3)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[COLORS.santaRed, '#8B0000']}
                      style={styles.nextBtnGradient}
                    >
                      <Text style={styles.nextBtnText}>Next: Interests →</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <>
                <Text style={styles.stepTitle}>
                  🎨 What does {selectedRecipient?.name} love?
                </Text>
                <Text style={styles.stepSubtitle}>
                  Select up to 5 interests (or skip — Santa knows best 🎅)
                </Text>

                <View style={styles.interestGrid}>
                  {INTERESTS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <TouchableOpacity
                        key={interest}
                        onPress={() => {
                          if (!selected && interests.length >= 5) return;
                          toggleInterest(interest);
                        }}
                        style={[styles.interestChip, selected && styles.interestChipActive]}
                      >
                        <Text style={styles.interestEmoji}>{INTEREST_EMOJIS[interest]}</Text>
                        <Text
                          style={[
                            styles.interestLabel,
                            selected && styles.interestLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {INTEREST_LABELS[interest]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.stepButtons}>
                  <TouchableOpacity onPress={() => setStep(2)} style={styles.backStepBtn}>
                    <Text style={styles.backStepText}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextBtnSmall}
                    onPress={handleCreateAndAI}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[COLORS.santaRed, '#8B0000']}
                      style={styles.nextBtnGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.nextBtnText}>🤖 Ask HappySanta AI!</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bgCard },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  closeBtn:       { padding: 4 },
  headerTitle:    { flex: 1, fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 17, textAlign: 'center' },
  progress:       { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  progressDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressDotActive: { backgroundColor: COLORS.santaRed, width: 24 },
  scroll:         { padding: 20, gap: 16 },
  stepTitle:      { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 20, marginBottom: 4 },
  stepSubtitle:   { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  recipientGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  recipientChip:  { width: '30%', backgroundColor: COLORS.bgDark, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 2, borderColor: 'transparent' },
  recipientChipActive: { borderColor: COLORS.santaRed, backgroundColor: 'rgba(196,30,58,0.1)' },
  recipientEmoji: { fontSize: 32 },
  recipientName:  { fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 13, textAlign: 'center' },
  recipientAge:   { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 11 },
  noRecipients:   { alignItems: 'center', gap: 12, paddingVertical: 24 },
  noRecipientsText: { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14 },
  addRecipientBtn: { backgroundColor: 'rgba(196,30,58,0.15)', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(196,30,58,0.3)' },
  addRecipientBtnText: { fontFamily: FONTS.bodyBold, color: COLORS.santaRed, fontSize: 14 },
  nextBtn:        { borderRadius: 14, overflow: 'hidden', shadowColor: COLORS.santaRed, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  nextBtnDisabled:{ opacity: 0.5 },
  nextBtnSmall:   { flex: 1, borderRadius: 14, overflow: 'hidden' },
  nextBtnGradient:{ paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  nextBtnText:    { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 16 },
  budgetInput:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
  currencySign:   { fontFamily: FONTS.christmas, fontSize: 28, color: COLORS.gold, marginRight: 8 },
  budgetTextInput:{ flex: 1, fontFamily: FONTS.christmas, fontSize: 28, color: COLORS.textPrimary },
  quickSelectLabel: { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
  presets:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  presetActive:   { backgroundColor: 'rgba(196,30,58,0.2)', borderColor: COLORS.santaRed },
  presetText:     { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 14 },
  presetTextActive: { color: COLORS.santaRed },
  interestGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  interestChipActive: { backgroundColor: 'rgba(196,30,58,0.2)', borderColor: COLORS.santaRed },
  interestEmoji:  { fontSize: 18 },
  interestLabel:  { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13 },
  interestLabelActive: { color: COLORS.santaRed },
  stepButtons:    { flexDirection: 'row', gap: 12, alignItems: 'center' },
  backStepBtn:    { paddingVertical: 14, paddingHorizontal: 16 },
  backStepText:   { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 15 },
});
