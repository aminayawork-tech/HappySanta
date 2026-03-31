// ─────────────────────────────────────────────────────────────
// HappySanta — Santa Loader / Full-screen Loading State
// Shown while the AI is generating gift suggestions.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SnowAnimation }  from './SnowAnimation';
import { COLORS, FONTS }  from '@/utils/constants';

const LOADING_MESSAGES = [
  'Checking the naughty & nice list... 📜',
  'Consulting with the elves... 🧝',
  'Searching Amazon\'s toy catalog... 🔍',
  'Wrapping gifts with care... 🎁',
  'Flying over the North Pole... 🦌',
  'Polishing the sleigh... 🛷',
  'Sprinkling Christmas magic... ✨',
];

interface SantaLoaderProps {
  message?: string;
}

export function SantaLoader({ message }: SantaLoaderProps) {
  const santaAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const [msgIndex, setMsgIndex] = React.useState(0);

  // Santa bobbing animation
  useEffect(() => {
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(santaAnim, {
          toValue:         -20,
          duration:        800,
          easing:          Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(santaAnim, {
          toValue:         0,
          duration:        800,
          easing:          Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    bob.start();
    return () => bob.stop();
  }, []);

  // Scale pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue:         1.1,
          duration:        600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1,
          duration:        600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Cycle through fun messages
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        // Fade in
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = message ?? LOADING_MESSAGES[msgIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bgMidnight, COLORS.bgDark]}
        style={StyleSheet.absoluteFill}
      />
      <SnowAnimation particleCount={25} />

      <Animated.Text
        style={[
          styles.santaEmoji,
          {
            transform: [
              { translateY: santaAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        🎅
      </Animated.Text>

      <Text style={styles.title}>HappySanta is thinking...</Text>

      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {displayMessage}
      </Animated.Text>

      {/* Dot loading indicator */}
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <PulsingDot key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue:         1,
          duration:        400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue:         0.3,
          duration:        400,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [delay]);

  return (
    <Animated.View style={[styles.dot, { opacity: anim }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgDark,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 32,
  },
  santaEmoji: {
    fontSize:     80,
    marginBottom: 24,
  },
  title: {
    fontFamily:   FONTS.christmas,
    fontSize:     28,
    color:        COLORS.textPrimary,
    marginBottom: 12,
    textAlign:    'center',
  },
  message: {
    fontFamily:   FONTS.body,
    fontSize:     16,
    color:        COLORS.textSecondary,
    textAlign:    'center',
    lineHeight:   24,
    marginBottom: 32,
    minHeight:    50,
  },
  dots: {
    flexDirection: 'row',
    gap:           10,
  },
  dot: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: COLORS.santaRed,
  },
});
