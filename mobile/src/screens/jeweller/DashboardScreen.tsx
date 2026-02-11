import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { jewellerAPI } from '../../api/endpoints';

interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  totalGoldSold: number;
  activeBookings: number;
  todayTransactions: number;
}

export default function DashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await jewellerAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          💎 Business Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Overview of your gold business
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="account-group" size={32} color="#6200ee" />
            <Text variant="headlineSmall" style={styles.statValue}>
              {String(stats?.totalCustomers || 0)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Total Customers
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="currency-inr" size={32} color="#00C853" />
            <Text variant="headlineSmall" style={styles.statValue}>
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Total Revenue
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="gold" size={32} color="#FFD700" />
            <Text variant="headlineSmall" style={styles.statValue}>
              {(stats?.totalGoldSold || 0).toFixed(2)}g
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Gold Sold
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <MaterialCommunityIcons name="book-open-variant" size={32} color="#FF6F00" />
            <Text variant="headlineSmall" style={styles.statValue}>
              {String(stats?.activeBookings || 0)}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Active Bookings
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.quickActions}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <Button
          mode="contained"
          icon="cash-plus"
          style={styles.actionButton}
          onPress={() => navigation.navigate('GoldPrice')}
        >
          Update Gold Price
        </Button>

        <Button
          mode="outlined"
          icon="account-group"
          style={styles.actionButton}
          onPress={() => navigation.navigate('Customers')}
        >
          View All Customers
        </Button>

        <Button
          mode="outlined"
          icon="cash-multiple"
          style={styles.actionButton}
          onPress={() => navigation.navigate('Transactions')}
        >
          View Transactions
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
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
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
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
  },
});
