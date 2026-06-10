import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withSpring, withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, HABIT_COLORS, RADIUS, SPACING } from '../constants/theme';
import { Habit } from '../store/habitStore';

interface Props {
  habit:      Habit;
  isDone:     boolean;
  streak:     number;
  last7:      boolean[];
  onTick:     (id: string) => void;
  onLongPress:(id: string) => void;
}

export default function HabitCard({
  habit, isDone, streak, last7, onTick, onLongPress,
}: Props) {
  const colorIdx = parseInt(habit.color.replace('c', '')) - 1;
  const palette  = HABIT_COLORS[colorIdx];

  // ── Tick button scale animation ──────────────────────────────────────────
  const scale     = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const animStyle     = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));

  const handleTick = useCallback(() => {
    // Haptic feedback
    Haptics.impactAsync(
      isDone
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );
    // Button bounce animation
    scale.value = withSequence(
      withSpring(1.4, { damping: 4 }),
      withSpring(0.85, { damping: 6 }),
      withSpring(1.0, { damping: 8 }),
    );
    // Card subtle pulse
    cardScale.value = withSequence(
      withTiming(1.02, { duration: 80 }),
      withTiming(1.0,  { duration: 120 }),
    );
    runOnJS(onTick)(habit.id);
  }, [isDone, habit.id, onTick]);

  return (
    <Animated.View style={[styles.card, cardAnimStyle]}>
      {/* Left color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: palette.main }]} />

      <Pressable
        style={styles.inner}
        onLongPress={() => onLongPress(habit.id)}
        android_ripple={{ color: palette.bg }}
      >
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
          <Text style={styles.iconText}>{habit.icon}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.name, isDone && styles.nameDone]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.streak, { color: palette.light }]}>
              🔥 {streak} ngày
            </Text>
            {/* Last 7 dots */}
            <View style={styles.dots}>
              {last7.map((done, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    done && { backgroundColor: palette.main },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Tick button */}
        <Animated.View style={animStyle}>
          <TouchableOpacity
            onPress={handleTick}
            activeOpacity={0.8}
            style={[
              styles.tickBtn,
              isDone
                ? { backgroundColor: palette.main, borderColor: palette.main }
                : { borderColor: COLORS.bg3 },
            ]}
          >
            <Text style={[
              styles.tickIcon,
              { color: isDone ? '#fff' : COLORS.faint },
            ]}>
              {isDone ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
    flexDirection:   'row',
    marginBottom:    10,
  },
  accentBar: {
    width:         3,
    alignSelf:     'stretch',
  },
  inner: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.md,
    gap:           SPACING.md,
  },
  iconWrap: {
    width:         44,
    height:        44,
    borderRadius:  RADIUS.md,
    alignItems:    'center',
    justifyContent:'center',
  },
  iconText: {
    fontSize: 22,
  },
  info: {
    flex:    1,
    gap:     3,
    overflow:'hidden',
  },
  name: {
    fontSize:   14,
    fontWeight: '800',
    color:      COLORS.text,
    letterSpacing: -0.2,
  },
  nameDone: {
    opacity: 0.6,
  },
  meta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  streak: {
    fontSize:   11,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap:           3,
  },
  dot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: COLORS.bg3,
  },
  tickBtn: {
    width:          40,
    height:         40,
    borderRadius:   20,
    borderWidth:    2,
    alignItems:     'center',
    justifyContent: 'center',
  },
  tickIcon: {
    fontSize:   18,
    fontWeight: '800',
    lineHeight: 22,
  },
});
