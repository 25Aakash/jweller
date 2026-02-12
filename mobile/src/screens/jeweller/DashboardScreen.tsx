import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { jewellerAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  totalGoldSold: number;
  activeBookings: number;
  todayTransactions: number;
  totalSilverSold: number;
  activeSilverBookings: number;
}

export default function DashboardScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await jewellerAPI.getDashboard();
      setStats(data?.data || data);
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
      }
    >
      <View style={[styles.header, { backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.primary.dark }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: isDark ? theme.colors.text.primary : '#fff' }]}>
          💎 Business Dashboard
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: isDark ? theme.colors.text.secondary : 'rgba(255,255,255,0.9)' }]}>
          Overview of your business
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="account-group" size={32} color={theme.colors.primary.main} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {String(stats?.totalCustomers || 0)}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Total Customers
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="currency-inr" size={32} color={theme.colors.success} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Total Revenue
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="gold" size={32} color="#FFD700" />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {(stats?.totalGoldSold || 0).toFixed(2)}g
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Gold Booked
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="circle-multiple" size={32} color="#C0C0C0" />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {(stats?.totalSilverSold || 0).toFixed(2)}g
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Silver Booked
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="book-open-variant" size={32} color={theme.colors.warning} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {String(stats?.activeBookings || 0)}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Gold Bookings
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <MaterialCommunityIcons name="bookmark-multiple" size={32} color="#9E9E9E" />
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {String(stats?.activeSilverBookings || 0)}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Silver Bookings
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={[styles.quickActions, { backgroundColor: theme.colors.background.primary }]}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Quick Actions
        </Text>

        <Button
          mode="contained"
          icon="cash-plus"
          style={styles.actionButton}
          buttonColor={theme.colors.primary.main}
          textColor="#fff"
          onPress={() => navigation.navigate('GoldPrice')}
        >
          Update Gold Price
        </Button>

        <Button
          mode="contained"
          icon="circle-multiple"
          style={styles.actionButton}
          buttonColor="#C0C0C0"
          textColor="#000"
          onPress={() => navigation.navigate('SilverPrice')}
        >
          Update Silver Price
        </Button>

        <Button
          mode="outlined"
          icon="account-group"
          style={[styles.actionButton, { borderColor: theme.colors.primary.main }]}
          textColor={theme.colors.primary.main}
          onPress={() => navigation.navigate('Customers')}
        >
          View All Customers
        </Button>

        <Button
          mode="outlined"
          icon="cash-multiple"
          style={[styles.actionButton, { borderColor: theme.colors.primary.main }]}
          textColor={theme.colors.primary.main}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
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
  statLabel: {
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
    borderRadius: 10,
  },
});
