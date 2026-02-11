import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { goldAPI } from '../../api/endpoints';
import { GoldBooking } from '../../types';
import GlassCard from '../../components/GlassCard';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';
import { theme } from '../../theme/theme';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<GoldBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await goldAPI.getBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
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
    return b.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.secondary.main;
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return theme.colors.text.disabled;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'all' && styles.filterChipActive,
            { borderColor: theme.colors.primary.pastel },
            filter === 'all' && { borderColor: theme.colors.primary.main, backgroundColor: theme.colors.primary.light },
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'pending' && styles.filterChipActive,
            { borderColor: theme.colors.primary.pastel },
            filter === 'pending' && { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' },
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'completed' && styles.filterChipActive,
            { borderColor: theme.colors.primary.pastel },
            filter === 'completed' && { borderColor: theme.colors.secondary.main, backgroundColor: theme.colors.secondary.light },
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        <View style={styles.content}>
          {filteredBookings.length === 0 ? (
            <EmptyState
              emoji="📦"
              title="No Bookings"
              message="You don't have any gold bookings yet. Start booking gold to secure the best prices!"
            />
          ) : (
            filteredBookings.map((booking) => (
              <GlassCard key={booking.id} intensity={90} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTitle}>🏆 Gold Booking</Text>
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(booking.status) + '30' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gold Amount:</Text>
                  <Text style={styles.detailValue}>{booking.grams.toFixed(3)} grams</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Locked Price:</Text>
                  <Text style={styles.detailValue}>₹{booking.locked_price.toFixed(2)}/gram</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>₹{booking.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelSmall}>Booking Date:</Text>
                  <Text style={styles.detailValueSmall}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelSmall}>Booking ID:</Text>
                  <Text style={styles.idText}>{booking.id.substring(0, 8)}...</Text>
                </View>
              </GlassCard>
            ))
          )}
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
  skeletonContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 2,
  },
  filterChipActive: {
    // backgroundColor set dynamically
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: theme.colors.text.primary,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  bookingCard: {
    marginBottom: theme.spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bookingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statusChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.primary.pastel,
    marginVertical: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  detailLabelSmall: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
  },
  detailValueSmall: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  idText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
});
