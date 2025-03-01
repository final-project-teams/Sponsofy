// Sponsofy/src/components/ui/DealCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import Spacing from './Spacing';

interface DealCardProps {
  username: string;
  date: string;
  description: string;
  tier: 'Diamond' | 'Gold' | 'Silver';
  onViewDeal: () => void;
  onContact: () => void;
}

export function DealCard({ username, date, description, tier, onViewDeal, onContact }: DealCardProps) {
  const tierColors = {
    Diamond: '#00BFFF',
    Gold: '#FFD700',
    Silver: '#C0C0C0',
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={[styles.tier, { backgroundColor: tierColors[tier] }]}>
        <Text style={styles.tierText}>{tier}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onViewDeal} style={styles.button}>
          <Text style={styles.buttonText}>View Deal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onContact} style={styles.button}>
          <Text style={styles.buttonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginVertical: theme.spacing.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  date: {
    color: theme.colors.textSecondary,
  },
  description: {
    color: theme.colors.text,
    marginVertical: theme.spacing.small,
  },
  tier: {
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
    alignSelf: 'flex-start',
  },
  tierText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.medium,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    flex: 1,
    marginHorizontal: theme.spacing.small,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.white,
  },
});