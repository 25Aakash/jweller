import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { goldAPI } from '../../api/endpoints';
import { GoldPrice } from '../../types';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AnimatedNumber from '../../components/AnimatedNumber';
import PriceTrend from '../../components/PriceTrend';
import SkeletonCard from '../../components/SkeletonCard';
import { theme } from '../../theme/theme';

export default function GoldScreen({ navigation }: any) {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [grams, setGrams] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGoldPrice();
  }, []);

  const loadGoldPrice = async () => {
    try {
      const data = await goldAPI.getCurrentPrice();
      if (goldPrice) {
        setPreviousPrice(goldPrice.final_price);
      }
      setGoldPrice(data);
    } catch (error) {
      console.error('Error loading gold price:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoldPrice();
  };

  const calculateGrams = (inputAmount: string) => {
    setAmount(inputAmount);
    if (inputAmount && goldPrice) {
      const calculatedGrams = parseFloat(inputAmount) / goldPrice.final_price;
      setGrams(calculatedGrams.toFixed(3));
    } else {
      setGrams('');
    }
  };

  const calculateAmount = (inputGrams: string) => {
    setGrams(inputGrams);
    if (inputGrams && goldPrice) {
      const calculatedAmount = parseFloat(inputGrams) * goldPrice.final_price;
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount('');
    }
  };

  const handleBookGold = () => {
    if (!amount || !grams) {
      Alert.alert('Error', 'Please enter amount or grams');
      return;
    }
    navigation.navigate('GoldBooking');
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

      <ScrollView
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
            <View style={styles.priceHeader}>
              <View>
                <Text style={styles.priceLabel}>🏆 Live Gold Price</Text>
                <Text style={styles.priceSubtext}>per gram (24K)</Text>
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

            <View style={styles.priceDetails}>
              <View style={styles.priceDetailRow}>
                <Text style={styles.priceDetailLabel}>Base MCX:</Text>
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
          </GlassCard>

          {/* Calculator Card */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.secondary}
            intensity={90}
            style={styles.calculatorCard}
          >
            <Text style={styles.calculatorTitle}>🧮 Gold Calculator</Text>

            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={calculateGrams}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="currency-inr" color={theme.colors.primary.main} />}
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              theme={{
                colors: {
                  background: '#FFFFFF',
                  text: theme.colors.text.primary,
                },
              }}
            />

            <Text style={styles.orText}>OR</Text>

            <TextInput
              label="Grams"
              value={grams}
              onChangeText={calculateAmount}
              keyboardType="numeric"
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

            {amount && grams && (
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>
                  ₹{amount} = {grams} grams
                </Text>
                <Text style={styles.resultSubtext}>
                  @ ₹{goldPrice?.final_price?.toFixed(2) || '0.00'}/gram
                </Text>
              </View>
            )}

            <GradientButton
              title="Book Gold"
              icon="💰"
              onPress={handleBookGold}
              colors={theme.colors.gradients.primary}
              style={styles.bookButton}
            />
          </GlassCard>

          <GradientButton
            title="View My Bookings"
            icon="📋"
            onPress={() => navigation.navigate('Bookings')}
            colors={theme.colors.gradients.sunset}
            style={styles.viewBookingsButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.secondary.light,
    opacity: 0.2,
    bottom: -50,
    left: -50,
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
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  priceSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  priceDetails: {
    gap: theme.spacing.sm,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  orText: {
    textAlign: 'center',
    color: theme.colors.text.disabled,
    marginVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
  },
  resultBox: {
    backgroundColor: theme.colors.secondary.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  resultText: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary.dark,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
  },
  resultSubtext: {
    color: theme.colors.secondary.dark,
    fontSize: theme.typography.fontSize.sm,
  },
  bookButton: {
    marginTop: theme.spacing.sm,
  },
  viewBookingsButton: {
    marginBottom: theme.spacing.xl,
  },
});
