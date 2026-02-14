import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, StatusBar } from 'react-native';
import { Text, Searchbar, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { jewellerAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  state: string;
  city: string;
  wallet_balance: number;
  gold_grams: number;
  created_at: string;
}

export default function CustomersScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      const data = await jewellerAPI.getAllCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone_number?.includes(searchQuery)
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Searchbar
        placeholder="Search customers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.background.card }]}
        inputStyle={{ color: theme.colors.text.primary }}
        placeholderTextColor={theme.colors.text.disabled}
        iconColor={theme.colors.text.secondary}
      />

      <View style={[styles.stats, { backgroundColor: theme.colors.background.card, borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#eee' }]}>
        <Text variant="titleMedium" style={{ color: theme.colors.text.primary }}>Total Customers: {customers.length}</Text>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
        }
        renderItem={({ item }) => (
          <Card
            style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}
            onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.text.primary }}>{item.name}</Text>
                <Chip icon="phone" textStyle={{ color: theme.colors.text.primary }} style={{ backgroundColor: isDark ? theme.colors.background.tertiary : undefined }}>{item.phone_number}</Chip>
              </View>
              <Text variant="bodySmall" style={[styles.location, { color: theme.colors.text.secondary }]}>
                📍 {item.city}, {item.state}
              </Text>
              <View style={styles.cardFooter}>
                <Text variant="bodySmall" style={{ color: theme.colors.text.primary }}>
                  💰 ₹{(item.wallet_balance || 0).toLocaleString('en-IN')}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.text.primary }}>
                  🏆 {(item.gold_grams || 0).toFixed(2)}g
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.text.secondary }}>No customers found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 10,
    borderRadius: 10,
  },
  stats: {
    padding: 15,
    borderBottomWidth: 1,
  },
  card: {
    margin: 10,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
