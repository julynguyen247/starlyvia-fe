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

type Errors = { username?: string; email?: string; password?: string };

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const { register, isSubmitting } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [requestError, setRequestError] = useState<string | null>(null);

  async function submit() {
    if (isSubmitting) return;

    setRequestError(null);
    const nextErrors: Errors = {
      username: username.trim().length < 2 ? t('auth.nameTooShort') : undefined,
      email: !isEmail(email) ? t('auth.invalidEmail') : undefined,
      password: password.length < 8 ? t('auth.passwordTooShort') : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        username: username.trim(),
      });
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
      title={t('register.title')}
      subtitle={t('register.subtitle')}
    >
      <AppInput
        autoCapitalize="words"
        autoComplete="name"
        error={errors.username}
        icon="person-outline"
        label={t('auth.name')}
        onChangeText={(value) => {
          setUsername(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder={t('auth.namePlaceholder')}
        returnKeyType="next"
        value={username}
      />
      <AppInput
        ref={emailRef}
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
        autoComplete="new-password"
        error={errors.password}
        icon="lock-closed-outline"
        label={t('auth.password')}
        onChangeText={(value) => {
          setPassword(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => void submit()}
        placeholder={t('auth.newPasswordPlaceholder')}
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <AppButton label={t('register.action')} loading={isSubmitting} onPress={() => void submit()} />
      <View style={styles.prompt}>
        <Text style={styles.promptText}>{t('register.existing')}</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.linkButton}>
          <Text style={styles.link}>{t('register.signIn')}</Text>
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
