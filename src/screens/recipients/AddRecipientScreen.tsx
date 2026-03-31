// ─────────────────────────────────────────────────────────────
// HappySanta — Add / Edit Recipient Screen (Modal)
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
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore }       from '@/store/authStore';
import { useRecipientsStore } from '@/store/recipientsStore';
import {
  COLORS, FONTS,
  RELATIONSHIP_LABELS,
  AVATAR_EMOJIS,
} from '@/utils/constants';
import type { Relationship, Recipient } from '@/types';

type RouteParams = { recipientId?: string };

const RELATIONSHIPS: Relationship[] = [
  'child', 'parent', 'sibling', 'grandparent', 'partner', 'friend', 'colleague', 'other',
];

export function AddRecipientScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { recipientId } = route.params ?? {};

  const { user } = useAuthStore();
  const { addRecipient, updateRecipient, getById, isLoading } = useRecipientsStore();

  const existing = recipientId ? getById(recipientId) : undefined;
  const isEdit   = !!existing;

  // Form state
  const [name,         setName]         = useState(existing?.name ?? '');
  const [age,          setAge]          = useState(existing?.age?.toString() ?? '');
  const [relationship, setRelationship] = useState<Relationship>(existing?.relationship ?? 'friend');
  const [avatarEmoji,  setAvatarEmoji]  = useState(existing?.avatarEmoji ?? '🎁');
  const [notes,        setNotes]        = useState(existing?.notes ?? '');
  // Address
  const [addrName,    setAddrName]    = useState(existing?.address?.fullName ?? '');
  const [addrLine1,   setAddrLine1]   = useState(existing?.address?.line1 ?? '');
  const [addrLine2,   setAddrLine2]   = useState(existing?.address?.line2 ?? '');
  const [addrCity,    setAddrCity]    = useState(existing?.address?.city ?? '');
  const [addrState,   setAddrState]   = useState(existing?.address?.state ?? '');
  const [addrZip,     setAddrZip]     = useState(existing?.address?.zipCode ?? '');
  const [addrCountry, setAddrCountry] = useState(existing?.address?.country ?? 'US');
  const [showAddress,  setShowAddress]  = useState(false);
  const [localError,   setLocalError]   = useState('');

  const validate = () => {
    if (!name.trim())     { setLocalError('Name is required'); return false; }
    if (!age || isNaN(Number(age)) || Number(age) < 0 || Number(age) > 120) {
      setLocalError('Enter a valid age (0–120)');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setLocalError('');
    if (!validate() || !user) return;

    const hasAddress = addrLine1.trim() && addrCity.trim() && addrState.trim() && addrZip.trim();

    const data: Omit<Recipient, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      name:         name.trim(),
      age:          Number(age),
      relationship,
      avatarEmoji,
      notes:        notes.trim() || undefined,
      address: hasAddress
        ? {
            fullName: addrName.trim() || name.trim(),
            line1:    addrLine1.trim(),
            line2:    addrLine2.trim() || undefined,
            city:     addrCity.trim(),
            state:    addrState.trim().toUpperCase(),
            zipCode:  addrZip.trim(),
            country:  addrCountry.trim().toUpperCase() || 'US',
          }
        : undefined,
    };

    try {
      if (isEdit && existing) {
        await updateRecipient(user.uid, { ...existing, ...data });
      } else {
        await addRecipient(user.uid, data);
      }
      navigation.goBack();
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
            <Text style={styles.headerTitle}>{isEdit ? 'Edit Recipient' : 'Add Recipient'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.saveBtn}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.santaRed} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Error */}
            {localError ? (
              <View style={styles.error}>
                <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{localError}</Text>
              </View>
            ) : null}

            {/* Avatar picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Choose Avatar</Text>
              <View style={styles.currentAvatar}>
                <Text style={styles.currentAvatarEmoji}>{avatarEmoji}</Text>
              </View>
              <FlatList
                data={AVATAR_EMOJIS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setAvatarEmoji(item)}
                    style={[
                      styles.emojiOption,
                      item === avatarEmoji && styles.emojiSelected,
                    ]}
                  >
                    <Text style={{ fontSize: 28 }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Basic info */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Basic Info</Text>

              <Field label="Name *" placeholder="Emma" value={name} onChange={setName} autoCapitalize="words" />
              <Field label="Age *" placeholder="7" value={age} onChange={setAge} keyboardType="number-pad" />
              <Field label="Notes" placeholder="Loves dinosaurs and LEGO..." value={notes} onChange={setNotes} multiline />

              <Text style={styles.fieldLabel}>Relationship *</Text>
              <View style={styles.relGrid}>
                {RELATIONSHIPS.map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    onPress={() => setRelationship(rel)}
                    style={[
                      styles.relChip,
                      rel === relationship && styles.relChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.relChipText,
                        rel === relationship && styles.relChipTextActive,
                      ]}
                    >
                      {RELATIONSHIP_LABELS[rel]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Delivery address (collapsible) */}
            <View style={styles.section}>
              <TouchableOpacity
                onPress={() => setShowAddress(!showAddress)}
                style={styles.addressToggle}
              >
                <Ionicons
                  name={showAddress ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.sectionLabel}>Delivery Address (optional)</Text>
              </TouchableOpacity>

              {showAddress && (
                <View style={{ gap: 12, marginTop: 12 }}>
                  <Field label="Full Name on Package" placeholder="Emma Johnson" value={addrName} onChange={setAddrName} autoCapitalize="words" />
                  <Field label="Address Line 1" placeholder="123 Candy Cane Lane" value={addrLine1} onChange={setAddrLine1} />
                  <Field label="Address Line 2" placeholder="Apt 4B (optional)" value={addrLine2} onChange={setAddrLine2} />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 2 }}>
                      <Field label="City" placeholder="New York" value={addrCity} onChange={setAddrCity} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field label="State" placeholder="NY" value={addrState} onChange={setAddrState} autoCapitalize="characters" maxLength={2} />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Field label="ZIP Code" placeholder="10001" value={addrZip} onChange={setAddrZip} keyboardType="number-pad" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field label="Country" placeholder="US" value={addrCountry} onChange={setAddrCountry} autoCapitalize="characters" maxLength={2} />
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        maxLength={maxLength}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13, marginLeft: 2 },
  input: { backgroundColor: COLORS.bgInput, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 12, fontFamily: FONTS.body, color: COLORS.textPrimary, fontSize: 15 },
});

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgCard },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  closeBtn:        { padding: 4 },
  headerTitle:     { flex: 1, fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 17, textAlign: 'center' },
  saveBtn:         { padding: 4, minWidth: 40, alignItems: 'flex-end' },
  saveBtnText:     { fontFamily: FONTS.bodyBold, color: COLORS.santaRed, fontSize: 16 },
  scroll:          { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  error:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 8, padding: 10, marginBottom: 4 },
  errorText:       { fontFamily: FONTS.body, color: COLORS.error, fontSize: 13 },
  section:         { backgroundColor: COLORS.bgDark, borderRadius: 14, padding: 16, gap: 12, marginBottom: 8 },
  sectionLabel:    { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 15 },
  currentAvatar:   { alignItems: 'center', marginBottom: 4 },
  currentAvatarEmoji: { fontSize: 56 },
  emojiOption:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'transparent' },
  emojiSelected:   { borderColor: COLORS.santaRed, backgroundColor: 'rgba(196,30,58,0.12)' },
  fieldLabel:      { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13, marginLeft: 2 },
  relGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relChip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  relChipActive:   { backgroundColor: 'rgba(196,30,58,0.2)', borderColor: COLORS.santaRed },
  relChipText:     { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13 },
  relChipTextActive: { color: COLORS.santaRed },
  addressToggle:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
