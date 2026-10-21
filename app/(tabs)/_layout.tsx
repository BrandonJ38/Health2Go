import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { ColorValue, Pressable } from 'react-native';
import { colors } from '../../constants/theme';
import { useProfile } from '../../lib/profile/ProfileContext';

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;

// Five main sections as bottom tabs; Profile (the sixth screen) opens from the header.
export default function TabsLayout() {
  const { profile, loaded } = useProfile();
  // First launch: send people through the quick start before showing the app.
  if (!loaded) return null;
  if (!profile.onboardingComplete) return <Redirect href={{ pathname: '/setup', params: { mode: 'quick' } }} />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerRight: () => (
          <Link href="/profile" asChild>
            <Pressable accessibilityLabel="Profile and settings" style={{ marginRight: 16 }}>
              <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
            </Pressable>
          </Link>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="tracker" options={{ title: 'Calories', tabBarIcon: tabIcon('nutrition-outline') }} />
      <Tabs.Screen name="nearby" options={{ title: 'Nearby', tabBarIcon: tabIcon('location-outline') }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: tabIcon('flask-outline') }} />
      <Tabs.Screen name="diet" options={{ title: 'Diet Builder', tabBarIcon: tabIcon('restaurant-outline') }} />
    </Tabs>
  );
}
