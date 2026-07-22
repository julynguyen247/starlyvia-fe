import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/apiClient';
import { spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { AuthScreenProps } from '../../types/navigation';
import { isEmail } from '../../utils/validation';
import { AuthShell } from './AuthShell';

type Errors = { username?: string; email?: string; password?: string };

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
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
      username: username.trim().length < 2 ? 'Use at least 2 characters.' : undefined,
      email: !isEmail(email) ? 'Enter a valid email address.' : undefined,
      password: password.length < 8 ? 'Use at least 8 characters.' : undefined,
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
          ? "We couldn't reach Starlyvia. Check your connection and try again."
          : getErrorMessage(error),
      );
    }
  }

  return (
    <AuthShell
      requestError={requestError}
      title="Your next story starts here."
      subtitle="Create an account and bring the right people along."
    >
      <AppInput
        autoCapitalize="words"
        autoComplete="name"
        error={errors.username}
        icon="person-outline"
        label="Name"
        onChangeText={(value) => {
          setUsername(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="How friends know you"
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
        label="Email"
        onChangeText={(value) => {
          setEmail(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="you@example.com"
        returnKeyType="next"
        value={email}
      />
      <AppInput
        ref={passwordRef}
        autoComplete="new-password"
        error={errors.password}
        icon="lock-closed-outline"
        label="Password"
        onChangeText={(value) => {
          setPassword(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => void submit()}
        placeholder="At least 8 characters"
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <AppButton label="Create account" loading={isSubmitting} onPress={() => void submit()} />
      <View style={styles.prompt}>
        <Text style={styles.promptText}>Already have an account?</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.linkButton}>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  link: { color: colors.primary, fontSize: typography.small, fontWeight: '800' },
  linkButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  prompt: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  promptText: { color: colors.textMuted, fontSize: typography.small },
  });
}
