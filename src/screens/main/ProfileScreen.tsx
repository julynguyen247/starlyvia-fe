import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Avatar } from '../../components/Avatar';
import { PlayfulHero } from '../../components/PlayfulHero';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../services/apiClient';
import { radius, spacing, typography, type ThemeColors, type ThemePreference } from '../../theme/tokens';

const themeOptions: Array<{
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: ThemePreference;
}> = [
  { description: 'Match device', icon: 'phone-portrait-outline', label: 'System', value: 'system' },
  { description: 'Bright & airy', icon: 'sunny-outline', label: 'Light', value: 'light' },
  { description: 'Soft & focused', icon: 'moon-outline', label: 'Dark', value: 'dark' },
];

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, preference, resolvedScheme, setPreference } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch {
      setSignOutError("We couldn't finish signing out. Please try again.");
      setSigningOut(false);
    }
  }

  function confirmSignOut() {
    if (signingOut) return;
    Alert.alert('Sign out?', 'You can sign back in on this device anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void handleSignOut() },
    ]);
  }

  const travelerName = user?.username ?? 'Explorer';

  return (
    <Screen>
      <PlayfulHero
        badge={<Avatar name={travelerName} size={74} uri={user?.avatarUrl} />}
        description={user?.email ?? 'Your Starlyvia traveler profile'}
        eyebrow="TRAVELER PROFILE"
        scene="welcome"
        title={travelerName}
      >
        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      </PlayfulHero>

      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.cardIcon}>
            <Ionicons color={colors.primary} name="color-palette-outline" size={23} />
          </View>
          <View style={styles.cardHeadingCopy}>
            <Text accessibilityRole="header" style={styles.cardTitle}>Make it feel like yours</Text>
            <Text style={styles.cardSubtitle}>Choose a look, or let Starlyvia follow your phone.</Text>
          </View>
        </View>
        <View accessibilityLabel="Appearance" accessibilityRole="radiogroup" style={styles.themeOptions}>
          {themeOptions.map((option) => {
            const selected = preference === option.value;
            return (
              <Pressable
                accessibilityLabel={`${option.label}. ${option.description}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={option.value}
                onPress={() => void setPreference(option.value)}
                style={({ pressed }) => [
                  styles.themeOption,
                  selected && styles.themeOptionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.themeIcon, selected && styles.themeIconSelected]}>
                  <Ionicons color={selected ? colors.heroText : colors.textMuted} name={option.icon} size={22} />
                </View>
                <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>{option.label}</Text>
                <Text style={[styles.themeDescription, selected && styles.themeDescriptionSelected]}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.themeFootnote}>
          Currently using {resolvedScheme} mode.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.cardIcon}>
            <Ionicons color={colors.primary} name="compass-outline" size={23} />
          </View>
          <View style={styles.cardHeadingCopy}>
            <Text accessibilityRole="header" style={styles.cardTitle}>Trip-ready account</Text>
            <Text style={styles.cardSubtitle}>The details that travel with your profile.</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Account role</Text>
          <Text style={styles.value}>{user?.role}</Text>
        </View>
        {__DEV__ ? (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Development API</Text>
              <Text numberOfLines={2} style={styles.apiValue}>{API_BASE_URL}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.note}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.noteIcon}>
          <Ionicons color={colors.primary} name="shield-checkmark-outline" size={25} />
        </View>
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle}>A small privacy promise</Text>
          <Text style={styles.noteText}>Your sign-in token and appearance choice stay in the device's secure credential store.</Text>
        </View>
      </View>

      {signOutError ? (
        <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.signOutError}>{signOutError}</Text>
      ) : null}
      <AppButton label="Sign out" loading={signingOut} onPress={confirmSignOut} variant="danger" />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    apiValue: { color: colors.text, flex: 1, flexShrink: 1, fontSize: typography.small, fontWeight: '700', minWidth: 160, textAlign: 'right' },
    bio: { color: colors.heroTextMuted, fontSize: typography.small, lineHeight: 21, maxWidth: 360 },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.lg },
    cardHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
    cardHeadingCopy: { flex: 1, gap: spacing.xs },
    cardIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, height: 48, justifyContent: 'center', width: 48 },
    cardSubtitle: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
    cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    divider: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth },
    label: { color: colors.textMuted, fontSize: typography.small },
    note: { alignItems: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: radius.lg, flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
    noteCopy: { flex: 1, gap: spacing.sm },
    noteIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, height: 46, justifyContent: 'center', width: 46 },
    noteText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 21 },
    noteTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
    row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
    signOutError: { backgroundColor: colors.dangerSoft, borderRadius: radius.md, color: colors.dangerText, fontSize: typography.small, lineHeight: 20, padding: spacing.md },
    themeDescription: { color: colors.textMuted, fontSize: typography.caption, textAlign: 'center' },
    themeDescriptionSelected: { color: colors.onPrimary },
    themeFootnote: { color: colors.textMuted, fontSize: typography.caption, textAlign: 'center' },
    themeIcon: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, height: 42, justifyContent: 'center', width: 42 },
    themeIconSelected: { backgroundColor: colors.primaryDark },
    themeLabel: { color: colors.text, fontSize: typography.small, fontWeight: '900' },
    themeLabelSelected: { color: colors.onPrimary },
    themeOption: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flex: 1, gap: spacing.sm, minHeight: 132, minWidth: 94, padding: spacing.md },
    themeOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    themeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    value: { color: colors.primaryText, fontSize: typography.small, fontWeight: '800' },
  });
}
