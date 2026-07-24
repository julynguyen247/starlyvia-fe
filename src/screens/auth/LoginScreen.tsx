import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import type { AuthScreenProps } from '../../types/navigation';
import { isEmail } from '../../utils/validation';
import { AuthShell } from './AuthShell';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const { signIn, isSubmitting } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [requestError, setRequestError] = useState<string | null>(null);

  async function submit() {
    if (isSubmitting) return;

    setRequestError(null);
    const nextErrors = {
      email: !isEmail(email) ? t('auth.invalidEmail') : undefined,
      password: !password ? t('auth.passwordRequired') : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    try {
      await signIn({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      setRequestError(
        error instanceof TypeError
          ? t('auth.connectionError')
          : getErrorMessage(error),
      );
    }
  }

  return (
    <AuthShell
      requestError={requestError}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
    >
      <AppInput
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        icon="mail-outline"
        keyboardType="email-address"
        label={t('auth.email')}
        onChangeText={(value) => {
          setEmail(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder={t('auth.emailPlaceholder')}
        returnKeyType="next"
        value={email}
      />
      <AppInput
        ref={passwordRef}
        autoComplete="current-password"
        error={errors.password}
        icon="lock-closed-outline"
        label={t('auth.password')}
        onChangeText={(value) => {
          setPassword(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => void submit()}
        placeholder={t('auth.passwordPlaceholder')}
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <AppButton label={t('login.action')} loading={isSubmitting} onPress={() => void submit()} />
      <View className="flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm" style={{ color: colors.textMuted }}>{t('login.new')}</Text>
        <Pressable accessibilityRole="button" className="min-h-11 items-center justify-center" onPress={() => navigation.navigate('Register')}>
          <Text className="text-sm font-extrabold" style={{ color: colors.primaryText }}>{t('login.createAccount')}</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
