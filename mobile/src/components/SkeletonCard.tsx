import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { useTheme } from '../context/ThemeContext';

export default function SkeletonCard() {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.card, {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.md,
      ...(isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }),
    }]}>
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
  card: {},
  title: {
    marginBottom: 8,
  },
  value: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
