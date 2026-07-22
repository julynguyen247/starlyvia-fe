import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StateView } from './src/components/StateView';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function Application() {
  const { isRestoring } = useAuth();
  const { navigationTheme, statusBarStyle } = useAppTheme();

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
      <StatusBar style={statusBarStyle} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Application />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
