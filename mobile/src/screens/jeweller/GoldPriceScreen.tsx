import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { jewellerAPI, goldAPI } from '../../api/endpoints';

export default function GoldPriceScreen({ navigation }: any) {
  const [baseMcxPrice, setBaseMcxPrice] = useState('');
  const [marginPercent, setMarginPercent] = useState('');
  const [marginFixed, setMarginFixed] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(true);

  useEffect(() => {
    fetchLivePrice();
  }, []);

  const fetchLivePrice = async () => {
    setFetchingLive(true);
    try {
      const data = await goldAPI.getLivePrice();
      if (data?.base_mcx_price) {
        setBaseMcxPrice(data.base_mcx_price.toString());
      }
      if (data?.margin_percent !== undefined) {
        setMarginPercent(data.margin_percent.toString());
      }
      if (data?.margin_fixed !== undefined) {
        setMarginFixed(data.margin_fixed.toString());
      }
    } catch (error) {
      console.error('Error fetching live price:', error);
    } finally {
      setFetchingLive(false);
    }
  };

  const calculateFinalPrice = () => {
    const base = parseFloat(baseMcxPrice) || 0;
    const percent = parseFloat(marginPercent) || 0;
    const fixed = parseFloat(marginFixed) || 0;
    return base + (base * percent / 100) + fixed;
  };

  const handleUpdatePrice = async () => {
    if (!baseMcxPrice) {
      Alert.alert('Error', 'Please enter base MCX price');
      return;
    }

    setLoading(true);
    try {
      await jewellerAPI.updateGoldPrice(
        parseFloat(baseMcxPrice),
        parseFloat(marginPercent) || 0,
        parseFloat(marginFixed) || 0
      );

      Alert.alert('Success', 'Gold price updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = calculateFinalPrice();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Update Gold Price
          </Text>

          <TextInput
            label="Base MCX Price (₹/gram)"
            value={baseMcxPrice}
            onChangeText={setBaseMcxPrice}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <Button
            mode="outlined"
            onPress={fetchLivePrice}
            loading={fetchingLive}
            disabled={fetchingLive || loading}
            style={styles.refreshButton}
            icon="refresh"
            compact
          >
            Refresh Live MCX Price
          </Button>

          <TextInput
            label="Margin Percentage (%)"
            value={marginPercent}
            onChangeText={setMarginPercent}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            placeholder="0"
          />

          <TextInput
            label="Fixed Margin (₹/gram)"
            value={marginFixed}
            onChangeText={setMarginFixed}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            disabled={loading}
            placeholder="0"
          />

          <Card style={styles.priceCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.priceLabel}>
                Final Price
              </Text>
              <Text variant="headlineLarge" style={styles.finalPrice}>
                ₹{finalPrice.toFixed(2)}/g
              </Text>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleUpdatePrice}
            loading={loading}
            disabled={loading || !baseMcxPrice}
            style={styles.button}
            icon="check"
          >
            Update Price
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            💡 How it works
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            • Base MCX Price: Auto-fetched from live market{'\n'}
            • Margin %: Your percentage markup{'\n'}
            • Fixed Margin: Additional fixed amount{'\n'}
            • Final Price = Base + (Base × %) + Fixed{'\n'}
            • Price refreshes automatically every 5 minutes
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 15,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  priceCard: {
    backgroundColor: '#6200ee',
    marginVertical: 20,
  },
  priceLabel: {
    color: '#fff',
    opacity: 0.9,
  },
  finalPrice: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  button: {
    paddingVertical: 8,
  },
  refreshButton: {
    marginBottom: 15,
  },
  infoCard: {
    margin: 15,
    marginTop: 0,
    backgroundColor: '#e3f2fd',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    lineHeight: 20,
  },
});
