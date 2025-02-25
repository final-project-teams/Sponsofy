import React from 'react';
import { 
  Modal as RNModal, 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Typography } from './Typography';
import { Button } from './button';
import { theme } from '../../theme/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: 'alert' | 'confirm' | 'custom';
  children?: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'alert',
  children,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View 
          style={styles.content}
          onStartShouldSetResponder={() => true}
          onTouchEnd={e => e.stopPropagation()}
        >
          <Typography variant="h2" style={styles.title}>
            {title}
          </Typography>
          
          {message && (
            <Typography variant="body" style={styles.message}>
              {message}
            </Typography>
          )}

          {children}

          <View style={styles.buttonContainer}>
            {variant !== 'alert' && (
              <Button
                variant="outline"
                title={cancelText}
                onPress={onClose}
                style={styles.cancelButton}
              />
            )}
            <Button
              variant="primary"
              title={confirmText}
              onPress={onConfirm || onClose}
              style={variant === 'alert' ? styles.singleButton : styles.confirmButton}
            />
          </View>
        </View>
      </TouchableOpacity>
    </RNModal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.popup.borderRadius,
    padding: theme.popup.padding,
    width: width * 0.85,
    maxWidth: 400,
    ...theme.popup.shadow,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.large,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.small,
  },
  confirmButton: {
    flex: 1,
    marginLeft: theme.spacing.small,
  },
  singleButton: {
    minWidth: 200,
  },
}); 