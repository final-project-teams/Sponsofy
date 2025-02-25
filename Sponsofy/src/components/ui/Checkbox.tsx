import React from 'react';
import { TouchableOpacity, View, StyleSheet, TextStyle } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../theme/theme';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function Checkbox({
  checked,
  onPress,
  label,
  disabled = false,
  error,
}: CheckboxProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.row} 
        onPress={onPress}
        disabled={disabled}
      >
        <View style={[
          styles.checkbox,
          checked && styles.checked,
          disabled && styles.disabled,
          error && styles.error
        ]}>
          {checked && <View style={styles.checkmark} />}
        </View>
        {label && (
          <Typography 
            variant="body" 
            style={{
              ...styles.label,
              ...(disabled && styles.disabledText)
            }}
          >
            {label}
          </Typography>
        )}
      </TouchableOpacity>
      {error && (
        <Typography 
          variant="caption" 
          color={theme.colors.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: theme.checkbox.size,
    height: theme.checkbox.size,
    borderRadius: theme.checkbox.borderRadius,
    borderWidth: 2,
    borderColor: theme.checkbox.uncheckedColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: theme.checkbox.checkedColor,
    borderColor: theme.checkbox.checkedColor,
  },
  checkmark: {
    width: theme.checkbox.size * 0.6,
    height: theme.checkbox.size * 0.6,
    backgroundColor: theme.checkbox.checkmarkColor,
    borderRadius: theme.checkbox.borderRadius / 2,
  },
  label: {
    marginLeft: theme.spacing.medium,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  error: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.small,
  },
}); 