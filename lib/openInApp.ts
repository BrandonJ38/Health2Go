import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';
import { colors } from '../constants/theme';

// Opens a page without leaving the app: an in-app browser sheet on phones (Safari View Controller /
// Chrome Custom Tabs — saved cards and Apple/Google Pay keep working), a new tab on the web.
// Resolves when the user closes the sheet (immediately on web).
export async function openInApp(url: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Linking.openURL(url);
    return;
  }
  try {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: colors.surface,
      controlsColor: colors.primary,
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } catch {
    await Linking.openURL(url); // no in-app browser available — fall back to the system browser
  }
}
