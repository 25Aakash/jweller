import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { jewellerAPI, silverAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

export default function SilverPriceScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
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
      const data = await silverAPI.getLivePrice();
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
      console.error('Error fetching live silver price:', error);
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
      await jewellerAPI.updateSilverPrice(
        parseFloat(baseMcxPrice),
        parseFloat(marginPercent) || 0,
        parseFloat(marginFixed) || 0
      );

      Alert.alert('Success', 'Silver price updated successfully!', [
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Update Silver Price
          </Text>

          <TextInput
            label="Base MCX Price (₹/gram)"
            value={baseMcxPrice}
            onChangeText={setBaseMcxPrice}
            keyboardType="decimal-pad"
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
            disabled={loading}
            outlineColor={isDark ? 'rgba(255,255,255,0.2)' : undefined}
            activeOutlineColor={theme.colors.primary.main}
            textColor={theme.colors.text.primary}
            theme={{ colors: { onSurfaceVariant: theme.colors.text.secondary } }}
          />

          <Button
            mode="outlined"
            onPress={fetchLivePrice}
            loading={fetchingLive}
            disabled={fetchingLive || loading}
            style={[styles.refreshButton, { borderColor: theme.colors.primary.main }]}
            textColor={theme.colors.primary.main}
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
            style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
            disabled={loading}
            placeholder="0"
            outlineColor={isDark ? 'rgba(255,255,255,0.2)' : undefined}
            activeOutlineColor={theme.colors.primary.main}
            textColor={theme.colors.text.primary}
            theme={{ colors: { onSurfaceVariant: theme.colors.text.secondary } }}
          />

          <TextInput
            label="Fixed Margin (₹/gram)"
            value={marginFixed}
            onChangeText={setMarginFixed}
            keyboardType="decimal-pad"
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? theme.colors.background.tertiary : '#FFFFFF' }]}
            disabled={loading}
            placeholder="0"
            outlineColor={isDark ? 'rgba(255,255,255,0.2)' : undefined}
            activeOutlineColor={theme.colors.primary.main}
            textColor={theme.colors.text.primary}
            theme={{ colors: { onSurfaceVariant: theme.colors.text.secondary } }}
          />

          <Card style={[styles.priceCard, { backgroundColor: theme.colors.primary.dark }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.priceLabel}>
                Final Silver Price
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
            buttonColor={theme.colors.primary.main}
            icon="check"
          >
            Update Price
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.infoCard, { backgroundColor: isDark ? theme.colors.background.card : theme.colors.primary.light }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
            💡 How it works
          </Text>
          <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.text.secondary }]}>
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
  },
  card: {
    margin: 15,
    borderRadius: 12,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  priceCard: {
    marginVertical: 20,
    borderRadius: 10,
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
    borderRadius: 10,
  },
  refreshButton: {
    marginBottom: 15,
    borderRadius: 10,
  },
  infoCard: {
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    lineHeight: 20,
  },
});
