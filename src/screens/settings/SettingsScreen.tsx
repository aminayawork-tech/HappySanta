// ─────────────────────────────────────────────────────────────
// HappySanta — Settings Screen
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore }    from '@/store/authStore';
import { useSettingsStore }from '@/store/settingsStore';
import { COLORS, FONTS }   from '@/utils/constants';

type RowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle?: string;
  value?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  iconColor?: string;
};

function SettingRow({ icon, label, subtitle, value, onPress, showArrow, iconColor = COLORS.textSecondary }: RowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !showArrow}
      style={styles.row}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rowRight}>
        {value}
        {showArrow && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function SettingsScreen() {
  const navigation  = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { musicEnabled, snowEnabled, pushNotificationsEnabled, updateSetting } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.bgMidnight }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings ⚙️</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 28 }}>🎅</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user?.displayName ?? 'Santa Claus'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* Experience */}
        <SectionHeader title="Christmas Experience" />
        <View style={styles.card}>
          <SettingRow
            icon="musical-notes"
            label="Holiday Music"
            subtitle="Play Christmas music in the app"
            iconColor={COLORS.gold}
            value={
              <Switch
                value={musicEnabled}
                onValueChange={(v) => updateSetting('musicEnabled', v)}
                trackColor={{ false: COLORS.bgInput, true: COLORS.santaRed + '80' }}
                thumbColor={musicEnabled ? COLORS.santaRed : COLORS.textMuted}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="snow"
            label="Snow Animation"
            subtitle="Festive snowflakes on screen"
            iconColor={COLORS.silver}
            value={
              <Switch
                value={snowEnabled}
                onValueChange={(v) => updateSetting('snowEnabled', v)}
                trackColor={{ false: COLORS.bgInput, true: COLORS.santaRed + '80' }}
                thumbColor={snowEnabled ? COLORS.santaRed : COLORS.textMuted}
              />
            }
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.card}>
          <SettingRow
            icon="notifications"
            label="Price Drop Alerts"
            subtitle="Notify me at all-time low prices"
            iconColor={COLORS.santaRed}
            value={
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={(v) => updateSetting('pushNotificationsEnabled', v)}
                trackColor={{ false: COLORS.bgInput, true: COLORS.santaRed + '80' }}
                thumbColor={pushNotificationsEnabled ? COLORS.santaRed : COLORS.textMuted}
              />
            }
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.card}>
          <SettingRow icon="information-circle" label="Version" value={<Text style={styles.valueText}>1.0.0</Text>} iconColor={COLORS.textSecondary} />
          <View style={styles.divider} />
          <SettingRow icon="shield-checkmark" label="Privacy Policy" showArrow iconColor={COLORS.textSecondary} onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="document-text" label="Terms of Service" showArrow iconColor={COLORS.textSecondary} onPress={() => {}} />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bgDark },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title:        { fontFamily: FONTS.christmas, fontSize: 24, color: COLORS.textPrimary },
  scroll:       { paddingHorizontal: 20, paddingTop: 12 },
  sectionHeader:{ fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 8, marginLeft: 4 },
  card:         { backgroundColor: COLORS.bgCard, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  profileRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  profileAvatar:{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(196,30,58,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(196,30,58,0.3)' },
  profileName:  { fontFamily: FONTS.bodyBold, color: COLORS.textPrimary, fontSize: 16 },
  profileEmail: { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 14 },
  rowIcon:      { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowContent:   { flex: 1 },
  rowLabel:     { fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 15 },
  rowSubtitle:  { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  rowRight:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 64 },
  valueText:    { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 14 },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, paddingVertical: 14, backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(244,67,54,0.2)' },
  logoutText:   { fontFamily: FONTS.bodyBold, color: COLORS.error, fontSize: 16 },
});
