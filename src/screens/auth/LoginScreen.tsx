import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { AuthScreenProps } from '../../types/navigation';
import { isEmail } from '../../utils/validation';
import { AuthShell } from './AuthShell';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
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
      <View style={styles.prompt}>
        <Text style={styles.promptText}>{t('login.new')}</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
          <Text style={styles.link}>{t('login.createAccount')}</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    link: { color: colors.primaryText, fontSize: typography.small, fontWeight: '800' },
    linkButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
    prompt: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
    promptText: { color: colors.textMuted, fontSize: typography.small },
  });
}
