import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Company } from '../../services/api/companyApi';

interface CompanyCardProps {
  company: Company;
  onPress: (company: Company) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onPress }) => {
  const { currentTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
          ...currentTheme.shadows.small,
        },
      ]}
      onPress={() => onPress(company)}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.name,
            {
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.bold,
              fontSize: currentTheme.fontSizes.large,
            },
          ]}
        >
          {company.name}
        </Text>
        {company.verified && (
          <View
            style={[
              styles.badge,
              { backgroundColor: currentTheme.colors.primary },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: currentTheme.colors.white,
                  fontFamily: currentTheme.fonts.medium,
                },
              ]}
            >
              Verified
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.details,
          {
            color: currentTheme.colors.textSecondary,
            fontFamily: currentTheme.fonts.regular,
          },
        ]}
      >
        {company.industry} • {company.location}
      </Text>

      {company.description && (
        <Text
          style={[
            styles.description,
            {
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.regular,
            },
          ]}
          numberOfLines={2}
        >
          {company.description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
  },
  details: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CompanyCard; 