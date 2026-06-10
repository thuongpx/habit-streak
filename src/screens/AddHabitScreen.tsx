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
import { useHabitStore, HabitColor } from "../store/habitStore";
import AdBanner from "../components/AdBanner";
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


export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, addHabit } = useHabitStore();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💧");
  const [color, setColor] = useState<HabitColor>("c3");
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [saving, setSaving] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu tên", "Vui lòng nhập tên cho habit nhé!");
      return;
    }
    if (habits.length >= MAX_HABITS) {
      Alert.alert("Đã đủ 5 habit!", "Xoá habit cũ để thêm mới.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Schedule notification
    await scheduleReminder(name.trim(), hour, minute);

    await addHabit({
      name: name.trim(),
      icon,
      color,
      reminderHour: hour,
      reminderMinute: minute,
    });

    setSaving(false);
    router.back();
  }, [name, icon, color, hour, minute, habits, addHabit, router]);

  // ── Notification ──────────────────────────────────────────────────────────

  async function scheduleReminder(habitName: string, h: number, m: number) {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚡ Đến giờ làm habit rồi!",
          body: `Đừng quên: ${habitName}`,
          sound: true,
        },
        trigger: {
          hour: h,
          minute: m,
          repeats: true,
        } as any,
      });
    } catch (e) {
      console.warn("Schedule notification failed:", e);
    }
  }

  const colorIdx = parseInt(color.replace("c", "")) - 1;
  const palette = HABIT_COLORS[colorIdx];
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "SA" : "CH";

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.dateLabel}>MỚI</Text>
              <Text style={styles.heroTitle}>Thêm habit</Text>
            </View>
          </View>

          {/* Preview card */}
          <View
            style={[
              styles.previewCard,
              { borderLeftWidth: 3, borderLeftColor: palette.main },
            ]}
          >
            <View style={[styles.previewIcon, { backgroundColor: palette.bg }]}>
              <Text style={styles.previewIconText}>{icon}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {name.trim() || "Tên habit của bạn"}
              </Text>
              <Text style={[styles.previewStreak, { color: palette.light }]}>
                🔥 0 ngày streak
              </Text>
            </View>
            <View
              style={[styles.previewTick, { backgroundColor: palette.main }]}
            >
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
                    icon === ic && {
                      borderColor: COLORS.c4,
                      backgroundColor: COLORS.c4bg,
                    },
                  ]}
                  onPress={() => {
                    setIcon(ic);
                    Haptics.selectionAsync();
                  }}
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
                  onPress={() => {
                    setColor(c.key);
                    Haptics.selectionAsync();
                  }}
                />
              ))}
            </View>
          </View>

          {/* Time picker */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>GIỜ NHẮC NHỞ</Text>
            <View style={styles.timeRow}>
              {/* Hour scroll */}
              <ScrollView
                style={styles.timePicker}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / 40);
                  setHour(Math.min(23, Math.max(0, idx)));
                }}
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHour(h)}
                    style={styles.timeItem}
                  >
                    <Text
                      style={[
                        styles.timeItemText,
                        hour === h && styles.timeItemActive,
                      ]}
                    >
                      {h.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.timeColon}>:</Text>

              {/* Minute */}
              <View style={styles.timePicker}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMinute(m)}
                    style={styles.timeItem}
                  >
                    <Text
                      style={[
                        styles.timeItemText,
                        minute === m && styles.timeItemActive,
                      ]}
                    >
                      {m.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* AM/PM display */}
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

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Đang lưu..." : "Thêm habit ✓"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </ScrollView>

        <AdBanner />
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  dateLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: 0.7,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },

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
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  previewIconText: { fontSize: 22 },
  previewInfo: { flex: 1 },
  previewName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 3,
  },
  previewStreak: { fontSize: 11, fontWeight: "700" },
  previewTick: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTickText: { fontSize: 16, fontWeight: "800", color: "#fff" },

  field: { marginHorizontal: SPACING.xl, marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
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
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg3,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 20 },

  colorRow: { flexDirection: "row", gap: 12 },
  colorBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorBtnSel: { borderColor: "#fff" },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timePicker: { maxHeight: 120, flexGrow: 0 },
  timeItem: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  timeItemText: { fontSize: 18, fontWeight: "700", color: COLORS.faint },
  timeItemActive: { color: COLORS.c4, fontSize: 22, fontWeight: "900" },
  timeColon: { fontSize: 22, fontWeight: "900", color: COLORS.muted },
  ampmWrap: { marginLeft: "auto", alignItems: "center" },
  ampmText: { fontSize: 20, fontWeight: "900", color: COLORS.c4 },
  ampmSub: { fontSize: 10, color: COLORS.faint, marginTop: 3 },

  saveBtn: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.c4,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});
