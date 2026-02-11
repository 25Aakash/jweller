import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { walletAPI } from '../../api/endpoints';
import { Transaction } from '../../types';
import GlassCard from '../../components/GlassCard';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';
import { theme } from '../../theme/theme';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await walletAPI.getTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const filteredTransactions = transactions?.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  }) || [];

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? '💰' : '💸';
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
            filter === 'credit' && styles.filterChipActive,
            { borderColor: theme.colors.primary.pastel },
            filter === 'credit' && { borderColor: theme.colors.secondary.main, backgroundColor: theme.colors.secondary.light },
          ]}
          onPress={() => setFilter('credit')}
        >
          <Text style={[styles.filterText, filter === 'credit' && styles.filterTextActive]}>Credit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'debit' && styles.filterChipActive,
            { borderColor: theme.colors.primary.pastel },
            filter === 'debit' && { borderColor: '#F87171', backgroundColor: '#FCA5A5' },
          ]}
          onPress={() => setFilter('debit')}
        >
          <Text style={[styles.filterText, filter === 'debit' && styles.filterTextActive]}>Debit</Text>
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
          {filteredTransactions.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No Transactions"
              message="You don't have any transactions yet. Start by adding money to your wallet!"
            />
          ) : (
            filteredTransactions.map((transaction) => (
              <GlassCard key={transaction.id} intensity={90} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>{getTransactionIcon(transaction.type)}</Text>
                    <Text style={styles.transactionType}>{transaction.type.toUpperCase()}</Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount,
                    ]}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(transaction.created_at).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.statusText,
                      transaction.status === 'completed' ? styles.statusCompleted : styles.statusPending,
                    ]}
                  >
                    {transaction.status.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.idText}>{transaction.id.substring(0, 8)}...</Text>
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
  transactionCard: {
    marginBottom: theme.spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionType: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  creditAmount: {
    color: theme.colors.secondary.main,
  },
  debitAmount: {
    color: '#EF4444',
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
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusCompleted: {
    color: theme.colors.secondary.main,
  },
  statusPending: {
    color: '#F59E0B',
  },
  idText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
});
