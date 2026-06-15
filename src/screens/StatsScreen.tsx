// src/screens/StatsScreen.tsx
import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useHabitStore } from '../store/habitStore';
import AdBanner from '../components/AdBanner';
import { COLORS, HABIT_COLORS, RADIUS, SPACING } from '../constants/theme';

const DAYS = 91; // 13 tuần × 7 ngày
const HEATMAP_COLS = 13;
const HEATMAP_GAP = 3;

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { habits, getStreak, getBestStreak } = useHabitStore();

  // ── Tổng hợp dữ liệu ─────────────────────────────────────────────────────
  const bestStreakAll = useMemo(
    () => habits.reduce((m, h) => Math.max(m, getBestStreak(h)), 0),
    [habits]
  );
  const curStreakAll = useMemo(
    () => habits.reduce((m, h) => Math.max(m, getStreak(h)), 0),
    [habits]
  );
  const totalDone = useMemo(() => {
    const keys = new Set<string>();
    habits.forEach(h => Object.keys(h.history).forEach(k => h.history[k] && keys.add(k)));
    return keys.size;
  }, [habits]);
  const completionRate = useMemo(() => {
    if (!habits.length || !DAYS) return 0;
    let done = 0, total = 0;
    const today = new Date();
    habits.forEach(h => {
      for (let i = 0; i < DAYS; i++) {
        const key = format(subDays(today, i), 'yyyy-MM-dd');
        total++;
        if (h.history[key]) done++;
      }
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [habits]);

  // ── Heatmap: 91 ngày, mỗi ô = tổng habit done hôm đó ────────────────────
  const heatmapData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS }, (_, i) => {
      const day = subDays(today, DAYS - 1 - i);
      const key = format(day, 'yyyy-MM-dd');
      const count = habits.filter(h => h.history[key]).length;
      return count;
    });
  }, [habits]);

  const maxCount = habits.length || 1;

  function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  const heatColors = [
    COLORS.bg3,
    'rgba(78,205,196,0.2)',
    'rgba(78,205,196,0.45)',
    'rgba(78,205,196,0.7)',
    COLORS.c3,
  ];

  // FIX #2: Tính heatCell width dựa trên screenWidth thực tế, không hardcode 340
  const heatCellSize = useMemo(() => {
    const containerWidth = screenWidth - SPACING.xl * 2;
    const totalGap = HEATMAP_GAP * (HEATMAP_COLS - 1);
    return (containerWidth - totalGap) / HEATMAP_COLS;
  }, [screenWidth]);

  // ── Tuần này ──────────────────────────────────────────────────────────────
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const key = format(day, 'yyyy-MM-dd');
      const isToday = i === 6;
      const doneCnt = habits.filter(h => h.history[key]).length;
      return {
        label: format(day, 'EEEEE', { locale: vi }).toUpperCase(),
        done: doneCnt > 0,
        isToday,
        doneCnt,
      };
    });
  }, [habits]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateLabel}>THỐNG KÊ</Text>
          <Text style={styles.heroTitle}>Tiến độ{'\n'}của bạn 🔥</Text>
          {bestStreakAll > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>🔥 Best streak: {bestStreakAll} ngày</Text>
            </View>
          )}
        </View>

        {/* Current streak big display */}
        <View style={styles.streakBig}>
          <Text style={styles.streakNum}>{curStreakAll}</Text>
          <View>
            <Text style={styles.streakLabel}>ngày liên tiếp{'\n'}hiện tại 🔥</Text>
            {/* FIX #1: chỉ hiện "Từ ngày..." khi đã có streak thật (>0) */}
            {curStreakAll > 0 && (
              <Text style={styles.streakSub}>
                Từ {format(subDays(new Date(), curStreakAll - 1), 'd/MM', { locale: vi })}
              </Text>
            )}
          </View>
        </View>

        {/* Stat cards 3 ô */}
        <View style={styles.statsRow}>
          {[
            { num: totalDone.toString(),     sub: 'Tổng ngày', color: COLORS.c3 },
            { num: completionRate + '%',      sub: 'Hoàn thành', color: COLORS.c4 },
            { num: habits.length.toString(), sub: 'Habit', color: COLORS.c2 },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Week view */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Tuần này</Text>
        </View>
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => (
            <View key={i} style={[
              styles.wday,
              d.done && styles.wdayDone,
              d.isToday && styles.wdayToday,
            ]}>
              <Text style={[styles.wdayLabel, d.isToday && { color: COLORS.c4 }]}>
                {d.label}
              </Text>
              <Text style={styles.wdayTick}>
                {d.isToday ? '🔥' : d.done ? '✓' : '–'}
              </Text>
            </View>
          ))}
        </View>

        {/* Per habit stats */}
        {habits.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Từng habit</Text>
            </View>
            <View style={styles.habitStatsCard}>
              {habits.map((h, i) => {
                const idx = parseInt(h.color.replace('c', '')) - 1;
                const palette = HABIT_COLORS[idx];
                const streak = getStreak(h);
                const doneCount = Object.values(h.history).filter(Boolean).length;
                const daysSinceCreated = Math.max(
                  1,
                  Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000)
                );
                const rate = Math.round((doneCount / daysSinceCreated) * 100);
                return (
                  <View key={h.id} style={[
                    styles.habitStatRow,
                    i < habits.length - 1 && styles.habitStatBorder,
                  ]}>
                    <View style={styles.habitStatTop}>
                      <View style={styles.habitStatLeft}>
                        <Text style={styles.habitStatIcon}>{h.icon}</Text>
                        <Text style={styles.habitStatName}>{h.name}</Text>
                      </View>
                      <View style={[styles.streakTag, { backgroundColor: palette.bg }]}>
                        <Text style={[styles.streakTagText, { color: palette.main }]}>
                          🔥 {streak} ngày
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pbarTrack}>
                      <View style={[styles.pbarFill, { width: `${rate}%`, backgroundColor: palette.main }]} />
                    </View>
                    <Text style={styles.habitStatSub}>
                      {rate}% hoàn thành ({doneCount}/{daysSinceCreated} ngày)
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Heatmap 91 ngày */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>91 ngày qua</Text>
        </View>
        <View style={styles.heatmap}>
          {heatmapData.map((count, i) => (
            <View
              key={i}
              style={[
                styles.heatCell,
                { width: heatCellSize, backgroundColor: heatColors[heatLevel(count)] },
              ]}
            />
          ))}
        </View>
        {/* Legend */}
        <View style={styles.heatLegend}>
          <Text style={styles.legendLabel}>Ít</Text>
          {[0, 1, 2, 3, 4].map(l => (
            <View key={l} style={[styles.legendDot, { backgroundColor: heatColors[l] }]} />
          ))}
          <Text style={styles.legendLabel}>Nhiều</Text>
        </View>

      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: .7, marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: -.5, lineHeight: 28 },
  streakBadge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(255,179,71,0.12)', borderWidth: 1, borderColor: 'rgba(255,179,71,0.28)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  streakBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.c2l, lineHeight: 16 },
  streakBig: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  streakNum: { fontSize: 52, fontWeight: '900', color: COLORS.c2, lineHeight: 56 },
  streakLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, lineHeight: 20 },
  streakSub: { fontSize: 11, color: COLORS.faint, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900' },
  statSub: { fontSize: 9, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: .5, marginTop: 3 },
  sectionHead: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  weekRow: { flexDirection: 'row', gap: 4, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  wday: { flex: 1, backgroundColor: COLORS.bg3, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  wdayDone: { backgroundColor: 'rgba(78,205,196,0.13)', borderWidth: 1, borderColor: 'rgba(78,205,196,0.3)' },
  wdayToday: { backgroundColor: 'rgba(167,139,250,0.13)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)' },
  wdayLabel: { fontSize: 9, fontWeight: '700', color: COLORS.faint, textTransform: 'uppercase' },
  wdayTick: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  habitStatsCard: { marginHorizontal: SPACING.xl, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  habitStatRow: { padding: 12 },
  habitStatBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  habitStatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  habitStatLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  habitStatIcon: { fontSize: 16, lineHeight: 20 },
  habitStatName: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  streakTag: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  streakTagText: { fontSize: 10, fontWeight: '700', lineHeight: 14 },
  pbarTrack: { height: 7, backgroundColor: COLORS.bg3, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  pbarFill: { height: '100%', borderRadius: 4 },
  habitStatSub: { fontSize: 10, color: COLORS.faint },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.xl, gap: HEATMAP_GAP, paddingBottom: SPACING.sm },
  heatCell: { aspectRatio: 1, borderRadius: 3 },
  heatLegend: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  legendLabel: { fontSize: 10, color: COLORS.faint },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
});
