// ─────────────────────────────────────────────────────────────
// HappySanta — Login Screen
// Email/password + Google sign-in with festive UI
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore }  from '@/store/authStore';
import { COLORS, FONTS } from '@/utils/constants';
import { SnowAnimation } from '@/components/common/SnowAnimation';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { loginWithEmail: doLogin, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [localError,  setLocalError]  = useState('');

  const validate = () => {
    if (!email.trim())    { setLocalError('Enter your email address'); return false; }
    if (!password.trim()) { setLocalError('Enter your password'); return false; }
    return true;
  };

  const handleLogin = async () => {
    setLocalError('');
    clearError();
    if (!validate()) return;
    try {
      await doLogin(email.trim().toLowerCase(), password);
    } catch {
      // Error already set in store
    }
  };

  const handleGoogle = async () => {
    clearError();
    try {
      await loginWithGoogle();
    } catch {
      // Handled in store
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
            {/* Back */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <Text style={styles.emoji}>🎅</Text>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to your HappySanta account</Text>

            {/* Error banner */}
            {displayError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass(!showPass)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.santaRed, '#8B0000']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In 🎄</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogle}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={{ color: COLORS.santaRed, fontFamily: FONTS.bodyBold }}>
                  Sign up free
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
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  backBtn: { alignSelf: 'flex-start', padding: 8, marginBottom: 16 },
  emoji:   { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: {
    fontFamily: FONTS.christmas,
    fontSize:   32,
    color:      COLORS.textPrimary,
    textAlign:  'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily:  FONTS.body,
    color:       COLORS.textSecondary,
    fontSize:    15,
    textAlign:   'center',
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              8,
    backgroundColor:  'rgba(244,67,54,0.12)',
    borderColor:      COLORS.error,
    borderWidth:      1,
    borderRadius:     10,
    padding:          12,
    marginBottom:     16,
  },
  errorText: { fontFamily: FONTS.body, color: COLORS.error, fontSize: 13, flex: 1 },
  form:       { marginBottom: 24, gap: 16 },
  inputGroup: { gap: 6 },
  label: {
    fontFamily: FONTS.bodySemiBold,
    color:      COLORS.textSecondary,
    fontSize:   13,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  COLORS.bgInput,
    borderRadius:     12,
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.08)',
  },
  inputIcon: { marginLeft: 14 },
  input: {
    flex:            1,
    fontFamily:      FONTS.body,
    color:           COLORS.textPrimary,
    fontSize:        15,
    paddingVertical: 14,
    paddingLeft:     10,
    paddingRight:    14,
  },
  eyeBtn:    { position: 'absolute', right: 14, padding: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -8 },
  forgotText: {
    fontFamily: FONTS.bodySemiBold,
    color:      COLORS.santaRed,
    fontSize:   13,
  },
  loginBtn: {
    borderRadius:  14,
    overflow:      'hidden',
    shadowColor:   COLORS.santaRed,
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius:  12,
    elevation:     8,
    marginBottom:  20,
  },
  btnGradient: {
    paddingVertical:  16,
    alignItems:       'center',
    justifyContent:   'center',
  },
  loginBtnText: {
    fontFamily: FONTS.bodyBold,
    color:      '#fff',
    fontSize:   17,
  },
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    marginBottom:   20,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontFamily: FONTS.body,
    color:      COLORS.textMuted,
    fontSize:   13,
  },
  googleBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              10,
    backgroundColor:  'rgba(255,255,255,0.06)',
    borderRadius:     14,
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.12)',
    paddingVertical:  14,
    marginBottom:     24,
  },
  googleIcon: {
    fontFamily: FONTS.bodyBold,
    fontSize:   18,
    color:      '#4285F4',
  },
  googleText: {
    fontFamily: FONTS.bodySemiBold,
    color:      COLORS.textPrimary,
    fontSize:   15,
  },
  registerLink: { alignItems: 'center' },
  registerText: {
    fontFamily: FONTS.body,
    color:      COLORS.textSecondary,
    fontSize:   14,
  },
});
