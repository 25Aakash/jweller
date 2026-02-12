import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface QuickActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

export default function QuickActionButton({
  title,
  icon,
  onPress,
  colors,
  style,
}: QuickActionButtonProps) {
  const { theme } = useTheme();
  const gradientColors = colors || theme.colors.gradients.primary;

  return (
    <TouchableOpacity onPress={onPress} style={[{ borderRadius: theme.borderRadius.lg, overflow: 'hidden', ...theme.shadows.sm }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, gap: theme.spacing.xs }}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
  title: {},
});
