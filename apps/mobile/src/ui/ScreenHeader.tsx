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
  modalVariant?: 'default' | 'compact';
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
  modalVariant = 'default',
  closeButtonPosition = 'left',
  containerStyle,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const topInset = getAndroidTopInset();
  const navigation = useNavigation<any>();
  const { searchQuery, setSearchQuery } = useSearch();
  const actionButtonSize = 36;
  const isCompactModal = isModal && modalVariant === 'compact';

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
          backgroundColor: isModal ? colors.surface : colors.bg,
          paddingTop: isModal ? 0 : topInset,
          borderBottomWidth: isCompactModal ? 0 : 1,
          borderBottomColor: colors.border,
          marginBottom: isCompactModal ? 0 : 4,
        },
        containerStyle,
      ]}>
      {isCompactModal ? null : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            gap: 8,
          }}>
          <Pressable
            onPress={isCloseLeft ? handleCloseModal : handleNotificationsPress}
            style={({ pressed }) => ({
              width: actionButtonSize,
              height: actionButtonSize,
              borderRadius: actionButtonSize / 2,
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

          <View style={{ flex: 1 }}>
            <SearchBar
              value={finalSearchValue}
              onChangeText={handleSearchChange}
              placeholder="Search..."
            />
          </View>

          <Pressable
            onPress={isCloseRight ? handleCloseModal : handleProfilePress}
            style={({ pressed }) => ({
              width: actionButtonSize,
              height: actionButtonSize,
              borderRadius: actionButtonSize / 2,
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
      )}

      {isCompactModal ? (
        <View
          style={{
            flexDirection: closeButtonPosition === 'left' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10,
            gap: 12,
          }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                fontSize: 20,
                lineHeight: 26,
                fontWeight: '800',
                color: colors.text,
              }}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  color: colors.textFaint,
                  fontWeight: '400',
                }}>
                {subtitle}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleCloseModal}
            hitSlop={8}
            style={({ pressed }) => ({
              width: actionButtonSize,
              height: actionButtonSize,
              borderRadius: actionButtonSize / 2,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: pressed ? colors.primarySoft : colors.surface,
            })}>
            <MaterialIcons name="close" size={18} color={colors.text} />
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 0,
            paddingBottom: 8,
            gap: 2,
          }}>
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
      )}
    </View>
  );
}
