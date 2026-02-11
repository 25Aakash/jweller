import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, ActivityIndicator, Divider } from 'react-native-paper';
import { jewellerAPI } from '../../api/endpoints';

interface CustomerDetailsData {
  customer: {
    id: string;
    name: string;
    phone_number: string;
    state: string;
    city: string;
    wallet_balance: number;
    gold_grams: number;
    created_at: string;
  };
  transactions: any[];
  bookings: any[];
}

export default function CustomerDetailsScreen({ route }: any) {
  const { customerId } = route.params;
  const [data, setData] = useState<CustomerDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  const fetchCustomerDetails = async () => {
    try {
      const result = await jewellerAPI.getCustomerDetails(customerId);
      setData(result);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Customer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.name}>
            {data.customer.name}
          </Text>
          <List.Item
            title="Phone"
            description={data.customer.phone_number}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
          <List.Item
            title="Location"
            description={`${data.customer.city}, ${data.customer.state}`}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
          />
          <List.Item
            title="Member Since"
            description={new Date(data.customer.created_at).toLocaleDateString()}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Wallet
          </Text>
          <View style={styles.walletRow}>
            <View style={styles.walletItem}>
              <Text variant="bodySmall">Balance</Text>
              <Text variant="headlineSmall" style={styles.walletValue}>
                ₹{data.customer.wallet_balance.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.walletItem}>
              <Text variant="bodySmall">Gold</Text>
              <Text variant="headlineSmall" style={styles.walletValue}>
                {data.customer.gold_grams.toFixed(2)}g
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Transactions ({data.transactions.length})
          </Text>
          {data.transactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            data.transactions?.slice(0, 5).map((txn) => (
              <List.Item
                key={txn.id}
                title={`₹${txn.amount.toLocaleString('en-IN')}`}
                description={txn.type}
                right={() => <Text>{txn.status}</Text>}
              />
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Gold Bookings ({data.bookings.length})
          </Text>
          {data.bookings.length === 0 ? (
            <Text style={styles.emptyText}>No bookings yet</Text>
          ) : (
            data.bookings.map((booking) => (
              <List.Item
                key={booking.id}
                title={`${booking.gold_grams.toFixed(2)}g`}
                description={`₹${booking.amount_paid.toLocaleString('en-IN')}`}
                right={() => <Text>{booking.status}</Text>}
              />
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 10,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletItem: {
    alignItems: 'center',
  },
  walletValue: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
});
