import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { walletAPI, goldAPI } from '../api/endpoints';
import { WalletBalance, GoldPrice } from '../types';
import { getGreeting } from '../utils/greetings';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const greeting = getGreeting();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletData, goldData] = await Promise.all([
        walletAPI.getBalance(),
        goldAPI.getCurrentPrice(),
      ]);
      setWallet(walletData);
      setGoldPrice(goldData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastUpdated.toLocaleDateString();
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
        <Text variant="bodyLarge" style={{ color: isDark ? theme.colors.text.secondary : 'rgba(255,255,255,0.9)' }}>
          {greeting.emoji} {greeting.text}!
        </Text>
        <Text variant="headlineMedium" style={[styles.headerName, { color: isDark ? theme.colors.text.primary : '#fff' }]}>
          {user?.name || 'Guest'}
        </Text>
        <Text variant="bodySmall" style={{ color: isDark ? theme.colors.text.disabled : 'rgba(255,255,255,0.7)' }}>
          Updated {formatLastUpdated()}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="wallet" size={32} color={theme.colors.primary.main} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              ₹{wallet?.balance?.toFixed(0) || '0'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
              Wallet Balance
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="gold" size={32} color="#FFD700" />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              ₹{goldPrice?.final_price?.toFixed(0) || '0'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
              Gold Price/g
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="chart-line" size={32} color={theme.colors.success} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {goldPrice?.margin_percent || '0'}%
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
              Margin
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="currency-inr" size={32} color={theme.colors.warning} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              ₹{goldPrice?.base_mcx_price?.toFixed(0) || '0'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
              Base MCX
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Quick Actions
        </Text>

        <Button
          mode="contained"
          icon="wallet-plus"
          style={styles.actionButton}
          buttonColor={theme.colors.primary.main}
          textColor="#fff"
          onPress={() => navigation.navigate('Wallet')}
        >
          Add Money to Wallet
        </Button>

        <Button
          mode="contained"
          icon="gold"
          style={styles.actionButton}
          buttonColor="#FFD700"
          textColor="#000"
          onPress={() => navigation.navigate('GoldBooking')}
        >
          Buy Gold Now
        </Button>

        <Button
          mode="outlined"
          icon="book-open-variant"
          style={[styles.actionButton, { borderColor: theme.colors.primary.main }]}
          textColor={theme.colors.primary.main}
          onPress={() => navigation.navigate('Bookings')}
        >
          View My Bookings
        </Button>
      </View>

      {/* Account Info */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Account Information
          </Text>
          <List.Item
            title="Phone"
            description={user?.phone_number || 'N/A'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="phone" color={theme.colors.primary.main} />}
          />
          <List.Item
            title="Location"
            description={user?.city && user?.state ? `${user.city}, ${user.state}` : 'Not available'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="map-marker" color={theme.colors.primary.main} />}
          />
          <List.Item
            title="Role"
            description={user?.role || 'Customer'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="account" color={theme.colors.primary.main} />}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Button
          mode="outlined"
          icon="logout"
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
          onPress={logout}
        >
          Logout
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
  headerName: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButton: {
    marginBottom: 10,
    borderRadius: 10,
  },
  infoCard: {
    margin: 10,
    borderRadius: 12,
  },
  logoutSection: {
    padding: 20,
  },
});
