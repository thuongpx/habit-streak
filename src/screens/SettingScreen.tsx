import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// TODO: Bật lại khi AdMob config plugin đã fix xong (xem SETUP_GUIDE.md)
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from "react-native-google-mobile-ads";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { scheduleHabitReminder } from "../utils/notifications";
import AdBanner from "../components/AdBanner";
import {
  COLORS,
  RADIUS,
  SPACING,
  THEMES,
} from "../constants/theme";
import { useHabitStore } from "../store/habitStore";

const NOTIF_ENABLED_KEY = "habit_streak_notif_enabled_v1";
const STORAGE_KEY = "habit_streak_data_v1";

// ── Rewarded Ad setup ─────────────────────────────────────────────────────────
// const rewardedUnitId = __DEV__
//   ? TestIds.REWARDED
//   : Platform.OS === "android"
//     ? AD_UNITS.REWARDED_ANDROID
//     : AD_UNITS.REWARDED_IOS;

const PRIVACY_POLICY_URL = "https://thuongpx.github.io/habitstreak-policy/privacy-policy";
const TERMS_OF_SERVICE_URL = "https://thuongpx.github.io/habitstreak-policy/terms-of-service";
// TODO: điền App Store ID thật sau khi app được duyệt lần đầu trên App Store Connect
const APP_STORE_ID = "";

// FIX: tạm thời mở khoá hết theme vì rewarded ads chưa hoạt động —
// tránh để tính năng "cụt" (khoá vĩnh viễn không cách nào mở) khi submit
const ALL_THEME_KEYS = THEMES.map((t) => t.key);

