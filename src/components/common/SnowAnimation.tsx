// ─────────────────────────────────────────────────────────────
// HappySanta — Snow Animation Component
// Lightweight CSS-free snow using Animated API.
// Renders N snowflakes falling from top to bottom.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const SNOWFLAKES = ['❄️', '❅', '❆', '•', '·'];

interface Snowflake {
  x: number;
  size: number;
  speed: number;
  opacity: number;
  symbol: string;
  delay: number;
}

function makeFlake(index: number): Snowflake {
  return {
    x:       Math.random() * SCREEN_W,
    size:    Math.random() * 12 + 8,
    speed:   Math.random() * 8000 + 6000,
    opacity: Math.random() * 0.6 + 0.2,
    symbol:  SNOWFLAKES[index % SNOWFLAKES.length],
    delay:   Math.random() * 5000,
  };
}

function SnowflakeView({ flake }: { flake: Snowflake }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 60; // gentle horizontal drift

    const fall = Animated.loop(
      Animated.parallel([
        Animated.timing(translateY, {
          toValue:         SCREEN_H + 20,
          duration:        flake.speed,
          delay:           flake.delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue:         drift,
            duration:        flake.speed / 2,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue:         -drift,
            duration:        flake.speed / 2,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    fall.start();
    return () => fall.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        position:  'absolute',
        left:      flake.x,
        top:       -20,
        fontSize:  flake.size,
        opacity:   flake.opacity,
        color:     '#ffffff',
        transform: [{ translateY }, { translateX }],
      }}
      pointerEvents="none"
    >
      {flake.symbol}
    </Animated.Text>
  );
}

const SnowflakeMemo = memo(SnowflakeView);

interface SnowAnimationProps {
  particleCount?: number;
}

export const SnowAnimation = memo(function SnowAnimation({
  particleCount = 40,
}: SnowAnimationProps) {
  const { snowEnabled } = useSettingsStore();

  if (!snowEnabled) return null;

  const flakes: Snowflake[] = Array.from({ length: particleCount }, (_, i) => makeFlake(i));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flakes.map((flake, i) => (
        <SnowflakeMemo key={i} flake={flake} />
      ))}
    </View>
  );
});
