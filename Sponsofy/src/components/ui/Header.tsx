import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  align = 'left',
  style,
}: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Typography 
        variant="h1" 
        color={theme.colors.primary}
        align={align}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography 
          variant="body"
          color={theme.colors.textSecondary}
          align={align}
        >
          {subtitle}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.large,
  },
}); 