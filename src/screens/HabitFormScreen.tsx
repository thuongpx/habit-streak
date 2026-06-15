// src/screens/HabitFormScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useHabitStore, Habit, HabitColor } from "../store/habitStore";
import AdBanner from "../components/AdBanner";
import DrumPicker, { PICKER_H } from "../components/DrumPicker";
import {
  COLORS,
  COLORS_LIST,
  HABIT_COLORS,
  HOURS,
  ICONS,
  MAX_HABITS,
  MINUTES,
  RADIUS,
  SPACING,
} from "../constants/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Notification helper — schedule mới, cancel cũ nếu có
// ─────────────────────────────────────────────────────────────────────────────
async function scheduleReminder(
  habitName: string,
  h: number,
  m: number,
  oldNotificationId?: string | null
): Promise<string | null> {
  try {
    // Cancel notification cũ trước (nếu đang edit)
    if (oldNotificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(oldNotificationId);
      } catch (e) {
        console.warn("cancelScheduledNotificationAsync failed:", e);
      }
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ Đến giờ làm habit rồi!",
        body: `Đừng quên: ${habitName}`,
        sound: true,
      },
      trigger: { hour: h, minute: m, repeats: true } as any,
    });
    return id;
  } catch (e) {
    console.warn("Schedule notification failed:", e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface HabitFormScreenProps {
  mode: "add" | "edit";
  /** Habit cần sửa — chỉ truyền khi mode === 'edit' */
  habit?: Habit;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function HabitFormScreen({ mode, habit }: HabitFormScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, addHabit, editHabit, deleteHabit } = useHabitStore();

  const isEdit = mode === "edit" && !!habit;

  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState(habit?.icon ?? "💧");
  const [color, setColor] = useState<HabitColor>(habit?.color ?? "c3");
  const [hour, setHour] = useState(habit?.reminderHour ?? 7);
  const [minute, setMinute] = useState(habit?.reminderMinute ?? 0);
  const [saving, setSaving] = useState(false);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu tên", "Vui lòng nhập tên cho habit nhé!");
      return;
    }
    // Chỉ check giới hạn 5 habit khi ĐANG THÊM MỚI
    if (!isEdit && habits.length >= MAX_HABITS) {
      Alert.alert("Đã đủ 5 habit!", "Xoá habit cũ để thêm mới.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const notificationId = await scheduleReminder(
      name.trim(),
      hour,
      minute,
      isEdit ? habit?.notificationId : null
    );

    if (isEdit && habit) {
      await editHabit(habit.id, {
        name: name.trim(),
        icon,
        color,
        reminderHour: hour,
        reminderMinute: minute,
        notificationId,
      });
    } else {
      await addHabit(
        {
          name: name.trim(),
          icon,
          color,
          reminderHour: hour,
          reminderMinute: minute,
        },
        notificationId
      );
    }

    setSaving(false);
    router.back();
  }, [name, icon, color, hour, minute, habits, isEdit, habit, addHabit, editHabit, router]);

  // ── Delete (chỉ hiện khi edit) ──────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!habit) return;
    Alert.alert(
      "Xoá habit?",
      `Toàn bộ lịch sử của "${habit.name}" sẽ bị xoá vĩnh viễn.`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteHabit(habit.id);
            router.back();
          },
        },
      ]
    );
  }, [habit, deleteHabit, router]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const colorIdx = parseInt(color.replace("c", "")) - 1;
  const palette = HABIT_COLORS[colorIdx];
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "SA" : "CH";

  const headerLabel = isEdit ? "CHỈNH SỬA" : "MỚI";
  const headerTitle = isEdit ? "Sửa habit" : "Thêm habit";
  const saveBtnLabel = saving
    ? "Đang lưu..."
    : isEdit
    ? "Lưu thay đổi ✓"
    : "Thêm habit ✓";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>{headerLabel}</Text>
              <Text style={styles.heroTitle}>{headerTitle}</Text>
            </View>
            {/* Nút xoá — chỉ hiện khi edit */}
            {isEdit && (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Preview card */}
          <View style={[styles.previewCard, { borderLeftWidth: 3, borderLeftColor: palette.main }]}>
            <View style={[styles.previewIcon, { backgroundColor: palette.bg }]}>
              <Text style={styles.previewIconText}>{icon}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {name.trim() || "Tên habit của bạn"}
              </Text>
              <Text style={[styles.previewStreak, { color: palette.light }]}>
                🔥 {isEdit ? "streak được giữ nguyên" : "0 ngày streak"}
              </Text>
            </View>
            <View style={[styles.previewTick, { backgroundColor: palette.main }]}>
              <Text style={styles.previewTickText}>○</Text>
            </View>
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>TÊN HABIT</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Vd: Uống 2L nước mỗi ngày"
              placeholderTextColor={COLORS.faint}
              maxLength={40}
              returnKeyType="done"
            />
          </View>

          {/* Icon picker */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CHỌN ICON</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconBtn,
                    icon === ic && { borderColor: COLORS.c4, backgroundColor: COLORS.c4bg },
                  ]}
                  onPress={() => { setIcon(ic); Haptics.selectionAsync(); }}
                >
                  <Text style={styles.iconBtnText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color picker */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CHỌN MÀU</Text>
            <View style={styles.colorRow}>
              {COLORS_LIST.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: c.main },
                    color === c.key && styles.colorBtnSel,
                  ]}
                  onPress={() => { setColor(c.key); Haptics.selectionAsync(); }}
                />
              ))}
            </View>
          </View>

          {/* Time picker */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>GIỜ NHẮC NHỞ</Text>
            <View style={styles.timeRow}>
              <DrumPicker data={HOURS} value={hour} onChange={setHour} />
              <Text style={styles.timeColon}>:</Text>
              <DrumPicker data={MINUTES} value={minute} onChange={setMinute} />
              <View style={styles.ampmWrap}>
                <Text style={styles.ampmText}>{ampm}</Text>
                <Text style={styles.ampmSub}>
                  {displayHour}:{minute.toString().padStart(2, "0")}
                </Text>
              </View>
            </View>
            <Text style={styles.fieldHint}>
              App sẽ gửi thông báo nhắc bạn mỗi ngày lúc {displayHour}:
              {minute.toString().padStart(2, "0")} {ampm}
            </Text>
          </View>

          <View style={{ height: 8 }} />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saveBtnLabel}</Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </ScrollView>

        <AdBanner />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },

  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: COLORS.muted },
  dateLabel: { fontSize: 11, fontWeight: "700", color: COLORS.muted, letterSpacing: 0.7 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: COLORS.text, letterSpacing: -0.5 },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: { fontSize: 16, lineHeight: 20 },

  previewCard: {
    margin: SPACING.xl,
    marginBottom: 8,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    overflow: "hidden",
  },
  previewIcon: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  previewIconText: { fontSize: 22, lineHeight: 26 },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 14, fontWeight: "800", color: COLORS.text, marginBottom: 3 },
  previewStreak: { fontSize: 11, fontWeight: "700", lineHeight: 16 },
  previewTick: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  previewTickText: { fontSize: 16, fontWeight: "800", color: "#fff" },

  field: { marginHorizontal: SPACING.xl, marginBottom: SPACING.md },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: COLORS.muted, letterSpacing: 0.5, marginBottom: 8 },
  fieldHint: { fontSize: 11, color: COLORS.faint, marginTop: 8 },
  input: {
    width: "100%",
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },

  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconBtn: {
    width: 42, height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg3,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 20, lineHeight: 24 },

  colorRow: { flexDirection: "row", gap: 12 },
  colorBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "transparent" },
  colorBtnSel: { borderColor: "#fff" },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  timeColon: { fontSize: 24, fontWeight: "900", color: COLORS.muted },
  ampmWrap: { width: 56, height: PICKER_H, alignItems: "center", justifyContent: "center" },
  ampmText: { fontSize: 22, fontWeight: "900", color: COLORS.c4 },
  ampmSub: { fontSize: 10, color: COLORS.faint, marginTop: 4 },

  saveBtn: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.c4,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});
