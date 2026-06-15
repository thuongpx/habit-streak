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
 * Tính số giây từ bây giờ đến lần HH:MM tiếp theo.
 * Ví dụ: bây giờ 14:35, target 07:00 → trả về giây đến 07:00 ngày mai.
 *         bây giờ 06:00, target 07:00 → trả về giây đến 07:00 hôm nay.
 */
function secondsUntilNextTime(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  // Nếu giờ target đã qua hôm nay, chuyển sang ngày mai
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return Math.round((target.getTime() - now.getTime()) / 1000);
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
 * CHIẾN LƯỢC: Dùng TIME_INTERVAL thay vì CALENDAR/DAILY vì:
 * - CALENDAR trigger không hoạt động đúng trên Expo Go iOS
 * - TIME_INTERVAL hoạt động nhất quán trên cả Expo Go lẫn production
 *
 * Cách hoạt động:
 * 1. Tính số giây đến lần HH:MM tiếp theo
 * 2. Schedule notification với TIME_INTERVAL đó, repeats: true (lặp mỗi 24h)
 *
 * Giới hạn: repeats với TIME_INTERVAL sẽ lặp mỗi N giây (không nhất thiết
 * đúng 24h vì drift), nhưng đủ chính xác cho habit reminder (sai vài giây).
 * Production build nên dùng CALENDAR/DAILY cho chính xác hơn.
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

    const secondsUntil = secondsUntilNextTime(hour, minute);
    const secondsIn24h = 24 * 60 * 60;

    console.log(
      `[Notif] Scheduling "${habitName}" at ${hour}:${String(minute).padStart(2,'0')}`,
      `→ fires in ${Math.round(secondsUntil / 60)} minutes`
    );

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Đến giờ làm habit rồi!',
        body: `Đừng quên: ${habitName}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        // Lần đầu fire sau N giây (đến giờ target hôm nay hoặc ngày mai)
        // Sau đó lặp lại mỗi 24h
        seconds: secondsUntil,
        repeats: true,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      } as any,
    });

    // Verify đã schedule
    const all = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[Notif] Scheduled ID: ${id} | Total: ${all.length}`);

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
  console.log('[Notif] All scheduled:', JSON.stringify(all, null, 2));
  return all;
}
