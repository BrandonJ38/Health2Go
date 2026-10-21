import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

// Shown in the header of pages opened directly (link, refresh, notification) that have nothing to go back to.
export function HeaderHomeButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.replace('/')} style={styles.button} accessibilityRole="button" accessibilityLabel="Go to Home" hitSlop={8}>
      <Ionicons name="home-outline" size={20} color={colors.primary} />
      <Text style={styles.text}>Home</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12 },
  text: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
