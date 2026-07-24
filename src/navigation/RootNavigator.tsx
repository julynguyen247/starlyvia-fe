import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CreateGroupScreen } from '../screens/groups/CreateGroupScreen';
import { GroupDetailScreen } from '../screens/groups/GroupDetailScreen';
import { InvitationsScreen } from '../screens/groups/InvitationsScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { GroupsScreen } from '../screens/main/GroupsScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AddStopScreen } from '../screens/plans/AddStopScreen';
import { CreatePlanScreen } from '../screens/plans/CreatePlanScreen';
import { PlanDetailScreen } from '../screens/plans/PlanDetailScreen';
import { radius, spacing, typography, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from '../types/navigation';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Groups: { active: 'people', inactive: 'people-outline' },
  Notifications: { active: 'notifications', inactive: 'notifications-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const qrReveal = useRef(new Animated.Value(1)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion !== false) {
      qrReveal.setValue(1);
      return;
    }

    qrReveal.setValue(0.86);
    const animation = Animated.spring(qrReveal, {
      damping: 12,
      mass: 0.65,
      stiffness: 170,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [qrReveal, reducedMotion]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  function renderRoute(index: number) {
    const route = state.routes[index];
    if (!route) return null;
    const options = descriptors[route.key]?.options;
    const focused = state.index === index;
    const icons = tabIcons[route.name as keyof MainTabParamList];
    if (!icons) return null;

    return (
      <Pressable
        accessibilityLabel={options?.tabBarAccessibilityLabel ?? route.name}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        key={route.key}
        onLongPress={() => navigation.emit({ target: route.key, type: 'tabLongPress' })}
        onPress={() => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: 'tabPress',
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
        style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
      >
        <Ionicons
          color={focused ? colors.primary : colors.navigationIcon}
          name={focused ? icons.active : icons.inactive}
          size={focused ? 23 : 22}
        />
        <View style={[styles.activeDot, focused && styles.activeDotVisible]} />
      </Pressable>
    );
  }

  return (
    <Animated.View
      style={[
        styles.tabBarArea,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      <View style={styles.tabBarPill}>
        {renderRoute(0)}
        {renderRoute(1)}
        <Animated.View style={[styles.qrLift, { transform: [{ translateY: -8 }, { scale: qrReveal }] }]}>
          <Pressable
            accessibilityHint={t('nav.qrHint')}
            accessibilityLabel={t('nav.qrLabel')}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.qrButton}
          >
            <Ionicons color={colors.onPrimary} name="qr-code-outline" size={27} />
          </Pressable>
        </Animated.View>
        {renderRoute(2)}
        {renderRoute(3)}
      </View>
    </Animated.View>
  );
}

function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tabs.Navigator
      backBehavior="history"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen component={HomeScreen} name="Home" options={{ tabBarAccessibilityLabel: t('nav.home') }} />
      <Tabs.Screen component={GroupsScreen} name="Groups" options={{ tabBarAccessibilityLabel: t('nav.groups') }} />
      <Tabs.Screen component={NotificationsScreen} name="Notifications" options={{ tabBarAccessibilityLabel: t('nav.notifications') }} />
      <Tabs.Screen component={ProfileScreen} name="Profile" options={{ tabBarAccessibilityLabel: t('nav.profile') }} />
    </Tabs.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { token } = useAuth();
  const { colors } = useAppTheme();
  const { t } = useLanguage();

  if (!token) return <AuthNavigator />;

  return (
    <RootStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surfaceWarm },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: typography.body, fontWeight: '800' },
      }}
    >
      <RootStack.Screen component={MainTabs} name="MainTabs" options={{ headerShown: false }} />
      <RootStack.Screen component={CreateGroupScreen} name="CreateGroup" options={{ title: t('nav.newCircle') }} />
      <RootStack.Screen component={InvitationsScreen} name="Invitations" options={{ title: t('nav.invitations') }} />
      <RootStack.Screen component={GroupDetailScreen} name="GroupDetail" options={{ title: t('nav.circle') }} />
      <RootStack.Screen component={CreatePlanScreen} name="CreatePlan" options={{ title: t('nav.newItinerary') }} />
      <RootStack.Screen component={PlanDetailScreen} name="PlanDetail" options={{ title: t('nav.itinerary') }} />
      <RootStack.Screen component={AddStopScreen} name="AddStop" options={{ presentation: 'modal', title: t('nav.addPlace') }} />
    </RootStack.Navigator>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 3,
    marginTop: 4,
    opacity: 0,
    width: 3,
  },
  activeDotVisible: { opacity: 1, width: 14 },
  qrButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.navigationSurface,
    borderRadius: radius.pill,
    borderWidth: 4,
    elevation: 10,
    height: 58,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 9,
    width: 58,
  },
  qrLift: { alignItems: 'center', justifyContent: 'center', width: 58 },
  tabBarArea: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tabBarPill: {
    alignItems: 'center',
    backgroundColor: colors.navigationSurface,
    borderColor: colors.navigationBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    elevation: 8,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-between',
    maxWidth: 340,
    paddingHorizontal: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    minWidth: 44,
    width: 52,
  },
  tabItemPressed: { opacity: 0.66, transform: [{ scale: 0.92 }] },
  });
}
