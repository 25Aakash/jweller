import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { silverAPI } from '../../api/endpoints';
import { SilverPrice } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export default function SilverBookingScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const darkCardBorder = isDark ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' } : {};

  const [silverPrice, setSilverPrice] = useState<SilverPrice | null>(null);
  const [grams, setGrams] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (grams && silverPrice) {
      const amount = parseFloat(grams) * silverPrice.final_price;
      setTotalAmount(isNaN(amount) ? 0 : amount);
    } else {
      setTotalAmount(0);
    }
  }, [grams, silverPrice]);

  const loadData = async () => {
    try {
      const data = await silverAPI.getCurrentPrice();
      setSilverPrice(data);
    } catch (error) {
      console.error('Error loading silver price:', error);
      Alert.alert('Error', 'Failed to load silver price');
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

    Alert.alert(
      'Confirm Silver Booking',
      `Book ${grams}g silver at ₹${silverPrice?.final_price?.toFixed(2)}/gram for ₹${totalAmount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setBooking(true);
            try {
              await silverAPI.createBooking(totalAmount, parseFloat(grams));
              Alert.alert('Success!', 'Silver booking created successfully!', [
                { text: 'View Bookings', onPress: () => navigation.navigate('SilverBookings') },
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
              setGrams('');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Booking failed');
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
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
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
      }
    >
      {/* Current Price Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, darkCardBorder]}>
        <Card.Content style={styles.priceContent}>
          <MaterialCommunityIcons name="circle-multiple" size={48} color="#C0C0C0" />
          <Text variant="headlineMedium" style={{ color: theme.colors.text.primary, fontWeight: '700', marginTop: 8 }}>
            ₹{silverPrice?.final_price?.toFixed(2) || '0.00'}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>per gram (999 Silver)</Text>

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

      {/* Booking Calculator */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={{ color: theme.colors.text.primary, fontWeight: '700', marginBottom: 16 }}>
            🪙 Book Silver
          </Text>

          <TextInput
            label="Enter Grams"
            value={grams}
            onChangeText={setGrams}
            keyboardType="numeric"
            mode="outlined"
            placeholder="e.g. 100"
            left={<TextInput.Icon icon="weight-gram" color={theme.colors.primary.main} />}
            outlineColor={isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel}
            activeOutlineColor={theme.colors.primary.main}
            textColor={theme.colors.text.primary}
            style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
            theme={{ colors: { onSurfaceVariant: theme.colors.text.secondary } }}
          />

          {totalAmount > 0 && (
            <Card style={[styles.summaryCard, { backgroundColor: isDark ? theme.colors.background.tertiary : theme.colors.secondary.light }]}>
              <Card.Content>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Silver Amount</Text>
                  <Text variant="titleSmall" style={{ color: theme.colors.text.primary }}>{grams} grams</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Price / gram</Text>
                  <Text variant="titleSmall" style={{ color: theme.colors.text.primary }}>
                    ₹{silverPrice?.final_price?.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)', paddingTop: 8, marginTop: 8 }]}>
                  <Text variant="titleMedium" style={{ color: theme.colors.text.primary, fontWeight: '700' }}>Total</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary.main, fontWeight: '700' }}>
                    ₹{totalAmount.toFixed(2)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="contained"
            onPress={handleBooking}
            loading={booking}
            disabled={booking || !grams}
            buttonColor={theme.colors.primary.main}
            textColor="#FFFFFF"
            contentStyle={{ paddingVertical: 6 }}
            style={{ borderRadius: 12, marginTop: 12 }}
            icon="check-circle"
          >
            Confirm Booking
          </Button>

          <Text variant="bodySmall" style={{ color: theme.colors.text.disabled, textAlign: 'center', marginTop: 12, fontStyle: 'italic' }}>
            Price will be locked at ₹{silverPrice?.final_price?.toFixed(2)}/gram for this booking
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 10, borderRadius: 12 },
  priceContent: { alignItems: 'center', paddingVertical: 20 },
  priceDetails: { width: '100%', marginTop: 16, gap: 8 },
  priceDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  input: { marginBottom: 12 },
  summaryCard: { marginVertical: 12, borderRadius: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
});
