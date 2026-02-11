import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar, Button } from 'react-native-paper';
import { jewellerAPI } from '../../api/endpoints';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      const data = await jewellerAPI.getAllBookings();
      setBookings(data);
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
        return '#00C853';
      case 'REDEEMED':
        return '#2196F3';
      case 'CANCELLED':
        return '#D32F2F';
      default:
        return '#666';
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by customer name..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">{item.user_name}</Text>
                <Chip
                  style={{ backgroundColor: getStatusColor(item.status) }}
                  textStyle={{ color: '#fff' }}
                >
                  {item.status}
                </Chip>
              </View>
              <Text variant="headlineSmall" style={styles.goldAmount}>
                🏆 {item.gold_grams.toFixed(2)}g
              </Text>
              <View style={styles.details}>
                <Text variant="bodySmall">
                  Amount: ₹{item.amount_paid.toLocaleString('en-IN')}
                </Text>
                <Text variant="bodySmall">
                  Price: ₹{item.locked_price_per_gram}/g
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.date}>
                {new Date(item.booked_at).toLocaleDateString()}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No bookings found</Text>
          </View>
        }
      />
    </View>
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
  searchbar: {
    margin: 10,
  },
  card: {
    margin: 10,
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
  date: {
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
