import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { HeaderHomeButton } from '../components/HeaderHomeButton';
import { TipReminderSync } from '../components/TipReminderSync';
import { colors } from '../constants/theme';
import { AuthProvider } from '../lib/cloud/AuthContext';
import { CloudSync } from '../lib/cloud/CloudSync';
import { FoodLogProvider } from '../lib/food/FoodLogContext';
import { ProfileProvider } from '../lib/profile/ProfileContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <FoodLogProvider>
          <StatusBar style="dark" />
          <TipReminderSync />
          <CloudSync />
          <Stack
            screenOptions={({ navigation }) => ({
              headerTintColor: colors.primary,
              headerStyle: { backgroundColor: colors.surface },
              contentStyle: { backgroundColor: colors.background },
              // Pages opened directly have no back button — offer a way home instead.
              ...(navigation.canGoBack() ? {} : { headerLeft: () => <HeaderHomeButton /> }),
            })}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ title: 'Profile & Settings' }} />
            <Stack.Screen name="account" options={{ title: 'Account' }} />
            <Stack.Screen name="setup" options={{ headerShown: false, gestureEnabled: false }} />
            {/* Sub-screens of the tabs — not separate screens in the 5–7 cap. */}
            <Stack.Screen name="food/add" options={{ title: 'Add food', presentation: 'modal' }} />
            <Stack.Screen name="food/product" options={{ title: 'Product' }} />
            <Stack.Screen name="food/scan" options={{ title: 'Scan barcode' }} />
            <Stack.Screen name="learn/[slug]" options={{ title: 'Learn' }} />
            <Stack.Screen name="guide/[restaurant]" options={{ title: 'What to order' }} />
          </Stack>
        </FoodLogProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
