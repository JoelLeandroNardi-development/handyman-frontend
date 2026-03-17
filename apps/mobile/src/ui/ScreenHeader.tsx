import React from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  StatusBar,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useSearch } from '../context/SearchContext';
import { SearchBar } from './SearchBar';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  notificationBadgeCount?: number;
  isModal?: boolean;
  closeButtonPosition?: 'left' | 'right';
  containerStyle?: StyleProp<ViewStyle>;
}

function getAndroidTopInset() {
  return Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
}

export function ScreenHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  onNotificationsPress,
  onProfilePress,
  notificationBadgeCount = 0,
  isModal = false,
  closeButtonPosition = 'left',
  containerStyle,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const topInset = getAndroidTopInset();
  const navigation = useNavigation<any>();
  const { searchQuery, setSearchQuery } = useSearch();

  // Use passed search value, or fall back to context
  const finalSearchValue =
    searchValue !== undefined ? searchValue : searchQuery;
  const handleSearchChange = onSearchChange || setSearchQuery;
  const isCloseLeft = isModal && closeButtonPosition === 'left';
  const isCloseRight = isModal && closeButtonPosition === 'right';

  const handleNotificationsPress = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    } else {
      const parentNav = navigation.getParent() as any;
      if (isModal) {
        navigation.dispatch(StackActions.replace('NotificationsModal'));
      } else {
        parentNav?.navigate('NotificationsModal');
      }
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      const parentNav = navigation.getParent() as any;
      if (isModal) {
        navigation.dispatch(StackActions.replace('ProfileModal'));
      } else {
        parentNav?.navigate('ProfileModal');
      }
    }
  };

  const handleCloseModal = () => {
    navigation.goBack();
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          paddingTop: topInset,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginBottom: 4,
        },
        containerStyle,
      ]}>
      {/* Top Bar: Close/Notifications | Search | Profile */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 6,
          gap: 8,
        }}>
        {/* Left Button: Close (if closeButtonPosition='left' in modal) or Notifications */}
        <Pressable
          onPress={isCloseLeft ? handleCloseModal : handleNotificationsPress}
          style={({ pressed }) => ({
            width: isCloseLeft ? 30 : 36,
            height: isCloseLeft ? 30 : 36,
            borderRadius: isCloseLeft ? 15 : 18,
            borderWidth: isCloseLeft ? 1 : 0,
            borderColor: isCloseLeft ? colors.danger : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isCloseLeft
              ? pressed
                ? colors.danger
                : colors.dangerSoft
              : pressed
                ? colors.primarySoft
                : 'transparent',
          })}>
          <View style={{ position: 'relative' }}>
            <MaterialIcons
              name={isCloseLeft ? 'close' : 'notifications'}
              size={20}
              color={isCloseLeft ? colors.danger : colors.text}
            />
            {!isModal && notificationBadgeCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: colors.danger,
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: '700',
                  }}>
                  {notificationBadgeCount > 99 ? '99+' : notificationBadgeCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* Search Bar (expands to fill space) - always shown */}
        <View style={{ flex: 1 }}>
          <SearchBar
            value={finalSearchValue}
            onChangeText={handleSearchChange}
            placeholder="Search..."
          />
        </View>

        {/* Right Button: Close (if closeButtonPosition='right' in modal) or Profile */}
        <Pressable
          onPress={isCloseRight ? handleCloseModal : handleProfilePress}
          style={({ pressed }) => ({
            width: isCloseRight ? 30 : 36,
            height: isCloseRight ? 30 : 36,
            borderRadius: isCloseRight ? 15 : 18,
            borderWidth: isCloseRight ? 1 : 0,
            borderColor: isCloseRight ? colors.danger : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isCloseRight
              ? pressed
                ? colors.danger
                : colors.dangerSoft
              : pressed
                ? colors.primarySoft
                : 'transparent',
          })}>
          <MaterialIcons
            name={isCloseRight ? 'close' : 'account-circle'}
            size={20}
            color={isCloseRight ? colors.danger : colors.text}
          />
        </Pressable>
      </View>

      {/* Title & Subtitle Section */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, gap: 2 }}>
        <Text
          style={{
            fontSize: 24,
            lineHeight: 30,
            fontWeight: '800',
            color: colors.text,
          }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: colors.textFaint,
              fontWeight: '400',
            }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
