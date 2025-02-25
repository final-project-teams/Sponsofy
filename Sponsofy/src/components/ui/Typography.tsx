import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = theme.colors.text,
  align = 'left',
  style,
  children,
}: TypographyProps) {
  return (
    <Text style={[
      styles[variant],
      { color, textAlign: align },
      style
    ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: theme.fontSizes.xlarge,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.medium,
  },
  h2: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.small,
  },
  h3: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.small,
  },
  body: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  caption: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
}); 