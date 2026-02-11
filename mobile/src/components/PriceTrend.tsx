import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

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
          styles.text,
          { fontSize: textSize, color: isPositive ? theme.colors.success : theme.colors.error },
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
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
