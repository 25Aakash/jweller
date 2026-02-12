import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  colors?: readonly [string, string, ...string[]];
}

export default function StatsCard({
  icon,
  label,
  value,
  colors,
}: StatsCardProps) {
  const { theme } = useTheme();
  const gradientColors = colors || theme.colors.gradients.primary;

  return (
    <View style={[styles.container, { borderRadius: theme.borderRadius.lg, marginRight: theme.spacing.md, ...theme.shadows.sm }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: theme.spacing.md, minWidth: 140, alignItems: 'center' }}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.value, { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: '#FFFFFF' }]}>{value}</Text>
        <Text style={[styles.label, { fontSize: theme.typography.fontSize.sm, color: 'rgba(255,255,255,0.9)' }]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  icon: {
    fontSize: 32,
    marginBottom: 4,
  },
  value: {
    marginBottom: 4,
  },
  label: {
    textAlign: 'center',
  },
});
