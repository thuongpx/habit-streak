// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import NotificationPermissionModal from "../src/components/NotificationPermissionModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { setupNotificationChannel } from "../src/utils/notifications";
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

const ASKED_PERMISSION_KEY = "habit_streak_asked_notif_permission_v1";

export default function RootLayout() {
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    // Tạo notification channel cho Android — no-op an toàn trên iOS
    // nếu setupNotificationChannel() đã tự check Platform.OS
    setupNotificationChannel();

    (async () => {
      try {
        const asked = await AsyncStorage.getItem(ASKED_PERMISSION_KEY);
        if (asked) return;

        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          await AsyncStorage.setItem(ASKED_PERMISSION_KEY, "1");
          return;
        }

        setShowPermissionModal(true);
      } catch (e) {
        console.warn("Check notification permission failed:", e);
      }
    })();
  }, []);

  useEffect(() => {
    mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      })
      .then(() => mobileAds().initialize())
      .then((adapterStatuses) => {
        if (__DEV__) console.log("[Ad] SDK initialized:", adapterStatuses);
      })
      .catch((err) => {
        if (__DEV__) console.warn("[Ad] SDK init failed:", err);
      });
  }, []);

  const markAsked = async () => {
    await AsyncStorage.setItem(ASKED_PERMISSION_KEY, "1");
    setShowPermissionModal(false);
  };

  const handleAllow = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch (e) {
      console.warn("requestPermissionsAsync failed:", e);
    }
    await markAsked();
  };

  const handleSkip = async () => {
    await markAsked();
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0F0F1A" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="edit-habit/[id]" options={{ presentation: "modal" }} />
          <Stack.Screen name="add-habit" options={{ presentation: "modal" }} />
          <Stack.Screen name="stats/[id]" options={{ presentation: "card" }} />
        </Stack>
        <NotificationPermissionModal
          visible={showPermissionModal}
          onAllow={handleAllow}
          onSkip={handleSkip}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});