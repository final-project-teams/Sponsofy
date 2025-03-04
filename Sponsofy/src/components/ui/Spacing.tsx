// Sponsofy/src/components/Spacing.tsx
import React from 'react';
import { View } from 'react-native';
import { theme } from '../../theme/theme';

interface SpacingProps {
  size: 'small' | 'medium' | 'large' | 'xlarge'; // Define the sizes based on your theme
  horizontal?: boolean; // Optional prop to apply horizontal spacing
}

const Spacing: React.FC<SpacingProps> = ({ size, horizontal }) => {
  const spacingValue = theme.spacing[size]; // Get the spacing value from the theme

  return (
    <View
      style={{
        margin: horizontal ? 0 : spacingValue,
        marginHorizontal: horizontal ? spacingValue : 0,
        marginVertical: horizontal ? 0 : spacingValue,
        padding: horizontal ? 0 : spacingValue,
        paddingHorizontal: horizontal ? spacingValue : 0,
        paddingVertical: horizontal ? 0 : spacingValue,
      }}
    />
  );
};

export default Spacing;