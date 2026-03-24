import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useStyles } from './useStyles';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { tokens } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.rowSpaceBetween}>
      <View style={{ flex: 1 }}>
        {typeof title === 'string' ? (
          <Text style={styles.displayText}>{title}</Text>
        ) : (
          title
        )}
        {subtitle ? (
          <Text style={[styles.faintText, { marginTop: tokens.spacing.sm }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function MutedText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const styles = useStyles();
  return <Text style={[styles.mutedText, style]}>{children}</Text>;
}

export function FaintText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const styles = useStyles();
  return <Text style={[styles.faintText, style]}>{children}</Text>;
}

export function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 3 }}>
      <Text
        style={{
          color: colors.textFaint,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.textSoft,
          fontSize: 16,
          lineHeight: 22,
          fontFamily: mono ? 'monospace' : undefined,
        }}>
        {value}
      </Text>
    </View>
  );
}
