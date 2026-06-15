// src/components/DrumPicker.tsx
import React, { useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  PanResponder, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';

export const ITEM_H  = 44;
export const VISIBLE = 3;
export const PICKER_H = ITEM_H * VISIBLE;

interface DrumPickerProps {
  data:     readonly number[];
  value:    number;
  onChange: (v: number) => void;
}

/**
 * DrumPicker — date picker dạng "trống quay" dùng PanResponder + Animated.
 * Không dùng ScrollView/FlatList để tránh lỗi onMomentumScrollEnd
 * không chính xác trên Android.
 */
export default function DrumPicker({ data, value, onChange }: DrumPickerProps) {
  const currentIdx = data.indexOf(value);
  const baseY = -(currentIdx * ITEM_H) + ITEM_H;

  // translateY và lastY dùng ref để tránh stale closure trong PanResponder
  const translateY = useRef(new Animated.Value(baseY)).current;
  const lastY = useRef(baseY);

  // onChange ref để PanResponder luôn gọi bản mới nhất
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const valueRef = useRef(value);
  valueRef.current = value;

  const snapToIdx = useCallback(
    (idx: number, animated = true) => {
      const clamped = Math.min(data.length - 1, Math.max(0, idx));
      const targetY = -(clamped * ITEM_H) + ITEM_H;
      lastY.current = targetY;
      if (animated) {
        Animated.spring(translateY, {
          toValue: targetY,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }).start();
      } else {
        translateY.setValue(targetY);
      }
      if (data[clamped] !== valueRef.current) {
        onChangeRef.current(data[clamped]);
        Haptics.selectionAsync();
      }
    },
    [data, translateY]
  );

  // useMemo thay vì useRef — đảm bảo panResponder được tạo đúng lúc
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > Math.abs(g.dx) + 2,
        onPanResponderGrant: () => {
          translateY.stopAnimation((current) => {
            lastY.current = current;
          });
        },
        onPanResponderMove: (_, g) => {
          translateY.setValue(lastY.current + g.dy);
        },
        onPanResponderRelease: (_, g) => {
          const newY = lastY.current + g.dy;
          const rawIdx = Math.round((ITEM_H - newY) / ITEM_H);
          snapToIdx(rawIdx);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapToIdx]
  );

  return (
    <View style={styles.drumWrap} {...panResponder.panHandlers}>
      <View style={styles.drumHighlight} pointerEvents="none" />
      <Animated.View style={{ transform: [{ translateY }] }}>
        {data.map((item, idx) => (
          <TouchableOpacity
            key={item}
            style={styles.drumItem}
            onPress={() => snapToIdx(idx)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.drumText,
                item === value && styles.drumTextActive,
              ]}
            >
              {item.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drumWrap: {
    flex: 1,
    height: PICKER_H,
    overflow: 'hidden',
  },
  drumHighlight: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    opacity: 0.6,
    zIndex: 1,
  },
  drumItem: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumText: { fontSize: 20, fontWeight: '700', color: COLORS.faint },
  drumTextActive: { fontSize: 24, fontWeight: '900', color: COLORS.c4 },
});
