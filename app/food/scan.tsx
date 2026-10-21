import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { localDate } from '../../lib/food/types';

// /food/scan?meal=…&date=…  — camera barcode scanner on phones; typed barcode on web.
export default function ScanScreen() {
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [typed, setTyped] = useState('');
  const handled = useRef(false);

  const openProduct = (barcode: string) =>
    router.replace({ pathname: '/food/product', params: { barcode, meal: params.meal ?? '', date: params.date ?? localDate() } });

  const typedEntry = (
    <View style={styles.typedRow}>
      <TextInput
        style={styles.typedInput}
        value={typed}
        onChangeText={(t) => setTyped(t.replace(/\D/g, ''))}
        placeholder="Type the barcode number"
        placeholderTextColor={colors.textMuted}
        inputMode="numeric"
        keyboardType="number-pad"
        onSubmitEditing={() => typed && openProduct(typed)}
        accessibilityLabel="Barcode number"
      />
      <Pressable style={[styles.goButton, !typed && { opacity: 0.4 }]} disabled={!typed} onPress={() => openProduct(typed)}>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  // Barcode scanning through a computer webcam is unreliable, so web uses typed entry.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.message}>
        <Ionicons name="phone-portrait-outline" size={40} color={colors.primary} />
        <Text style={styles.title}>Scanning works in the phone app</Text>
        <Text style={styles.muted}>On the web, type the number printed under the barcode instead.</Text>
        {typedEntry}
      </View>
    );
  }

  if (!permission) return <View style={styles.message} />;
  if (!permission.granted) {
    return (
      <View style={styles.message}>
        <Ionicons name="camera-outline" size={40} color={colors.primary} />
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.muted}>The camera is only used to read barcodes. Nothing is recorded or saved.</Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.primary} onPress={requestPermission}>
            <Text style={styles.primaryText}>Allow camera</Text>
          </Pressable>
        ) : (
          <Text style={styles.muted}>Camera access is turned off. Enable it in your phone's settings, or type the barcode:</Text>
        )}
        {typedEntry}
      </View>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={({ data }) => {
          // The scanner fires repeatedly while the code is in view — only act once.
          if (handled.current || !data) return;
          handled.current = true;
          openProduct(data.replace(/\D/g, ''));
        }}
      />
      <View style={styles.frame} pointerEvents="none" />
      <View style={styles.bottom}>
        <Text style={styles.cameraHint}>Point the camera at the barcode</Text>
        {typedEntry}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  muted: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  primary: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: spacing.lg },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  typedRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', maxWidth: 420 },
  typedInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  goButton: { width: 46, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  cameraScreen: { flex: 1, backgroundColor: '#000000' },
  frame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 160,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 16,
  },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.lg, gap: spacing.md, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  cameraHint: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
