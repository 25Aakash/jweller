import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { silverAPI } from '../../api/endpoints';
import { SilverBooking } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export default function SilverBookingsScreen() {
  const { theme, isDark } = useTheme();
  const darkCardBorder = isDark ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' } : {};

  const [bookings, setBookings] = useState<SilverBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await silverAPI.getBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error loading silver bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status?.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return theme.colors.secondary.main;
      case 'redeemed':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      default:
        return theme.colors.text.disabled;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Filter */}
      <View style={{ padding: 12 }}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'redeemed', label: 'Redeemed' },
          ]}
          style={{ backgroundColor: theme.colors.background.card }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
        }
      >
        {filteredBookings.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.background.card }, darkCardBorder]}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="package-variant" size={48} color={theme.colors.text.disabled} />
              <Text variant="titleMedium" style={{ color: theme.colors.text.secondary, marginTop: 12 }}>
                No Silver Bookings
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.disabled, textAlign: 'center', marginTop: 4 }}>
                Start booking silver to secure the best prices!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} style={[styles.bookingCard, { backgroundColor: theme.colors.background.card }, darkCardBorder]}>
              <Card.Content>
                <View style={styles.bookingHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="circle-multiple" size={24} color="#C0C0C0" />
                    <Text variant="titleMedium" style={{ color: theme.colors.text.primary, fontWeight: '700' }}>
                      Silver Booking
                    </Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text variant="labelSmall" style={{ color: getStatusColor(booking.status), fontWeight: '700' }}>
                      {booking.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]} />

                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Silver Amount</Text>
                  <Text variant="titleSmall" style={{ color: theme.colors.text.primary }}>{booking.grams?.toFixed(3)} grams</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Locked Price</Text>
                  <Text variant="titleSmall" style={{ color: theme.colors.text.primary }}>₹{booking.locked_price?.toFixed(2)}/gram</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>Total Amount</Text>
                  <Text variant="titleSmall" style={{ color: theme.colors.primary.main, fontWeight: '700' }}>₹{booking.amount?.toFixed(2)}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }]} />

                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>Date</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>ID</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>
                    {booking.id?.substring(0, 8)}...
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { margin: 10, borderRadius: 12 },
  bookingCard: { marginBottom: 10, borderRadius: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  divider: { height: 1, marginVertical: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
});
