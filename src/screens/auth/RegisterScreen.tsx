// ─────────────────────────────────────────────────────────────
// HappySanta — Register Screen
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore }  from '@/store/authStore';
import { COLORS, FONTS } from '@/utils/constants';
import { SnowAnimation } from '@/components/common/SnowAnimation';
import { isValidEmail }  from '@/utils/helpers';

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = () => {
    if (!name.trim())            { setLocalError('Enter your name'); return false; }
    if (!isValidEmail(email))    { setLocalError('Enter a valid email address'); return false; }
    if (password.length < 8)     { setLocalError('Password must be at least 8 characters'); return false; }
    if (password !== confirm)    { setLocalError('Passwords do not match'); return false; }
    return true;
  };

  const handleRegister = async () => {
    setLocalError('');
    clearError();
    if (!validate()) return;
    try {
      await register(email.trim().toLowerCase(), password, name.trim());
      navigation.navigate('Onboarding');
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;

  return (
    <View style={styles.container}>
      <SnowAnimation particleCount={30} />
      <LinearGradient
        colors={[COLORS.bgMidnight, COLORS.bgDark]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.emoji}>🎄</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join HappySanta and make Christmas magical!</Text>

            {displayError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Santa Claus"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="santa@northpole.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    returnKeyType="next"
                    autoComplete="new-password"
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat password"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    autoComplete="new-password"
                  />
                </View>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.forestGreen, '#0d3d21']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerBtnText}>🎅 Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </Text>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={{ color: COLORS.santaRed, fontFamily: FONTS.bodyBold }}>
                  Sign in
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bgDark },
  scroll:     { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  backBtn:    { alignSelf: 'flex-start', padding: 8, marginBottom: 12 },
  emoji:      { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title:      { fontFamily: FONTS.christmas, fontSize: 30, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
  subtitle:   { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  errorBanner:{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(244,67,54,0.12)', borderColor: COLORS.error, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:  { fontFamily: FONTS.body, color: COLORS.error, fontSize: 13, flex: 1 },
  form:       { marginBottom: 24, gap: 16 },
  inputGroup: { gap: 6 },
  label:      { fontFamily: FONTS.bodySemiBold, color: COLORS.textSecondary, fontSize: 13, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  inputIcon:  { marginLeft: 14 },
  input:      { flex: 1, fontFamily: FONTS.body, color: COLORS.textPrimary, fontSize: 15, paddingVertical: 14, paddingLeft: 10, paddingRight: 14 },
  eyeBtn:     { position: 'absolute', right: 14, padding: 4 },
  registerBtn:{ borderRadius: 14, overflow: 'hidden', shadowColor: COLORS.forestGreen, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, marginBottom: 16 },
  btnGradient:{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  registerBtnText: { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 17 },
  termsText:  { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 },
  loginLink:  { alignItems: 'center' },
  loginText:  { fontFamily: FONTS.body, color: COLORS.textSecondary, fontSize: 14 },
});
