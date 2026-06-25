import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const widgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: 'HomeServerHealth',
      label: 'Home Server Health',
      minWidth: '320dp',
      minHeight: '120dp',
      targetCellWidth: 4,
      targetCellHeight: 2,
      description: 'Monitor your home server status at a glance',
      previewImage: './assets/widget-preview/home-server-health.png',
      // Update every 30 minutes (minimum allowed by Android)
      updatePeriodMillis: 1800000,
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Home Server Health',
  slug: 'home-server-health',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0f172a',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0f172a',
    },
    package: 'com.homeserverhealth.app',
  },
  plugins: [['react-native-android-widget', widgetConfig]],
});
