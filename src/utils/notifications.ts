// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('habit-reminders', {
    name: 'Nhắc nhở Habit',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}


export async function sendTestNotification(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
 
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test thông báo',
        body:  'Nếu bạn thấy cái này, notification đang hoạt động tốt!',
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      },
      trigger: { seconds: 5 } as any,
    });
    return true;
  } catch (e) {
    console.warn('sendTestNotification failed:', e);
    return false;
  }
}
 
/**
 * Schedule daily reminder cho 1 habit.
 * Nếu có oldNotificationId, sẽ cancel notification cũ trước khi tạo mới
 * (dùng khi edit habit và đổi giờ nhắc).
 *
 * Trả về notificationId mới, hoặc null nếu user không cấp quyền / lỗi.
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
        console.warn('cancelScheduledNotificationAsync failed:', e);
      }
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Đến giờ làm habit rồi!',
        body:  `Đừng quên: ${habitName}`,
        sound: true,
      },
      trigger: { hour, minute, repeats: true } as any,
    });
    return id;
  } catch (e) {
    console.warn('Schedule notification failed:', e);
    return null;
  }
}
