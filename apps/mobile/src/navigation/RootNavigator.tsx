import React, { useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from '../auth/LoginScreen';
import RolePickerScreen from './RolePickerScreen';
import UserTabsNavigator from './UserTabsNavigator';
import HandymanTabsNavigator from './HandymanTabsNavigator';
import { getRoleTabNavigatorName } from './roleTabConfig';
import NotificationsScreen from '../screens/NotificationsScreen';
import UserSettings from '../screens/user/ProfilePlaceholder';
import HandymanSettings from '../screens/handyman/ProfilePlaceholder';
import { SearchProvider } from '../context/SearchContext';
import { AUTH_THEME_MODE } from '../theme/appChrome';
import { useSession } from '../auth/SessionProvider';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { loading, session, roleMode, availableRoles } = useSession();
  const { mode, colors, setMode } = useTheme();

  useEffect(() => {
    if (!session && mode !== AUTH_THEME_MODE) {
      setMode(AUTH_THEME_MODE);
    }
  }, [mode, session, setMode]);

  const navTheme =
    mode === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.bg,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            primary: colors.primary,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: colors.bg,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            primary: colors.primary,
          },
        };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bg,
        }}>
        <Text style={{ color: colors.text }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <NavigationContainer theme={navTheme}>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  if (availableRoles.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          backgroundColor: colors.bg,
        }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
          No mobile role
        </Text>
        <Text
          style={{
            opacity: 0.7,
            marginTop: 8,
            textAlign: 'center',
            color: colors.textSoft,
          }}>
          Your account does not include user or handyman roles.
        </Text>
      </SafeAreaView>
    );
  }

  if (availableRoles.length > 1 && !roleMode) {
    return (
      <NavigationContainer theme={navTheme}>
        <RolePickerScreen />
      </NavigationContainer>
    );
  }

  const TabsComponent =
    roleMode === 'handyman' ? HandymanTabsNavigator : UserTabsNavigator;
  const ProfileComponent =
    roleMode === 'handyman' ? HandymanSettings : UserSettings;
  const tabsRootName = getRoleTabNavigatorName(
    roleMode === 'handyman' ? 'handyman' : 'user',
  );

  return (
    <SearchProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name={tabsRootName} component={TabsComponent} />

          <Stack.Group
            screenOptions={{
              presentation: 'transparentModal',
            }}>
            <Stack.Screen
              name="NotificationsModal"
              component={NotificationsScreen}
            />
            <Stack.Screen name="ProfileModal" component={ProfileComponent} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SearchProvider>
  );
}
