import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { goldAPI } from '../../api/endpoints';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AnimatedNumber from '../../components/AnimatedNumber';
import { useTheme } from '../../context/ThemeContext';

export default function BookGoldScreen({ route, navigation }: any) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const { amount: initialAmount, grams: initialGrams, price } = route.params || {};
  
  const [amount, setAmount] = useState(initialAmount || '');
  const [grams, setGrams] = useState(initialGrams || '');
  const [loading, setLoading] = useState(false);

  const handleBookGold = async () => {
    if (!amount || !grams) {
      Alert.alert('Error', 'Please enter amount and grams');
      return;
    }

    setLoading(true);
    try {
      const response = await goldAPI.createBooking(parseFloat(amount), parseFloat(grams));
      
      Alert.alert(
        'Success!',
        `Gold booking created successfully!\n\nBooking ID: ${response.booking.id}\nAmount: ₹${amount}\nGrams: ${grams}g\nLocked Price: ₹${price}/g`,
        [
          {
            text: 'View Bookings',
            onPress: () => {
              navigation.navigate('Bookings');
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Booking Details Card */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.primary}
            intensity={90}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>📋 Booking Details</Text>
            
            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              disabled
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

            <TextInput
              label="Grams"
              value={grams}
              onChangeText={setGrams}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              disabled
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

            <TextInput
              label="Locked Price (₹/gram)"
              value={price?.toString() || ''}
              mode="outlined"
              style={styles.input}
              disabled
              left={<TextInput.Icon icon="lock" color={theme.colors.primary.main} />}
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              theme={{
                colors: {
                  background: '#FFFFFF',
                  text: theme.colors.text.primary,
                },
              }}
            />
          </GlassCard>

          {/* Summary Card */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.secondary}
            intensity={90}
            style={styles.summaryCard}
          >
            <Text style={styles.cardTitle}>💰 Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gold Amount:</Text>
              <Text style={styles.summaryValue}>{grams} grams</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per gram (MCX Base):</Text>
              <Text style={styles.summaryValue}>₹{price}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <AnimatedNumber
                value={parseFloat(amount) || 0}
                prefix="₹"
                decimals={2}
                style={styles.totalValue}
              />
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                💡 The price will be locked at ₹{price}/gram (MCX Base) for this booking
              </Text>
            </View>
          </GlassCard>

          <GradientButton
            title="Confirm Booking"
            icon="✓"
            onPress={handleBookGold}
            loading={loading}
            colors={theme.colors.gradients.primary}
            style={styles.bookButton}
          />

          <Text style={styles.disclaimer}>
            By confirming, you agree to book {grams} grams of gold at ₹{price}/gram (MCX Base)
          </Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.primary.pastel,
    marginVertical: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  noteBox: {
    backgroundColor: theme.colors.primary.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  noteText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.dark,
    textAlign: 'center',
  },
  bookButton: {
    marginBottom: theme.spacing.md,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
});
