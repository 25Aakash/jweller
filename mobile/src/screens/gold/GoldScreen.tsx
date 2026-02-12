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
import { useTheme } from '../../context/ThemeContext';

export default function GoldScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
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
      <View style={[styles.decorativeCircle1, { backgroundColor: theme.colors.primary.light }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: theme.colors.secondary.light }]} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
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
              style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
              left={<TextInput.Icon icon="currency-inr" color={theme.colors.primary.main} />}
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              textColor={theme.colors.text.primary}
              theme={{
                colors: {
                  background: isDark ? theme.colors.background.tertiary : '#FFFFFF',
                  text: theme.colors.text.primary,
                  placeholder: theme.colors.text.secondary,
                  onSurfaceVariant: theme.colors.text.secondary,
                },
              }}
            />

            <Text style={[styles.orText, { color: theme.colors.text.disabled }]}>OR</Text>

            <TextInput
              label="Grams"
              value={grams}
              onChangeText={calculateAmount}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
              left={<TextInput.Icon icon="weight-gram" color={theme.colors.primary.main} />}
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              textColor={theme.colors.text.primary}
              theme={{
                colors: {
                  background: isDark ? theme.colors.background.tertiary : '#FFFFFF',
                  text: theme.colors.text.primary,
                  placeholder: theme.colors.text.secondary,
                  onSurfaceVariant: theme.colors.text.secondary,
                },
              }}
            />

            {amount && grams && (
              <View style={[styles.resultBox, { backgroundColor: isDark ? theme.colors.background.tertiary : theme.colors.secondary.light }]}>
                <Text style={[styles.resultText, { color: isDark ? theme.colors.secondary.main : theme.colors.secondary.dark }]}>
                  ₹{amount} = {grams} grams
                </Text>
                <Text style={[styles.resultSubtext, { color: isDark ? theme.colors.text.secondary : theme.colors.secondary.dark }]}>
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
    opacity: 0.2,
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.2,
    bottom: -50,
    left: -50,
  },
  skeletonContainer: {
    padding: 24,
    gap: 24,
  },
  content: {
    padding: 24,
  },
  priceCard: {
    marginBottom: 24,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceSubtext: {
    fontSize: 14,
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceDetails: {
    gap: 8,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceDetailLabel: {
    fontSize: 14,
  },
  priceDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  calculatorCard: {
    marginBottom: 24,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 14,
  },
  resultBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultText: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 16,
  },
  resultSubtext: {
    fontSize: 14,
  },
  bookButton: {
    marginTop: 8,
  },
  viewBookingsButton: {
    marginBottom: 32,
  },
});
