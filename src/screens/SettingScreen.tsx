import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from "react-native-google-mobile-ads";
import * as Haptics from "expo-haptics";
import AdBanner from "../components/AdBanner";
import {
  COLORS,
  RADIUS,
  SPACING,
  THEMES
} from "../constants/theme";
import { useHabitStore } from "../store/habitStore";

// ── Rewarded Ad setup ─────────────────────────────────────────────────────────
// const rewardedUnitId = __DEV__
//   ? TestIds.REWARDED
//   : Platform.OS === "android"
//     ? AD_UNITS.REWARDED_ANDROID
//     : AD_UNITS.REWARDED_IOS;



export default function SettingScreen() {
  const insets = useSafeAreaInsets();
  const { habits, loadHabits } = useHabitStore();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(false);
  const [milestoneAlert, setMilestoneAlert] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("c4");
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["c4", "c3"]);
  const [loadingRewarded, setLoadingRewarded] = useState(false);

  // ── Rewarded Ad ────────────────────────────────────────────────────────────

  const handleWatchAd = useCallback(() => {
    setLoadingRewarded(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // const rewarded = RewardedAd.createForAdRequest(rewardedUnitId, {
    //   requestNonPersonalizedAdsOnly: true,
    // });

    // const unsubLoad = rewarded.addAdEventListener(
    //   RewardedAdEventType.LOADED,
    //   () => {
    //     setLoadingRewarded(false);
    //     rewarded.show();
    //   },
    // );

    // const unsubEarned = rewarded.addAdEventListener(
    //   RewardedAdEventType.EARNED_REWARD,
    //   () => {
    //     // Mở khoá tất cả theme khi xem xong quảng cáo
    //     const all = THEMES.map((t) => t.key);
    //     setUnlockedThemes(all);
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //     Alert.alert(
    //       "🎉 Mở khoá thành công!",
    //       "Tất cả theme đã được mở khoá. Cảm ơn bạn đã xem quảng cáo!",
    //     );
    //     unsubLoad();
    //     unsubEarned();
    //   },
    // );

    // rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
    //   setLoadingRewarded(false);
    // });

    // rewarded.load();
  }, []);

  // ── Backup / Restore ───────────────────────────────────────────────────────

  const handleBackup = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("habit_streak_data_v1");
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
            await AsyncStorage.removeItem("habit_streak_data_v1");
            await loadHabits();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ],
    );
  }, [loadHabits]);

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

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AN</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>An Nguyễn</Text>
            <Text style={styles.profileSub}>
              {habits.length} habit đang theo dõi
            </Text>
          </View>
        </View>

        {/* ── REWARDED AD — Mở theme ─────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.rewardedBtn}
          onPress={handleWatchAd}
          disabled={loadingRewarded}
          activeOpacity={0.85}
        >
          <Text style={styles.rewardedIcon}>🎨</Text>
          <View style={styles.rewardedInfo}>
            <Text style={styles.rewardedTitle}>Mở khoá theme Premium</Text>
            <Text style={styles.rewardedSub}>
              {loadingRewarded
                ? "Đang tải quảng cáo..."
                : "Xem 1 quảng cáo ngắn để nhận miễn phí"}
            </Text>
          </View>
          <View style={styles.rewardedCta}>
            <Text style={styles.rewardedCtaText}>
              {loadingRewarded ? "..." : "Nhận"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Theme ──────────────────────────────────────────────────────── */}
        <SettingsGroup title="Giao diện">
          <View style={[styles.srow, { paddingVertical: 14 }]}>
            <View
              style={[
                styles.srowIcon,
                { backgroundColor: "rgba(78,205,196,0.15)" },
              ]}
            >
              <Text style={styles.srowIconText}>🌙</Text>
            </View>
            <View style={styles.srowInfo}>
              <Text style={styles.srowName}>Màu accent</Text>
              <Text style={styles.srowSub}>Chọn màu chủ đạo</Text>
            </View>
            <View style={styles.themeRow}>
              {THEMES.map((t) => {
                const isLocked = !unlockedThemes.includes(t.key);
                const isSelected = selectedTheme === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => {
                      if (isLocked) {
                        handleWatchAd();
                        return;
                      }
                      setSelectedTheme(t.key);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.themeBtn,
                      { backgroundColor: t.color },
                      isSelected && styles.themeBtnSel,
                    ]}
                  >
                    {isLocked && <Text style={styles.themeLock}>🔒</Text>}
                  </TouchableOpacity>
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
            sub="7:00 sáng mỗi ngày"
            right={
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ true: COLORS.c3 }}
                thumbColor="#fff"
              />
            }
          />
          <SettingsRow
            icon="⏰"
            iconBg="rgba(249,202,36,0.15)"
            title="Nhắc cuối ngày"
            sub="21:00 nếu chưa tick đủ"
            right={
              <Switch
                value={eveningReminder}
                onValueChange={setEveningReminder}
                trackColor={{ true: COLORS.c3 }}
                thumbColor="#fff"
              />
            }
          />
          <SettingsRow
            icon="🏆"
            iconBg="rgba(255,107,107,0.15)"
            title="Milestone"
            sub="Khi đạt streak 7, 14, 30 ngày"
            right={
              <Switch
                value={milestoneAlert}
                onValueChange={setMilestoneAlert}
                trackColor={{ true: COLORS.c3 }}
                thumbColor="#fff"
              />
            }
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
          />
          <SettingsRow
            icon="📋"
            iconBg="rgba(78,205,196,0.15)"
            title="Phiên bản"
            sub="Habit Streak"
            right={<Text style={[styles.arrow, { fontSize: 11 }]}>v1.0.0</Text>}
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.c4,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "800", color: "#fff" },
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
  rewardedIcon: { fontSize: 26 },
  rewardedInfo: { flex: 1 },
  rewardedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 2,
  },
  rewardedSub: { fontSize: 11, color: COLORS.muted },
  rewardedCta: {
    backgroundColor: COLORS.c4,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  rewardedCtaText: { fontSize: 11, fontWeight: "800", color: "#fff" },

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
  srowIconText: { fontSize: 15 },
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
    alignItems: "center",
    justifyContent: "center",
  },
  themeBtnSel: { borderColor: "#fff" },
  themeLock: { fontSize: 8 },
});
