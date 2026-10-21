import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { remindersSupported, scheduleTipReminders } from '../lib/learn/tipReminders';
import { useProfile } from '../lib/profile/ProfileContext';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

// Keeps the next two weeks of tip notifications scheduled, and opens the article when one is tapped.
export function TipReminderSync() {
  const router = useRouter();
  const { profile, loaded } = useProfile();

  useEffect(() => {
    if (!remindersSupported || !loaded) return;
    scheduleTipReminders(profile).catch(() => {});
    // Re-schedule when the reminder time or anything that changes which tips are chosen changes.
  }, [loaded, profile.tipReminderHour, profile.avoid, profile.eatingOutChallenges]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!remindersSupported) return;
    const open = (response: Notifications.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    };
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [router]);

  return null;
}
