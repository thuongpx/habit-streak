// src/store/habitStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, parseISO, differenceInCalendarDays } from 'date-fns';
import * as Notifications from 'expo-notifications';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HabitColor = 'c1' | 'c2' | 'c3' | 'c4' | 'c5';

export interface Habit {
  id:        string;
  name:      string;
  icon:      string;
  color:     HabitColor;
  createdAt: string;         // ISO date string
  reminderHour:   number | null;
  reminderMinute: number | null;
  // ID notification đã schedule cho habit này (để cancel khi edit/delete)
  notificationId: string | null;
  // Lưu lịch sử: key = 'YYYY-MM-DD', value = true/false
  history: Record<string, boolean>;
}

export interface HabitStore {
  habits:     Habit[];
  tickCount:  number;   // đếm tổng số lần tick để bắn Interstitial Ad

  // Actions
  loadHabits:    () => Promise<void>;
  addHabit:      (habit: Omit<Habit, 'id' | 'createdAt' | 'history' | 'notificationId'>, notificationId?: string | null) => Promise<void>;
  editHabit:     (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt' | 'history'>>) => Promise<void>;
  deleteHabit:   (id: string) => Promise<void>;
  toggleToday:   (id: string) => Promise<void>;
  isDoneToday:   (habit: Habit) => boolean;
  getStreak:     (habit: Habit) => number;
  getBestStreak: (habit: Habit) => number;
  getLast7Days:  (habit: Habit) => boolean[];
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'habit_streak_data_v1';

async function persist(habits: Habit[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function calcStreak(history: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    if (history[key]) streak++;
    else break;
  }
  return streak;
}

function calcBestStreak(history: Record<string, boolean>): number {
  const sortedKeys = Object.keys(history)
    .filter(k => history[k])
    .sort();
  if (!sortedKeys.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < sortedKeys.length; i++) {
    const prev = parseISO(sortedKeys[i - 1]);
    const curr = parseISO(sortedKeys[i]);
    if (differenceInCalendarDays(curr, prev) === 1) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }
  return best;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits:    [],
  tickCount: 0,

  loadHabits: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const habits: Habit[] = JSON.parse(raw);
        set({ habits });
      }
    } catch (e) {
      console.error('loadHabits error:', e);
    }
  },

  addHabit: async (data, notificationId = null) => {
    const { habits } = get();
    if (habits.length >= 5) return; // Max 5 habit
    const newHabit: Habit = {
      ...data,
      id:             Date.now().toString(),
      createdAt:      new Date().toISOString(),
      notificationId: notificationId ?? null,
      history:        {},
    };
    const updated = [...habits, newHabit];
    set({ habits: updated });
    await persist(updated);
  },

  editHabit: async (id, updates) => {
    const { habits } = get();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      return { ...h, ...updates };
    });
    set({ habits: updated });
    await persist(updated);
  },

  deleteHabit: async (id) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === id);

    // Cancel notification cũ nếu có, tránh orphaned notifications
    if (habit?.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(habit.notificationId);
      } catch (e) {
        console.warn('cancelScheduledNotificationAsync failed:', e);
      }
    }

    const updated = habits.filter(h => h.id !== id);
    set({ habits: updated });
    await persist(updated);
  },

  toggleToday: async (id) => {
    const { habits, tickCount } = get();
    const key = todayKey();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const wasDone = !!h.history[key];
      return {
        ...h,
        history: { ...h.history, [key]: !wasDone },
      };
    });
    // Tăng tickCount để trigger Interstitial Ad
    const wasDone = habits.find(h => h.id === id)?.history[key];
    const newTickCount = wasDone ? tickCount : tickCount + 1;
    set({ habits: updated, tickCount: newTickCount });
    await persist(updated);
  },

  isDoneToday: (habit) => {
    return !!habit.history[todayKey()];
  },

  getStreak: (habit) => calcStreak(habit.history),

  getBestStreak: (habit) => calcBestStreak(habit.history),

  getLast7Days: (habit) => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = format(d, 'yyyy-MM-dd');
      return !!habit.history[key];
    });
  },
}));
