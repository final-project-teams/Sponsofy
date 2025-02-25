import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

export const FontFamily = StyleSheet.create({
  // Regular Text Styles
  regular: {
    fontFamily: theme.fonts.regular,
  },
  regularSmall: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.small,
  },
  regularMedium: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.medium,
  },
  regularLarge: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.large,
  },

  // Medium Text Styles
  medium: {
    fontFamily: theme.fonts.medium,
  },
  mediumSmall: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.small,
  },
  mediumMedium: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.medium,
  },
  mediumLarge: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.large,
  },

  // SemiBold Text Styles
  semibold: {
    fontFamily: theme.fonts.semibold,
  },
  semiboldSmall: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSizes.small,
  },
  semiboldMedium: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSizes.medium,
  },
  semiboldLarge: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSizes.large,
  },

  // Bold Text Styles
  bold: {
    fontFamily: theme.fonts.bold,
  },
  boldSmall: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.small,
  },
  boldMedium: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.medium,
  },
  boldLarge: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.large,
  },
  boldXLarge: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xlarge,
  },

  // Heading Styles
  heading1: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xxlarge,
    lineHeight: theme.fontSizes.xxlarge * 1.2,
  },
  heading2: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xlarge,
    lineHeight: theme.fontSizes.xlarge * 1.2,
  },
  heading3: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.large,
    lineHeight: theme.fontSizes.large * 1.2,
  },

  // Special Text Styles
  caption: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
  },
  button: {
    fontFamily: theme.fonts.semibold,
    fontSize: theme.fontSizes.medium,
  },
  link: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
  },
}); 