import React from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

export function BrandWordmark({
  logo,
}: {
  logo?: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacing.sm,
      }}>
      {logo ?? (
        <Image
          source={require('../../assets/logo.png')}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
          }}
          resizeMode="contain"
        />
      )}

      <Text style={styles.displayText}>NearHand</Text>
    </View>
  );
}