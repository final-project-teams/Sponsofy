import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  variant = 'primary',
  size = 'medium',
  title,
  onPress,
  disabled = false,
  style
}: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        styles[variant],
        styles[`${size}Button`],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.text,
        styles[`${size}Text`],
        variant === 'outline' && styles.outlineText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  smallButton: {
    padding: theme.spacing.small,
  },
  mediumButton: {
    padding: theme.spacing.medium,
  },
  largeButton: {
    padding: theme.spacing.large,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  smallText: {
    fontSize: theme.fontSizes.small,
  },
  mediumText: {
    fontSize: theme.fontSizes.medium,
  },
  largeText: {
    fontSize: theme.fontSizes.large,
  },
  disabled: {
    opacity: 0.5,
  },
});
