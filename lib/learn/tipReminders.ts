// Daily tip notifications (phone app only). A repeating notification would show the same text every day,
// so instead the next 14 days are scheduled individually and refreshed whenever the app opens.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Profile } from '../profile/types';
import { articleBySlug } from './articles';
import { tipForDate } from './tips';

const DAYS_AHEAD = 14;
const CHANNEL_ID = 'daily-tips';

export const remindersSupported = Platform.OS !== 'web';

export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

export async function scheduleTipReminders(profile: Profile): Promise<void> {
  if (!remindersSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (profile.tipReminderHour == null) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, { name: 'Daily tips', importance: Notifications.AndroidImportance.DEFAULT });
  }

  const now = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, profile.tipReminderHour, 0, 0);
    if (when <= now) continue;
    const tip = tipForDate(profile, when);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Today's tip · ${articleBySlug(tip.article)?.title ?? 'Learn'}`,
        body: tip.text,
        data: { url: `/learn/${tip.article}` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL_ID },
    });
  }
}
