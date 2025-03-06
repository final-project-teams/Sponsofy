// SocialButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SocialButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <Text style={styles.socialButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SocialButton;