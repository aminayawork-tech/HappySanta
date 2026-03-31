// ─────────────────────────────────────────────────────────────
// HappySanta — Onboarding Screen
// Shown once after first registration (swipeable slides).
// ─────────────────────────────────────────────────────────────
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '@/utils/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    emoji: '🎅',
    title: 'Meet HappySanta',
    body: 'Your AI-powered Christmas gift planner. Add your family and friends, set a budget, and let Santa\'s AI do the rest!',
    bg: ['#1a0a2e', '#2a0a1e'],
  },
  {
    key: '2',
    emoji: '🤖',
    title: 'AI Picks the Perfect Gifts',
    body: 'Our AI suggests 8–12 thoughtful, age-appropriate gifts tailored to interests and budget — with real Amazon products.',
    bg: ['#0d2818', '#1a0a2e'],
  },
  {
    key: '3',
    emoji: '📉',
    title: 'Never Overpay Again',
    body: 'We track prices 24/7. Get a 🔔 push notification the moment any gift on your list hits its ALL-TIME lowest price.',
    bg: ['#1a0a2e', '#2a1a0e'],
  },
  {
    key: '4',
    emoji: '🎁',
    title: 'Ready to Build Your List?',
    body: 'Start by adding a recipient — a child, partner, or parent — and watch HappySanta build the perfect Christmas list.',
    bg: ['#1a0020', '#1a0a2e'],
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [currentIdx, setCurrentIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIdx + 1, animated: true });
      setCurrentIdx((i) => i + 1);
    } else {
      navigation.replace('MainTabs');
    }
  };

  const skip = () => navigation.replace('MainTabs');

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.bg as [string, string]}
            style={styles.slide}
          >
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </LinearGradient>
        )}
      />

      <SafeAreaView style={styles.controls} edges={['bottom']}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIdx && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} style={styles.nextBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.santaRed, '#8B0000']}
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>
                {currentIdx === SLIDES.length - 1 ? "Let's Go! 🎄" : 'Next →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  slide: {
    width,
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  slideEmoji: { fontSize: 90, marginBottom: 24 },
  slideTitle: {
    fontFamily:   FONTS.christmas,
    fontSize:     34,
    color:        COLORS.textPrimary,
    textAlign:    'center',
    marginBottom: 16,
  },
  slideBody: {
    fontFamily: FONTS.body,
    fontSize:   16,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    lineHeight: 26,
  },
  controls: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    paddingHorizontal: 24,
    paddingBottom:   20,
  },
  dots: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            8,
    marginBottom:   20,
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: COLORS.santaRed,
    width:           24,
  },
  btnRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            12,
  },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  skipText: { fontFamily: FONTS.bodySemiBold, color: COLORS.textMuted, fontSize: 15 },
  nextBtn: {
    flex:         1,
    borderRadius: 14,
    overflow:     'hidden',
    shadowColor:  COLORS.santaRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation:    6,
  },
  nextGradient: { paddingVertical: 14, alignItems: 'center' },
  nextText: { fontFamily: FONTS.bodyBold, color: '#fff', fontSize: 16 },
});