export default function SettingScreen() {
  const insets = useSafeAreaInsets();
  const { habits, loadHabits, editHabit } = useHabitStore();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("c4");
  const [unlockedThemes] = useState<string[]>(ALL_THEME_KEYS); // FIX: mở hết tạm thời

  // ── Load trạng thái bật/tắt notification đã lưu ─────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
        // Mặc định true nếu chưa từng lưu (user mới)
        setDailyReminder(raw === null ? true : raw === "1");
      } catch (e) {
        console.warn("Load notif setting failed:", e);
      }
    })();
  }, []);

  // ── Toggle nhắc nhở hằng ngày — wiring thật với cancel/reschedule ───────
  const handleToggleDailyReminder = useCallback(
    async (next: boolean) => {
      setReminderLoading(true);
      Haptics.selectionAsync();
      try {
        if (!next) {
          // TẮT: cancel toàn bộ notification đang schedule, xoá notificationId khỏi từng habit
          for (const h of habits) {
            if (h.notificationId) {
              try {
                await Notifications.cancelScheduledNotificationAsync(h.notificationId);
              } catch (e) {
                console.warn("Cancel notification failed:", e);
              }
              await editHabit(h.id, { notificationId: null });
            }
          }
        } else {
          // BẬT LẠI: re-schedule dựa theo giờ đã lưu sẵn cho từng habit
          for (const h of habits) {
            if (h.reminderHour == null || h.reminderMinute == null) continue;
            const id = await scheduleHabitReminder(
              h.name,
              h.reminderHour,
              h.reminderMinute,
              h.notificationId
            );
            await editHabit(h.id, { notificationId: id });
          }
        }
        await AsyncStorage.setItem(NOTIF_ENABLED_KEY, next ? "1" : "0");
        setDailyReminder(next);
      } catch (e) {
        console.warn("Toggle daily reminder failed:", e);
        Alert.alert("Lỗi", "Không thể cập nhật cài đặt thông báo, thử lại nhé!");
      } finally {
        setReminderLoading(false);
      }
    },
    [habits, editHabit]
  );

  // ── Rewarded Ad (tạm khoá, chưa có SDK thật) ────────────────────────────
  const handleWatchAd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "🚧 Sắp ra mắt!",
      "Tính năng mở khoá theme bằng quảng cáo sẽ sớm có trong bản cập nhật tiếp theo."
    );
  }, []);

  // ── Backup / Restore ───────────────────────────────────────────────────────

  const handleBackup = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        Alert.alert("Không có dữ liệu", "Chưa có habit nào để backup.");
        return;
      }
      await Share.share({ message: raw, title: "Habit Streak Backup" });
    } catch (e) {
      Alert.alert("Lỗi", "Không thể export dữ liệu.");
    }
  }, []);

  const handleReset = useCallback(() => {
    Alert.alert(
      "🗑 Xoá toàn bộ dữ liệu?",
      "Tất cả habit và lịch sử streak sẽ bị xoá vĩnh viễn. Không thể hoàn tác!",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá hết",
          style: "destructive",
          onPress: async () => {
            // FIX: cancel toàn bộ notification trước khi xoá data,
            // tránh user vẫn nhận nhắc nhở cho habit đã không còn tồn tại
            for (const h of habits) {
              if (h.notificationId) {
                try {
                  await Notifications.cancelScheduledNotificationAsync(h.notificationId);
                } catch (e) {
                  console.warn("Cancel notification failed:", e);
                }
              }
            }
            await AsyncStorage.removeItem(STORAGE_KEY);
            await loadHabits();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }, [habits, loadHabits]);

  const handleOpenURL = useCallback(async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Không mở được", "Vui lòng thử lại sau.");
    }
  }, []);

  const handleRateApp = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
        return;
      }
    } catch (e) {
      console.warn("StoreReview failed:", e);
    }
    // Fallback: mở thẳng trang App Store nếu có ID
    if (APP_STORE_ID) {
      Linking.openURL(`https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`);
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateLabel}>TÙY CHỈNH</Text>
          <Text style={styles.heroTitle}>Cài đặt</Text>
        </View>

        {/* Stats summary card */}
        <View style={styles.profileCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="flame" size={22} color={COLORS.c2} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Hành trình của bạn</Text>
            <Text style={styles.profileSub}>
              {habits.length} habit đang theo dõi
            </Text>
          </View>
        </View>

        {/* ── REWARDED AD — Mở theme (tạm ẩn CTA thật, chỉ hiện "sắp ra mắt") */}
        <TouchableOpacity
          style={styles.rewardedBtn}
          onPress={handleWatchAd}
          activeOpacity={0.85}
        >
          <Text style={styles.rewardedIcon}>🎨</Text>
          <View style={styles.rewardedInfo}>
            <Text style={styles.rewardedTitle}>Theme Premium</Text>
            <Text style={styles.rewardedSub}>
              Tất cả theme hiện đang miễn phí 🎉
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Theme ──────────────────────────────────────────────────────── */}
        <SettingsGroup title="Giao diện">
          <View style={[styles.srow, { paddingVertical: 14 }]}>
            <View
              style={[styles.srowIcon, { backgroundColor: "rgba(78,205,196,0.15)" }]}
            >
              <Text style={styles.srowIconText}>🌙</Text>
            </View>
            <View style={styles.srowInfo}>
              <Text style={styles.srowName}>Màu accent</Text>
              <Text style={styles.srowSub}>Chọn màu chủ đạo</Text>
            </View>
            <View style={styles.themeRow}>
              {THEMES.map((t) => {
                const isSelected = selectedTheme === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => {
                      setSelectedTheme(t.key);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.themeBtn,
                      { backgroundColor: t.color },
                      isSelected && styles.themeBtnSel,
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </SettingsGroup>

        {/* ── Notifications ──────────────────────────────────────────────── */}
        <SettingsGroup title="Thông báo">
          <SettingsRow
            icon="🔔"
            iconBg="rgba(255,179,71,0.15)"
            title="Nhắc nhở hằng ngày"
            sub="Theo giờ đã đặt cho từng habit"
            right={
              <Switch
                value={dailyReminder}
                onValueChange={handleToggleDailyReminder}
                disabled={reminderLoading}
                trackColor={{ true: COLORS.c3 }}
                thumbColor="#fff"
              />
            }
          />
          <SettingsRow
            icon="⏰"
            iconBg="rgba(249,202,36,0.15)"
            title="Nhắc cuối ngày"
            sub="Sắp ra mắt"
            titleStyle={{ color: COLORS.faint }}
            right={<Switch value={false} disabled trackColor={{ true: COLORS.c3 }} thumbColor="#fff" />}
          />
          <SettingsRow
            icon="🏆"
            iconBg="rgba(255,107,107,0.15)"
            title="Milestone"
            sub="Sắp ra mắt"
            titleStyle={{ color: COLORS.faint }}
            right={<Switch value={false} disabled trackColor={{ true: COLORS.c3 }} thumbColor="#fff" />}
            isLast
          />
        </SettingsGroup>

        {/* ── Dữ liệu ────────────────────────────────────────────────────── */}
        <SettingsGroup title="Dữ liệu">
          <SettingsRow
            icon="💾"
            iconBg="rgba(78,205,196,0.15)"
            title="Backup dữ liệu"
            sub="Export JSON về máy"
            right={<Text style={styles.arrow}>›</Text>}
            onPress={handleBackup}
          />
          <SettingsRow
            icon="🗑"
            iconBg="rgba(255,107,107,0.15)"
            title="Xoá toàn bộ dữ liệu"
            sub="Không thể hoàn tác"
            titleStyle={{ color: COLORS.c1 }}
            right={<Text style={styles.arrow}>›</Text>}
            onPress={handleReset}
            isLast
          />
        </SettingsGroup>

        {/* ── About ───────────────────────────────────────────────────────── */}
        <SettingsGroup title="Thông tin">
          <SettingsRow
            icon="⭐"
            iconBg="rgba(249,202,36,0.15)"
            title="Đánh giá app"
            sub="Giúp mình lên store nha!"
            right={<Text style={styles.arrow}>›</Text>}
            onPress={handleRateApp}
          />
          <SettingsRow
            icon="🔒"
            iconBg="rgba(78,205,196,0.15)"
            title="Chính sách bảo mật"
            sub="Cách app xử lý dữ liệu của bạn"
            right={<Text style={styles.arrow}>›</Text>}
            onPress={() => handleOpenURL(PRIVACY_POLICY_URL)}
          />
          <SettingsRow
            icon="📄"
            iconBg="rgba(167,139,250,0.15)"
            title="Điều khoản sử dụng"
            sub="Quy định khi dùng app"
            right={<Text style={styles.arrow}>›</Text>}
            onPress={() => handleOpenURL(TERMS_OF_SERVICE_URL)}
          />
          <SettingsRow
            icon="📋"
            iconBg="rgba(78,205,196,0.15)"
            title="Phiên bản"
            sub="Habit Streak"
            right={
              <Text style={[styles.arrow, { fontSize: 11 }]}>
                v{Constants.expoConfig?.version ?? "1.0.0"}
              </Text>
            }
            isLast
          />
        </SettingsGroup>

        <View style={{ height: 12 }} />
      </ScrollView>

      <AdBanner />
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

interface RowProps {
  icon: string;
  iconBg: string;
  title: string;
  sub: string;
  right: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  titleStyle?: object;
}

function SettingsRow({
  icon,
  iconBg,
  title,
  sub,
  right,
  onPress,
  isLast,
  titleStyle,
}: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.srow, !isLast && styles.srowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.srowIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.srowIconText}>{icon}</Text>
      </View>
      <View style={styles.srowInfo}>
        <Text style={[styles.srowName, titleStyle]}>{title}</Text>
        <Text style={styles.srowSub}>{sub}</Text>
      </View>
      <View style={styles.srowRight}>{right}</View>
    </TouchableOpacity>
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
  },
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

  profileCard: {
    margin: SPACING.xl,
    marginBottom: 8,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.c2bg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  profileSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },

  rewardedBtn: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    backgroundColor: "rgba(167,139,250,0.08)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.22)",
    borderRadius: RADIUS.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardedIcon: { fontSize: 26, lineHeight: 30 },
  rewardedInfo: { flex: 1 },
  rewardedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 2,
  },
  rewardedSub: { fontSize: 11, color: COLORS.muted },

  group: { marginHorizontal: SPACING.xl, marginBottom: SPACING.md },
  groupTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.faint,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  srow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13 },
  srowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  srowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  srowIconText: { fontSize: 15, lineHeight: 20 },
  srowInfo: { flex: 1 },
  srowName: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  srowSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  srowRight: { flexShrink: 0 },
  arrow: { fontSize: 18, color: COLORS.faint },

  themeRow: { flexDirection: "row", gap: 6 },
  themeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeBtnSel: { borderColor: "#fff" },
});