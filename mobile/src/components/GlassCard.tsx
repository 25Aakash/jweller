import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
}

export default function GlassCard({
  children,
  intensity = 80,
  style,
  gradient = false,
  gradientColors,
}: GlassCardProps) {
  const { theme, isDark } = useTheme();

  const containerStyle = {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
    ...theme.shadows.md,
    backgroundColor: theme.colors.background.card,
    ...(isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }),
  };

  if (gradient && gradientColors) {
    return (
      <View style={[containerStyle, style]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: theme.borderRadius.lg }}
        >
          <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={{ overflow: 'hidden', borderRadius: theme.borderRadius.lg }}>
            <View style={{ padding: theme.spacing.md }}>{children}</View>
          </BlurView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={{ overflow: 'hidden', borderRadius: theme.borderRadius.lg }}>
        <View style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.colors.glass.light,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.glass.border,
          padding: theme.spacing.md,
        }}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}
