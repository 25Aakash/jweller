import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  colors,
  style,
  textStyle,
}: GradientButtonProps) {
  const { theme } = useTheme();
  const gradientColors = colors || theme.colors.gradients.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{ borderRadius: theme.borderRadius.lg, overflow: 'hidden', ...theme.shadows.md }, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, { fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.bold }, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
