import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, StatusBar } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import { jewellerAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

interface Transaction {
  id: string;
  user_name: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

export default function AllTransactionsScreen() {
  const { theme, isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    try {
      const data = await jewellerAPI.getAllTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      case 'FAILED':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const filteredTransactions = transactions?.filter(txn =>
    txn.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
        placeholder="Search by customer name..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.background.card }]}
        inputStyle={{ color: theme.colors.text.primary }}
        placeholderTextColor={theme.colors.text.disabled}
        iconColor={theme.colors.text.secondary}
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.text.primary }}>{item.user_name}</Text>
                <Chip
                  style={{ backgroundColor: getStatusColor(item.status) }}
                  textStyle={{ color: '#fff', fontSize: 12 }}
                >
                  {item.status}
                </Chip>
              </View>
              <Text variant="bodyMedium" style={[styles.amount, { color: theme.colors.text.primary }]}>
                ₹{(item.amount || 0).toLocaleString('en-IN')}
              </Text>
              <View style={styles.cardFooter}>
                <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>{item.type}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.text.secondary }}>No transactions found</Text>
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
  amount: {
    fontWeight: 'bold',
    fontSize: 20,
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
