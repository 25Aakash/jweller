import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme/theme';

interface GoldPriceChartProps {
  data: number[];
  labels: string[];
}

export default function GoldPriceChart({ data, labels }: GoldPriceChartProps) {
  const screenWidth = Dimensions.get('window').width - theme.spacing.lg * 2;

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data,
              color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        }}
        width={screenWidth}
        height={200}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: theme.colors.background.card,
          backgroundGradientTo: theme.colors.background.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: theme.borderRadius.lg,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: theme.colors.primary.main,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: theme.colors.primary.light,
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines
        withVerticalLabels
        withHorizontalLabels
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
  },
});
