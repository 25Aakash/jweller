import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { theme } from '../theme/theme';

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader height={24} width="60%" style={styles.title} />
      <SkeletonLoader height={48} width="80%" style={styles.value} />
      <SkeletonLoader height={16} width="50%" style={styles.subtitle} />
      
      <View style={styles.details}>
        <SkeletonLoader height={14} width="40%" />
        <SkeletonLoader height={14} width="30%" />
      </View>
      <View style={styles.details}>
        <SkeletonLoader height={14} width="35%" />
        <SkeletonLoader height={14} width="25%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  value: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
});
