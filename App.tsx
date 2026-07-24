import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

import { StateView } from './src/components/StateView';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function Application() {
  const { isRestoring } = useAuth();
  const { navigationTheme, statusBarStyle } = useAppTheme();
  const { t } = useLanguage();

  if (isRestoring) {
    return (
      <StateView
        loading
        message={t('restore.message')}
        presentation="screen"
        scene="welcome"
        title={t('restore.title')}
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
        <LanguageProvider>
          <AuthProvider>
            <Application />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
