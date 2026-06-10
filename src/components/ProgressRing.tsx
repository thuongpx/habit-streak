// src/components/ProgressRing.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedProps,
  withTiming, Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE    = 84;
const RADIUS  = 33;
const STROKE  = 7;
const CIRC    = 2 * Math.PI * RADIUS;

interface Props {
  done:  number;
  total: number;
}

export default function ProgressRing({ done, total }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(done / total, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [done, total]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  return (
    <View style={styles.wrap}>
      <Svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor={COLORS.c3} />
            <Stop offset="100%" stopColor={COLORS.c4} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        {/* Progress */}
        <AnimatedCircle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animatedProps={animProps}
        />
      </Svg>

      {/* Center text */}
      <View style={styles.center}>
        <Text style={styles.num}>{done}/{total}</Text>
        <Text style={styles.sub}>HÔM NAY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width:          84,
    height:         84,
    position:       'relative',
    alignItems:     'center',
    justifyContent: 'center',
  },
  center: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  num: {
    fontSize:   18,
    fontWeight: '900',
    color:      COLORS.text,
    lineHeight: 22,
  },
  sub: {
    fontSize:      8,
    fontWeight:    '700',
    color:         COLORS.muted,
    letterSpacing: 0.8,
  },
});
