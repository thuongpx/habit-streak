// src/screens/HomeScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter }         from 'expo-router';
import { Ionicons }          from '@expo/vector-icons';
import * as Haptics          from 'expo-haptics';
import { format }            from 'date-fns';
import { vi }                from 'date-fns/locale';

import { useHabitStore }     from '../store/habitStore';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { scheduleHabitReminder } from '../utils/notifications';
import HabitCard             from '../components/HabitCard';
import ProgressRing          from '../components/ProgressRing';
import MotivationBanner      from '../components/MotivationBanner';
import AdBanner              from '../components/AdBanner';
import { COLORS, HABIT_COLORS, HABIT_TEMPLATES, INTERSTITIAL_EVERY, MAX_HABITS, RADIUS, SPACING } from '../constants/theme';


export default function HomeScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const {
    habits, tickCount,
    loadHabits, toggleToday, deleteHabit, addHabit,
    isDoneToday, getStreak, getLast7Days,
  } = useHabitStore();
  const { showIfReady } = useInterstitialAd();

  // ── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    loadHabits();
  }, []);

  // ── Trigger Interstitial Ad sau mỗi N ticks ───────────────────────────────
  const prevTickCount = useRef(0);
  useEffect(() => {
    if (
      tickCount > 0 &&
      tickCount !== prevTickCount.current &&
      tickCount % INTERSTITIAL_EVERY === 0
    ) {
      // Delay nhỏ để tick animation hoàn thành trước
      setTimeout(() => showIfReady(), 600);
    }
    prevTickCount.current = tickCount;
  }, [tickCount]);

  // ── Computed values ───────────────────────────────────────────────────────
  const doneCount  = habits.filter(h => isDoneToday(h)).length;
  const totalCount = habits.length;

  const todayLabel = format(new Date(), "EEEE, d MMMM", { locale: vi })
    .toUpperCase();

  // Best overall streak (max across tất cả habit)
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, getStreak(h)), 0
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTick = useCallback((id: string) => {
    toggleToday(id);
  }, [toggleToday]);

  const handleLongPress = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    Alert.alert(
      habit.name,
      'Bạn muốn làm gì với habit này?',
      [
        { text: '✏️ Sửa habit', onPress: () => router.push(`/edit-habit/${id}`) },
        {
          text: '🗑 Xoá habit',
          style: 'destructive',
          onPress: () => Alert.alert(
            'Xoá habit?',
            `Toàn bộ lịch sử của "${habit.name}" sẽ bị xoá.`,
            [
              { text: 'Huỷ', style: 'cancel' },
              { text: 'Xoá', style: 'destructive', onPress: () => deleteHabit(id) },
            ]
          ),
        },
        { text: 'Huỷ', style: 'cancel' },
      ]
    );
  }, [habits, deleteHabit, router]);

  const handleAddHabit = () => {
    if (habits.length >= MAX_HABITS) {
      Alert.alert(
        '⚡ Đã đủ 5 habit!',
        'Habit Streak giới hạn tối đa 5 habit để bạn tập trung. Xoá một habit cũ để thêm mới.',
        [{ text: 'Hiểu rồi', style: 'default' }]
      );
      return;
    }
    router.push('/add');
  };

  // ── Habit Templates: tap để thêm nhanh, không cần qua form ────────────────
  const [addingTemplate, setAddingTemplate] = useState<string | null>(null);

  const handleSelectTemplate = useCallback(async (
    template: typeof HABIT_TEMPLATES[number]
  ) => {
    if (habits.length >= MAX_HABITS) {
      Alert.alert(
        '⚡ Đã đủ 5 habit!',
        'Habit Streak giới hạn tối đa 5 habit để bạn tập trung.',
        [{ text: 'Hiểu rồi', style: 'default' }]
      );
      return;
    }
    setAddingTemplate(template.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const notificationId = await scheduleHabitReminder(
      template.name,
      template.reminderHour,
      template.reminderMinute,
    );

    await addHabit({
      name: template.name,
      icon: template.icon,
      color: template.color,
      reminderHour: template.reminderHour,
      reminderMinute: template.reminderMinute,
    }, notificationId);

    setAddingTemplate(null);
  }, [habits, addHabit]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLabel}>{todayLabel}</Text>
            <Text style={styles.heroTitle}>Hôm nay{'\n'}của bạn 🔥</Text>
            {bestStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>
                  🔥 Chuỗi {bestStreak} ngày liên tiếp!
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="cog-outline" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* Progress section */}
        <View style={styles.progressSection}>
          <ProgressRing done={doneCount} total={Math.max(totalCount, 1)} />
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Tiến độ hôm nay</Text>

            {/* Progress bar */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' },
                ]}
              />
            </View>

            {/* Stats chips */}
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipVal}>{bestStreak}</Text>
                <Text style={styles.chipLabel}>🔥 best</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipVal}>{doneCount}</Text>
                <Text style={styles.chipLabel}>/{totalCount} xong</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Motivation banner */}
        <MotivationBanner done={doneCount} total={totalCount} />

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Habit của bạn</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddHabit}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state — hiện gợi ý habit phổ biến để tap thêm nhanh */}
        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>Chưa có habit nào</Text>
            <Text style={styles.emptySub}>
              Chọn nhanh 1 gợi ý dưới đây, hoặc tạo habit riêng của bạn
            </Text>

            {/* Habit templates grid */}
            <View style={styles.templateGrid}>
              {HABIT_TEMPLATES.map((t) => {
                const idx = parseInt(t.color.replace('c', '')) - 1;
                const palette = HABIT_COLORS[idx];
                const isLoading = addingTemplate === t.name;
                return (
                  <TouchableOpacity
                    key={t.name}
                    style={[styles.templateCard, { borderColor: palette.bg }]}
                    onPress={() => handleSelectTemplate(t)}
                    disabled={!!addingTemplate}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.templateIcon, { backgroundColor: palette.bg }]}>
                      <Text style={styles.templateIconText}>{t.icon}</Text>
                    </View>
                    <Text style={styles.templateName} numberOfLines={2}>
                      {isLoading ? 'Đang thêm...' : t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.emptyBtn} onPress={handleAddHabit}>
              <Text style={styles.emptyBtnText}>Tạo habit riêng của bạn</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Habit list */}
        <View style={styles.habitList}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isDone={isDoneToday(habit)}
              streak={getStreak(habit)}
              last7={getLast7Days(habit)}
              onTick={handleTick}
              onLongPress={handleLongPress}
            />
          ))}
        </View>

        {/* Habit slot indicator (tối đa 5) */}
        {habits.length > 0 && (
          <View style={styles.slotIndicator}>
            <Text style={styles.slotText}>
              {habits.length < MAX_HABITS
                ? `Còn ${MAX_HABITS - habits.length} chỗ trống`
                : '⚡ Đã đủ 5 habit (giới hạn)'}
            </Text>
            <View style={styles.slotPills}>
              {Array.from({ length: MAX_HABITS }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.slotPill,
                    i < habits.length && {
                      backgroundColor: HABIT_COLORS[i % HABIT_COLORS.length].main,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding để không bị banner ad che */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Banner Ad: sticky, KHÔNG che tab bar ──────────────────────── */}
      <AdBanner />

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: COLORS.bg,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  // Header
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop:        SPACING.md,
    paddingBottom:     SPACING.sm,
  },
  headerLeft: { flex: 1 },
  dateLabel: {
    fontSize:      12,
    fontWeight:    '700',
    color:         COLORS.muted,
    letterSpacing: 0.8,
    marginBottom:  4,
  },
  heroTitle: {
    fontSize:      26,
    fontWeight:    '900',
    color:         COLORS.text,
    letterSpacing: -0.5,
    lineHeight:    32,
  },
  streakBadge: {
    alignSelf:       'flex-start',
    marginTop:       8,
    backgroundColor: 'rgba(255,179,71,0.12)',
    borderWidth:     1,
    borderColor:     'rgba(255,179,71,0.28)',
    borderRadius:    20,
    paddingVertical:   4,
    paddingHorizontal: 12,
  },
  streakBadgeText: {
    fontSize:   12,
    fontWeight: '700',
    color:      COLORS.c2l,
    lineHeight: 17,
  },

  // Settings button (thay cho avatar)
  settingsBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: COLORS.bg3,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },

  // Progress section
  progressSection: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical:   SPACING.md,
  },
  progressInfo: { flex: 1 },
  progressLabel: {
    fontSize:     13,
    fontWeight:   '600',
    color:        COLORS.muted,
    marginBottom: 8,
  },
  barTrack: {
    height:          8,
    backgroundColor: COLORS.bg3,
    borderRadius:    4,
    overflow:        'hidden',
  },
  barFill: {
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.c4,
  },
  chips: {
    flexDirection: 'row',
    gap:           8,
    marginTop:     8,
  },
  chip: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              3,
    backgroundColor:  COLORS.bg3,
    borderRadius:     10,
    paddingVertical:   5,
    paddingHorizontal: 10,
  },
  chipVal: {
    fontSize:   12,
    fontWeight: '800',
    color:      COLORS.text,
  },
  chipLabel: {
    fontSize:   11,
    fontWeight: '600',
    color:      COLORS.muted,
    lineHeight: 16,
  },

  // Section header
  sectionHeader: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: SPACING.xl,
    paddingTop:        SPACING.lg,
    paddingBottom:     SPACING.sm,
  },
  sectionTitle: {
    fontSize:   16,
    fontWeight: '800',
    color:      COLORS.text,
  },
  addBtn: {
    width:           30,
    height:          30,
    borderRadius:    15,
    backgroundColor: COLORS.c4,
    alignItems:      'center',
    justifyContent:  'center',
  },
  addBtnText: {
    fontSize:   18,
    fontWeight: '300',
    color:      '#fff',
    lineHeight: 22,
  },

  // Habit list
  habitList: {
    paddingHorizontal: SPACING.xl,
  },

  // Empty state
  emptyState: {
    alignItems:        'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical:   SPACING.xxl,
    gap:               SPACING.sm,
  },
  emptyIcon:  { fontSize: 48, lineHeight: 56 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  emptySub:   { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop:         SPACING.md,
    backgroundColor:   COLORS.c4,
    borderRadius:      RADIUS.full,
    paddingVertical:   12,
    paddingHorizontal: 28,
  },
  emptyBtnText: {
    fontSize:   14,
    fontWeight: '800',
    color:      '#fff',
  },

  // Habit templates grid (empty state)
  templateGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    justifyContent: 'center',
    gap:           10,
    marginTop:     SPACING.md,
  },
  templateCard: {
    width:           '30%',
    minWidth:        90,
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.md,
    borderWidth:     1.5,
    paddingVertical:   12,
    paddingHorizontal: 8,
    alignItems:      'center',
    gap:             6,
  },
  templateIcon: {
    width:           36,
    height:          36,
    borderRadius:    RADIUS.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  templateIconText: { fontSize: 18, lineHeight: 22 },
  templateName: {
    fontSize:   11,
    fontWeight: '700',
    color:      COLORS.text,
    textAlign:  'center',
    lineHeight: 15,
  },

  // Slot indicator
  slotIndicator: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    marginHorizontal: SPACING.xl,
    marginTop:        SPACING.sm,
    backgroundColor:  COLORS.bg3,
    borderRadius:     RADIUS.md,
    paddingVertical:   10,
    paddingHorizontal: SPACING.md,
  },
  slotText: {
    fontSize:   12,
    fontWeight: '600',
    color:      COLORS.muted,
  },
  slotPills: {
    flexDirection: 'row',
    gap:           4,
  },
  slotPill: {
    width:           20,
    height:          8,
    borderRadius:    4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
