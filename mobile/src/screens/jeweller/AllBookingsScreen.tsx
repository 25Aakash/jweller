import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar, Button } from 'react-native-paper';
import { jewellerAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';

interface Booking {
  id: string;
  user_name: string;
  gold_grams: number;
  amount_paid: number;
  locked_price_per_gram: number;
  status: string;
  booked_at: string;
}

export default function AllBookingsScreen() {
  const { theme, isDark } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      const data = await jewellerAPI.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.success;
      case 'REDEEMED':
        return theme.colors.info;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
        placeholder="Search by customer name..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.background.card }]}
        inputStyle={{ color: theme.colors.text.primary }}
        placeholderTextColor={theme.colors.text.disabled}
        iconColor={theme.colors.text.secondary}
      />

      <FlatList
        data={filteredBookings}
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
              <Text variant="headlineSmall" style={[styles.goldAmount, { color: theme.colors.text.primary }]}>
                🏆 {(item.gold_grams || 0).toFixed(2)}g
              </Text>
              <View style={styles.details}>
                <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                  Amount: ₹{(item.amount_paid || 0).toLocaleString('en-IN')}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                  Price: ₹{item.locked_price_per_gram}/g
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>
                {new Date(item.booked_at).toLocaleDateString()}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.text.secondary }}>No bookings found</Text>
          </View>
        }
      />
    </View>
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
  goldAmount: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
