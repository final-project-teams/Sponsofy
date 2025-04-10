import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const CompanyCard = ({ company, onPress }) => {
  const { currentTheme } = useTheme();
  
  // Handle missing data
  const name = company?.name || 'Unnamed Company';
  const industry = company?.industry || 'Unknown Industry';
  const location = company?.location || 'Unknown Location';
  const description = company?.description || '';
  const verified = company?.verified || false;

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
        <Text style={[styles.name, { color: currentTheme.colors.text }]}>{name}</Text>
        {verified && (
          <View style={[styles.badge, { backgroundColor: currentTheme.colors.primary }]}>
            <Text style={[styles.badgeText, { color: currentTheme.colors.white }]}>Verified</Text>
          </View>
        )}
      </View>
      <Text style={[styles.details, { color: currentTheme.colors.textSecondary }]}>
        {industry} • {location}
      </Text>
      {description && (
        <Text style={[styles.description, { color: currentTheme.colors.text }]} numberOfLines={2}>
          {description}
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
    fontSize: 18,
    fontWeight: 'bold',
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