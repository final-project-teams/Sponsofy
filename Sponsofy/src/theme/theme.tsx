// Define color palettes
const lightColors = {
  primary: '#701FF1',
  secondary: '#B785E6',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#757575',
  primaryBorder: '#8F6AFF',
  border: '#E0E0E0',
  error: '#FF3A3A',
  white: '#FFFFFF',
  black: '#1A1A1A',
};

const darkColors = {
  primary: '#701FF1',
  secondary: '#B785E6',
  background: '#181818',
  surface: '#292929',
  text: '#F4F4F4',
  textSecondary: '#5F5F5F',
  primaryBorder: '#8F6AFF',
  border: '#292929',
  error: '#FF3A3A',
  white: '#F4F4F4',
  black: '#0E0E0E',
};

export const theme = {
  light: {
    colors: lightColors,
    spacing: {
      xsmall: 5,
      small: 10,
      medium: 16,
      large: 20,
      xlarge: 30,
      xxlarge: 40,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
    fonts: {
      regular: 'Poppins-Regular',
      bold: 'Poppins-Bold',
      medium: 'Poppins-Medium',
      semibold: 'Poppins-SemiBold',
    },
    fontSizes: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 30,
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      },
    },
    checkbox: {
      size: 28,
      borderRadius: 4,
      checkedColor: '#701FF1',
      uncheckedColor: '#E0E0E0',
      checkmarkColor: '#FFFFFF',
      borderColor: '#757575',
    },
    popup: {
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      borderRadius: 12,
      padding: 24,
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      },
      button: {
        accept: {
          backgroundColor: '#701FF1',
          textColor: '#FFFFFF',
          borderRadius: 8,
          padding: 12,
        },
        cancel: {
          backgroundColor: '#F5F5F5',
          textColor: '#1A1A1A',
          borderRadius: 8,
          padding: 12,
        },
      },
    },
  },
  dark: {
    colors: darkColors,
    spacing: {
      xsmall: 5,
      small: 10,
      medium: 16,
      large: 20,
      xlarge: 30,
      xxlarge: 40,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
    fonts: {
      regular: 'Poppins-Regular',
      bold: 'Poppins-Bold',
      medium: 'Poppins-Medium',
      semibold: 'Poppins-SemiBold',
    },
    fontSizes: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 30,
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      },
    },
    checkbox: {
      size: 28,
      borderRadius: 4,
      checkedColor: '#701FF1',
      uncheckedColor: '#292929',
      checkmarkColor: '#F4F4F4',
      borderColor: '#5F5F5F',
    },
    popup: {
      backgroundColor: '#181818',
      textColor: '#FFFFFF',
      borderRadius: 12,
      padding: 24,
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
      button: {
        accept: {
          backgroundColor: '#6A0DA0',
          textColor: '#FFFFFF',
          borderRadius: 8,
          padding: 12,
        },
        cancel: {
          backgroundColor: '#D9D9D9',
          textColor: '#181818',
          borderRadius: 8,
          padding: 12,
        },
      },
    },
  },
};

// Helper function to get current theme
export const getTheme = (isDarkMode) => {
  return isDarkMode ? theme.dark : theme.light;
};
