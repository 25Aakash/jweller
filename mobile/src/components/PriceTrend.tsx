import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PriceTrendProps {
  currentPrice: number;
  previousPrice: number;
  size?: 'small' | 'large';
}

export default function PriceTrend({
  currentPrice,
  previousPrice,
  size = 'small',
}: PriceTrendProps) {
  const { theme } = useTheme();
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0 ? ((change / previousPrice) * 100).toFixed(2) : '0.00';
  const isPositive = change >= 0;

  const iconSize = size === 'large' ? 24 : 16;
  const textSize = size === 'large' ? theme.typography.fontSize.md : theme.typography.fontSize.sm;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.arrow,
          { fontSize: iconSize, color: isPositive ? theme.colors.success : theme.colors.error },
        ]}
      >
        {isPositive ? '↑' : '↓'}
      </Text>
      <Text
        style={[
          { fontSize: textSize, color: isPositive ? theme.colors.success : theme.colors.error, fontWeight: theme.typography.fontWeight.semibold },
        ]}
      >
        {isPositive ? '+' : ''}{changePercent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrow: {
    fontWeight: 'bold',
  },
});
