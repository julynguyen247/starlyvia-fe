import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
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
import { typography, type ThemeColors } from '../theme/tokens';
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

function MainTabs() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Tabs.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.heroTextSubtle,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused, size }) => (
          <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
            <Ionicons
              color={focused ? colors.onPrimary : color}
              name={focused ? tabIcons[route.name].active : tabIcons[route.name].inactive}
              size={Math.min(size, 21)}
            />
          </View>
        ),
        tabBarLabelStyle: { fontSize: typography.caption, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.primaryDark,
          borderTopColor: colors.primaryDark,
          borderTopWidth: 1,
          minHeight: 72,
          paddingTop: 6,
        },
      })}
    >
      <Tabs.Screen component={HomeScreen} name="Home" />
      <Tabs.Screen component={GroupsScreen} name="Groups" />
      <Tabs.Screen component={NotificationsScreen} name="Notifications" />
      <Tabs.Screen component={ProfileScreen} name="Profile" />
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
      <RootStack.Screen component={CreateGroupScreen} name="CreateGroup" options={{ title: 'New travel circle' }} />
      <RootStack.Screen component={InvitationsScreen} name="Invitations" options={{ title: 'Invitations' }} />
      <RootStack.Screen component={GroupDetailScreen} name="GroupDetail" options={{ title: 'Travel circle' }} />
      <RootStack.Screen component={CreatePlanScreen} name="CreatePlan" options={{ title: 'New itinerary' }} />
      <RootStack.Screen component={PlanDetailScreen} name="PlanDetail" options={{ title: 'Itinerary' }} />
      <RootStack.Screen component={AddStopScreen} name="AddStop" options={{ presentation: 'modal', title: 'Add a place' }} />
    </RootStack.Navigator>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    width: 42,
  },
  tabIconFocused: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  });
}
