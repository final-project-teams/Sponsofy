import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

export const fontSize = StyleSheet.create({
  // Text sizes
  small: {
    fontSize: theme.fontSizes.small,
    lineHeight: theme.fontSizes.small * 1.5,
  },
  medium: {
    fontSize: theme.fontSizes.medium,
    lineHeight: theme.fontSizes.medium * 1.5,
  },
  large: {
    fontSize: theme.fontSizes.large,
    lineHeight: theme.fontSizes.large * 1.5,
  },
  xlarge: {
    fontSize: theme.fontSizes.xlarge,
    lineHeight: theme.fontSizes.xlarge * 1.5,
  },
  xxlarge: {
    fontSize: theme.fontSizes.xxlarge,
    lineHeight: theme.fontSizes.xxlarge * 1.5,
  },

  // Font families
  regular: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.small,
  },
  bold: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.small,
  },

  
  semibold: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSizes.small,
  },


  // Common text styles
  heading: {
    fontSize: theme.fontSizes.xlarge,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  subheading: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
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
