// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * BẮT BUỘC — phải gọi trước mọi thứ liên quan notification.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

/**
 * Tạo notification channel cho Android — BẮT BUỘC từ Android 8.0+.
 * No-op an toàn trên iOS.
 */
export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('habit-reminders', {
    name: 'Nhắc nhở Habit',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

/**
 * Bắn 1 notification test sau 5 giây.
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test thông báo',
        body: 'Notification đang hoạt động tốt!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      } as any,
    });
    return true;
  } catch (e) {
    console.error('[Notif] sendTestNotification error:', e);
    return false;
  }
}

/**
 * Test schedule sau 1 phút.
 */
export async function sendTestIn1Minute(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    const now = new Date();
    const fireTime = new Date(now.getTime() + 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏱ Test 1 phút',
        body: `Fire lúc ${fireTime.toLocaleTimeString()}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      } as any,
    });
    return true;
  } catch (e) {
    console.error('[Notif] sendTestIn1Minute error:', e);
    return false;
  }
}

/**
 * Schedule daily reminder cho 1 habit.
 *
 * Dùng CALENDAR trigger — hoạt động đúng trên iOS (lặp lại chính xác
 * mỗi ngày đúng giờ, không bị lệch dần như TIME_INTERVAL + repeats).
 * LƯU Ý: CALENDAR trigger CHỈ hỗ trợ iOS — khi làm Android cần đổi
 * sang SchedulableTriggerInputTypes.DAILY (hỗ trợ cả 2 platform).
 */
export async function scheduleHabitReminder(
  habitName: string,
  hour: number,
  minute: number,
  oldNotificationId?: string | null
): Promise<string | null> {
  try {
    if (oldNotificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(oldNotificationId);
      } catch (e) {
        console.warn('[Notif] cancelScheduledNotificationAsync failed:', e);
      }
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[Notif] Permission not granted');
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Đến giờ làm habit rồi!',
        body: `Đừng quên: ${habitName}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      } as any,
    });

    if (__DEV__) {
      const all = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`[Notif] Scheduled ID: ${id} | Total: ${all.length}`);
    }

    return id;
  } catch (e) {
    console.error('[Notif] scheduleHabitReminder error:', e);
    return null;
  }
}

/**
 * Kiểm tra danh sách tất cả notification đang được schedule.
 */
export async function listScheduledNotifications() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  if (__DEV__) console.log('[Notif] All scheduled:', JSON.stringify(all, null, 2));
  return all;
}