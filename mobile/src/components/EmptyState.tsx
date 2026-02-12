import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientButton from './GradientButton';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  emoji,
  title,
  message,
  actionText,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing.xxl }]}>
      <Text style={[styles.emoji, { marginBottom: theme.spacing.lg }]}>{emoji}</Text>
      <Text style={[styles.title, { color: theme.colors.text.primary, fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.sm }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.md, marginBottom: theme.spacing.lg }]}>{message}</Text>
      {actionText && onAction && (
        <GradientButton
          title={actionText}
          onPress={onAction}
          colors={theme.colors.gradients.primary}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
  },
});
