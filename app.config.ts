import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const androidMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();
  const plugins = [...(config.plugins ?? [])];

  if (androidMapsApiKey) {
    plugins.push([
      'react-native-maps',
      { androidGoogleMapsApiKey: androidMapsApiKey },
    ]);
  }

  return {
    ...config,
    name: config.name ?? 'Starlyvia',
    plugins,
    slug: config.slug ?? 'starlyvia',
  };
};
