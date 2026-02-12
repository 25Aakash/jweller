import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { silverAPI } from '../../api/endpoints';
import { SilverPrice } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export default function SilverScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [silverPrice, setSilverPrice] = useState<SilverPrice | null>(null);
  const [amount, setAmount] = useState('');
  const [grams, setGrams] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSilverPrice();
  }, []);

  const loadSilverPrice = async () => {
    try {
      const data = await silverAPI.getCurrentPrice();
      setSilverPrice(data);
    } catch (error) {
      console.error('Error loading silver price:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSilverPrice();
  };

  const calculateGrams = (inputAmount: string) => {
    setAmount(inputAmount);
    if (inputAmount && silverPrice) {
      const calculatedGrams = parseFloat(inputAmount) / silverPrice.final_price;
      setGrams(calculatedGrams.toFixed(3));
    } else {
      setGrams('');
    }
  };

  const calculateAmount = (inputGrams: string) => {
    setGrams(inputGrams);
    if (inputGrams && silverPrice) {
      const calculatedAmount = parseFloat(inputGrams) * silverPrice.final_price;
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount('');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.primary.dark }]}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: isDark ? theme.colors.text.primary : '#fff' }]}>
          🪙 Live Silver Price
        </Text>
        <Text variant="bodyMedium" style={{ color: isDark ? theme.colors.text.secondary : 'rgba(255,255,255,0.9)' }}>
          999 Silver per gram
        </Text>
      </View>

      {/* Price Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content style={styles.priceContent}>
          <MaterialCommunityIcons name="circle-multiple" size={48} color="#C0C0C0" />
          <Text variant="displaySmall" style={[styles.priceAmount, { color: theme.colors.text.primary }]}>
            ₹{silverPrice?.final_price?.toFixed(2) || '0.00'}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
            per gram
          </Text>

          <View style={styles.priceDetails}>
            <View style={styles.priceDetailRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Base MCX Price</Text>
              <Text variant="titleSmall" style={{ color: theme.colors.text.primary }}>
                ₹{silverPrice?.base_mcx_price?.toFixed(2) || 'N/A'}
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Margin</Text>
              <Text variant="titleSmall" style={{ color: theme.colors.text.primary }}>
                {silverPrice?.margin_percent || '0'}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Calculator Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            🧮 Silver Calculator
          </Text>

          <TextInput
            label="Amount (₹)"
            value={amount}
            onChangeText={calculateGrams}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
            left={<TextInput.Icon icon="currency-inr" color={theme.colors.primary.main} />}
            outlineColor={isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel}
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

          <Text variant="bodyMedium" style={{ color: theme.colors.text.disabled, textAlign: 'center', marginVertical: 8 }}>
            OR
          </Text>

          <TextInput
            label="Grams"
            value={grams}
            onChangeText={calculateAmount}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
            left={<TextInput.Icon icon="weight-gram" color={theme.colors.primary.main} />}
            outlineColor={isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel}
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
            <Card style={[styles.resultCard, { backgroundColor: isDark ? theme.colors.background.tertiary : theme.colors.secondary.light }]}>
              <Card.Content style={styles.resultContent}>
                <Text variant="titleMedium" style={{ color: isDark ? theme.colors.secondary.main : theme.colors.secondary.dark, fontWeight: 'bold' }}>
                  ₹{amount} = {grams} grams
                </Text>
                <Text variant="bodySmall" style={{ color: isDark ? theme.colors.text.secondary : theme.colors.secondary.dark }}>
                  @ ₹{silverPrice?.final_price?.toFixed(2) || '0.00'}/gram
                </Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="contained"
            icon="circle-multiple"
            style={styles.bookButton}
            buttonColor={theme.colors.primary.main}
            textColor="#fff"
            onPress={() => navigation.navigate('SilverBooking')}
          >
            Book Silver
          </Button>
        </Card.Content>
      </Card>

      {/* View Bookings */}
      <View style={styles.bookingsSection}>
        <Button
          mode="outlined"
          icon="book-open-variant"
          style={[styles.bookingsButton, { borderColor: theme.colors.primary.main }]}
          textColor={theme.colors.primary.main}
          onPress={() => navigation.navigate('SilverBookings')}
        >
          View My Silver Bookings
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  card: {
    margin: 10,
    borderRadius: 12,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  priceContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  priceAmount: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  priceDetails: {
    width: '100%',
    marginTop: 20,
    gap: 8,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 8,
  },
  resultCard: {
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 10,
  },
  resultContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  bookButton: {
    marginTop: 8,
    borderRadius: 10,
  },
  bookingsSection: {
    padding: 20,
  },
  bookingsButton: {
    borderRadius: 10,
  },
});
