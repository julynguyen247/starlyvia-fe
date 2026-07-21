import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StateView } from './src/components/StateView';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme/navigationTheme';

function Application() {
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <StateView
        loading
        message="Packing your travel universe…"
        presentation="screen"
        scene="welcome"
        title="Restoring your session"
      />
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Application />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
