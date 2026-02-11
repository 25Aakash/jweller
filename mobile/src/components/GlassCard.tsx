import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/theme';

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
  if (gradient && gradientColors) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <BlurView intensity={intensity} tint="light" style={styles.blur}>
            <View style={styles.content}>{children}</View>
          </BlurView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={[styles.glassEffect, styles.content]}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
    backgroundColor: theme.colors.background.card,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
  },
  gradientBackground: {
    borderRadius: theme.borderRadius.lg,
  },
  glassEffect: {
    backgroundColor: theme.colors.glass.light,
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  content: {
    padding: theme.spacing.md,
  },
});
