import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { BreathingPhaseKey } from '../types/breathing';

type Props = {
  phaseKey: BreathingPhaseKey;
  progress: number;
  phaseDurationSeconds: number;
};

const SIZE = 220;
const RING_RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function BreathingCircle({ phaseKey, progress, phaseDurationSeconds }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const reduceMotionRef = React.useRef(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        reduceMotionRef.current = enabled;
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const targetScale = phaseKey === 'inhale' ? 1.15 : phaseKey === 'exhale' ? 0.9 : 1;
    const targetOpacity = phaseKey === 'hold' || phaseKey === 'exhale-hold' ? 0.7 : 1;
    const duration = Math.max(phaseDurationSeconds, 1) * 1000;

    if (reduceMotionRef.current) {
      opacity.value = withTiming(targetOpacity, { duration, easing: Easing.linear });
      scale.value = 1;
      return;
    }

    scale.value = withTiming(targetScale, { duration, easing: Easing.inOut(Easing.ease) });
    opacity.value = withTiming(targetOpacity, { duration, easing: Easing.linear });
  }, [opacity, phaseDurationSeconds, phaseKey, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View accessibilityLabel="Breathing animation and session progress" style={styles.wrapper}>
      <Svg height={SIZE} width={SIZE} style={styles.progressRing}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RING_RADIUS} stroke="#D6E4F0" strokeWidth={8} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RING_RADIUS}
          stroke="#2D7FF9"
          strokeWidth={8}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Animated.View style={[styles.circle, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: SIZE,
    width: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  circle: {
    height: 150,
    width: 150,
    borderRadius: 75,
    backgroundColor: '#7CB6FF',
  },
});
