import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../theme/theme';

interface PriceAlert {
  id: string;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

const ALERTS_KEY = 'price_alerts';

export default function PriceAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem(ALERTS_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const saveAlerts = async (newAlerts: PriceAlert[]) => {
    try {
      await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  const handleAddAlert = () => {
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      targetPrice: price,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const newAlerts = [newAlert, ...alerts];
    saveAlerts(newAlerts);
    setTargetPrice('');
    Alert.alert('Success', 'Price alert created! You will be notified when gold price reaches ₹' + price);
  };

  const toggleAlert = (id: string) => {
    const newAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    );
    saveAlerts(newAlerts);
  };

  const deleteAlert = (id: string) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const newAlerts = alerts.filter((alert) => alert.id !== id);
          saveAlerts(newAlerts);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Add Alert Card */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.primary}
            intensity={90}
            style={styles.addCard}
          >
            <Text style={styles.addTitle}>🔔 Create Price Alert</Text>
            <Text style={styles.addSubtitle}>
              Get notified when gold price reaches your target
            </Text>

            <TextInput
              label="Target Price (₹ per gram)"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="decimal-pad"
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

            <GradientButton
              title="Create Alert"
              onPress={handleAddAlert}
              loading={loading}
              colors={theme.colors.gradients.secondary}
              style={styles.addButton}
            />
          </GlassCard>

          {/* Active Alerts */}
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsTitle}>Your Alerts</Text>
            <Text style={styles.alertsCount}>{alerts.length}</Text>
          </View>

          {alerts.length === 0 ? (
            <EmptyState
              emoji="🔕"
              title="No Price Alerts"
              message="Create your first price alert to get notified when gold reaches your target price."
            />
          ) : (
            alerts.map((alert) => (
              <GlassCard key={alert.id} intensity={90} style={styles.alertCard}>
                <View style={styles.alertContent}>
                  <View style={styles.alertLeft}>
                    <Text style={styles.alertIcon}>
                      {alert.isActive ? '🔔' : '🔕'}
                    </Text>
                    <View>
                      <Text style={styles.alertPrice}>₹{alert.targetPrice.toFixed(2)}</Text>
                      <Text style={styles.alertDate}>
                        Created {new Date(alert.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.alertRight}>
                    <Switch
                      value={alert.isActive}
                      onValueChange={() => toggleAlert(alert.id)}
                      trackColor={{
                        false: theme.colors.text.disabled,
                        true: theme.colors.primary.main,
                      }}
                      thumbColor={alert.isActive ? theme.colors.primary.light : '#f4f3f4'}
                    />
                    <TouchableOpacity
                      onPress={() => deleteAlert(alert.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            ))
          )}

          {/* Info Card */}
          <GlassCard intensity={90} style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ How it works</Text>
            <Text style={styles.infoText}>
              • Set your target gold price{'\n'}
              • We'll monitor the live price 24/7{'\n'}
              • Get instant notification when price is reached{'\n'}
              • Toggle alerts on/off anytime
            </Text>
          </GlassCard>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  addCard: {
    marginBottom: theme.spacing.xl,
  },
  addTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  addSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    marginTop: theme.spacing.sm,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  alertsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  alertsCount: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  alertCard: {
    marginBottom: theme.spacing.md,
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  alertIcon: {
    fontSize: 32,
  },
  alertPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  alertDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  alertRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  deleteIcon: {
    fontSize: 20,
  },
  infoCard: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
});
