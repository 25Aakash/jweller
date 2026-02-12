import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, RefreshControl } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { goldAPI } from '../../api/endpoints';
import { GoldPrice } from '../../types';
import GlassCard from '../../components/GlassCard';
import AnimatedNumber from '../../components/AnimatedNumber';
import GradientButton from '../../components/GradientButton';
import PriceTrend from '../../components/PriceTrend';
import GoldPriceChart from '../../components/GoldPriceChart';
import SkeletonCard from '../../components/SkeletonCard';
import SuccessAnimation from '../../components/SuccessAnimation';
import { useTheme } from '../../context/ThemeContext';

export default function GoldBookingScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [grams, setGrams] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [priceLabels, setPriceLabels] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (grams && goldPrice) {
      const amount = parseFloat(grams) * goldPrice.final_price;
      setTotalAmount(isNaN(amount) ? 0 : amount);
    } else {
      setTotalAmount(0);
    }
  }, [grams, goldPrice]);

  const loadData = async () => {
    try {
      const data = await goldAPI.getCurrentPrice();
      
      if (goldPrice) {
        setPreviousPrice(goldPrice.final_price);
      }
      
      setGoldPrice(data);
      
      // Generate mock price history for chart (last 7 days)
      const history = Array.from({ length: 7 }, (_, i) => {
        const variance = (Math.random() - 0.5) * 200;
        return data.final_price + variance;
      });
      setPriceHistory(history);
      
      const labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      setPriceLabels(labels);
    } catch (error) {
      console.error('Error loading gold price:', error);
      Alert.alert('Error', 'Failed to load gold price');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBooking = async () => {
    if (!grams || parseFloat(grams) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount of grams');
      return;
    }

    setBooking(true);
    try {
      await goldAPI.bookGold(parseFloat(grams));
      setShowSuccess(true);
      setGrams('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <SuccessAnimation visible={showSuccess} onComplete={handleSuccessComplete} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        <View style={styles.content}>
          {/* Current Price Card */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.primary}
            intensity={90}
            style={styles.priceCard}
          >
            <View style={styles.priceContent}>
              <View style={styles.priceHeader}>
                <View style={styles.priceTitle}>
                  <Text style={styles.priceEmoji}>🏆</Text>
                  <Text style={styles.priceLabel}>Live Gold Price</Text>
                </View>
                {previousPrice > 0 && goldPrice && (
                  <PriceTrend
                    currentPrice={goldPrice.final_price}
                    previousPrice={previousPrice}
                    size="large"
                  />
                )}
              </View>
              
              <AnimatedNumber
                value={goldPrice?.final_price || 0}
                prefix="₹"
                decimals={2}
                style={styles.priceAmount}
              />
              <Text style={styles.priceUnit}>per gram (24K)</Text>
              
              <View style={styles.priceDetails}>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Base MCX Price:</Text>
                  <Text style={styles.priceDetailValue}>
                    ₹{goldPrice?.base_mcx_price?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.priceDetailRow}>
                  <Text style={styles.priceDetailLabel}>Margin:</Text>
                  <Text style={styles.priceDetailValue}>
                    {goldPrice?.margin_percent || '0'}%
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Price Chart */}
          {priceHistory.length > 0 && (
            <GlassCard intensity={90} style={styles.chartCard}>
              <Text style={styles.chartTitle}>📊 7-Day Price Trend</Text>
              <GoldPriceChart data={priceHistory} labels={priceLabels} />
            </GlassCard>
          )}

          {/* Booking Calculator */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.secondary}
            intensity={90}
            style={styles.calculatorCard}
          >
            <Text style={styles.calculatorTitle}>💰 Book Gold</Text>
            
            <TextInput
              label="Enter Grams"
              value={grams}
              onChangeText={setGrams}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="weight-gram" color={theme.colors.primary.main} />}
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              theme={{
                colors: {
                  background: '#FFFFFF',
                  text: theme.colors.text.primary,
                },
              }}
            />

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <AnimatedNumber
                value={totalAmount}
                prefix="₹"
                decimals={2}
                style={styles.totalAmount}
              />
            </View>

            <GradientButton
              title="Book Now"
              onPress={handleBooking}
              loading={booking}
              colors={theme.colors.gradients.primary}
              style={styles.bookButton}
            />

            <Text style={styles.disclaimer}>
              ℹ️ Amount will be deducted from your wallet balance
            </Text>
          </GlassCard>

          {/* Quick Booking Options */}
          <GlassCard intensity={90} style={styles.quickBookingCard}>
            <Text style={styles.quickBookingTitle}>⚡ Quick Book</Text>
            <View style={styles.quickOptions}>
              {[1, 5, 10, 20].map((amount) => (
                <GradientButton
                  key={amount}
                  title={`${amount}g`}
                  onPress={() => setGrams(amount.toString())}
                  colors={theme.colors.gradients.sunset}
                  style={styles.quickOption}
                />
              ))}
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary.light,
    opacity: 0.2,
    top: 50,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.secondary.light,
    opacity: 0.2,
    bottom: 100,
    left: -80,
  },
  scrollView: {
    flex: 1,
  },
  skeletonContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  content: {
    padding: theme.spacing.lg,
  },
  priceCard: {
    marginBottom: theme.spacing.lg,
  },
  priceContent: {
    paddingVertical: theme.spacing.md,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  priceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  priceEmoji: {
    fontSize: 24,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  priceUnit: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceDetails: {
    gap: theme.spacing.sm,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  priceDetailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  priceDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  calculatorCard: {
    marginBottom: theme.spacing.lg,
  },
  calculatorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  bookButton: {
    marginBottom: theme.spacing.md,
  },
  disclaimer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  quickBookingCard: {
    marginBottom: theme.spacing.xl,
  },
  quickBookingTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  quickOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quickOption: {
    flex: 1,
  },
});
