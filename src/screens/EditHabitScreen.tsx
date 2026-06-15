// src/screens/EditHabitScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore } from '../store/habitStore';
import HabitFormScreen from './HabitFormScreen';
import { COLORS, SPACING } from '../constants/theme';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits } = useHabitStore();

  const habit = habits.find(h => h.id === id);

  // Trường hợp habit không tồn tại (vd: đã bị xoá ở tab khác)
  if (!habit) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundIcon}>🤔</Text>
        <Text style={styles.notFoundTitle}>Không tìm thấy habit</Text>
        <Text style={styles.notFoundSub}>Habit này có thể đã bị xoá.</Text>
      </View>
    );
  }

  return <HabitFormScreen mode="edit" habit={habit} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: SPACING.xxl,
  },
  notFoundIcon: { fontSize: 48, lineHeight: 56 },
  notFoundTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  notFoundSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
});
