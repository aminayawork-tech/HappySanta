// ─────────────────────────────────────────────────────────────
// HappySanta — Welcome / Landing Screen
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { SnowAnimation }    from '@/components/common/SnowAnimation';
import { COLORS, FONTS, APP_NAME, APP_TAGLINE, daysUntilChristmas } from '@/utils/constants';
import { daysUntilChristmas as calcDays } from '@/utils/helpers';

const { width, height } = Dimensions.get('window');

export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Entrance animations
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const textAnim   = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim,   { toValue: 1, useNativeDriver: true, tension: 50 }),
      Animated.timing(textAnim,   { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const days = calcDays();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      {/* Snow particles */}
      <SnowAnimation />

      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.bgMidnight, COLORS.bgDark, '#1a0a2e']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Content */}
      <View style={styles.content}>

        {/* Santa emoji logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity:   logoAnim,
              transform: [{ scale: logoAnim }],
            },
          ]}
        >
          <Text style={styles.santaEmoji}>🎅</Text>
          <Text style={styles.appName}>{APP_NAME}</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, { opacity: textAnim }]}>
          <Text style={styles.tagline}>{APP_TAGLINE}</Text>
          <View style={styles.countdown}>
            <Ionicons name="snow-outline" size={16} color={COLORS.gold} />
            <Text style={styles.countdownText}>
              {days === 0 ? "🎄 It's Christmas!" : `${days} days until Christmas`}
            </Text>
          </View>
        </Animated.View>

        {/* Feature highlights */}
        <Animated.View style={[styles.features, { opacity: textAnim }]}>
          {[
            { icon: '🤖', text: 'AI picks the perfect gifts' },
            { icon: '🛍️', text: 'Real Amazon products + affiliate links' },
            { icon: '📉', text: 'Price tracking & all-time low alerts' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, { opacity: buttonAnim }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Register')}
          >
            <LinearGradient
              colors={[COLORS.santaRed, '#8B0000']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>🎁 Get Started Free</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 28,
    paddingBottom:   40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  santaEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  appName: {
    fontFamily: FONTS.christmas,
    fontSize:   42,
    color:      COLORS.santaRed,
    letterSpacing: 1,
    textShadowColor: 'rgba(196,30,58,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  tagline: {
    fontFamily:  FONTS.bodySemiBold,
    fontSize:    16,
    color:       COLORS.textSecondary,
    textAlign:   'center',
    lineHeight:  24,
    marginBottom: 12,
  },
  countdown: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    backgroundColor: 'rgba(255,215,0,0.12)',
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     'rgba(255,215,0,0.3)',
  },
  countdownText: {
    fontFamily: FONTS.bodySemiBold,
    color:      COLORS.gold,
    fontSize:   13,
  },
  features: {
    width:        '100%',
    marginBottom: 40,
    gap:          12,
  },
  featureRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
  },
  featureIcon: { fontSize: 22 },
  featureText: {
    fontFamily: FONTS.body,
    color:      COLORS.textPrimary,
    fontSize:   14,
  },
  buttons: {
    width: '100%',
    gap:   12,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow:     'hidden',
    shadowColor:  COLORS.santaRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation:    8,
  },
  btnGradient: {
    paddingVertical:  16,
    alignItems:       'center',
    justifyContent:   'center',
  },
  primaryBtnText: {
    fontFamily: FONTS.bodyBold,
    color:      '#FFFFFF',
    fontSize:   17,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems:      'center',
  },
  secondaryBtnText: {
    fontFamily: FONTS.bodySemiBold,
    color:      COLORS.textSecondary,
    fontSize:   14,
  },
});
