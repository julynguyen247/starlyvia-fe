import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/apiClient';
import { colors, spacing, typography } from '../../theme/tokens';
import type { AuthScreenProps } from '../../types/navigation';
import { isEmail } from '../../utils/validation';
import { AuthShell } from './AuthShell';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
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
      email: !isEmail(email) ? 'Enter a valid email address.' : undefined,
      password: !password ? 'Enter your password.' : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    try {
      await signIn({ email: email.trim().toLowerCase(), password });
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
      title="Plan farther. Together."
      subtitle="Sign in to pick up your next adventure."
    >
      <AppInput
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
        autoComplete="current-password"
        error={errors.password}
        icon="lock-closed-outline"
        label="Password"
        onChangeText={(value) => {
          setPassword(value);
          setRequestError(null);
        }}
        onSubmitEditing={() => void submit()}
        placeholder="Your password"
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <AppButton label="Sign in" loading={isSubmitting} onPress={() => void submit()} />
      <View style={styles.prompt}>
        <Text style={styles.promptText}>New to Starlyvia?</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontSize: typography.small, fontWeight: '800' },
  linkButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  prompt: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  promptText: { color: colors.textMuted, fontSize: typography.small },
});
