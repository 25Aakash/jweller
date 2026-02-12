import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { walletAPI } from '../../api/endpoints';
import GlassCard from '../../components/GlassCard';
import AnimatedNumber from '../../components/AnimatedNumber';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';
import QuickActionButton from '../../components/QuickActionButton';
import { useTheme } from '../../context/ThemeContext';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function WalletScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);
      setBalance(balanceData?.wallet?.balance ?? balanceData?.balance ?? 0);
      const txns = transactionsData?.transactions || transactionsData || [];
      setTransactions(Array.isArray(txns) ? txns : []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
      case 'deposit':
        return '💰';
      case 'debit':
      case 'withdrawal':
        return '💸';
      case 'gold_purchase':
        return '🏆';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
      case 'deposit':
        return theme.colors.success;
      case 'debit':
      case 'withdrawal':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={[styles.decorativeCircle1, { backgroundColor: theme.colors.secondary.light }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: theme.colors.primary.light }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        <View style={styles.content}>
          {/* Balance Card */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.secondary}
            intensity={90}
            style={styles.balanceCard}
          >
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>💰 Total Balance</Text>
              <AnimatedNumber
                value={balance}
                prefix="₹"
                decimals={2}
                style={styles.balanceAmount}
              />
              <View style={styles.quickActions}>
                <QuickActionButton
                  title="Add Money"
                  icon="+"
                  onPress={() => navigation.navigate('AddMoney')}
                  colors={isDark ? [theme.colors.background.tertiary, theme.colors.background.secondary] as const : ['#FFFFFF', '#F0F0F0'] as const}
                  style={styles.actionButton}
                />
                <QuickActionButton
                  title="Withdraw"
                  icon="−"
                  onPress={() => navigation.navigate('Withdraw')}
                  colors={isDark ? [theme.colors.background.tertiary, theme.colors.background.secondary] as const : ['#FFFFFF', '#F0F0F0'] as const}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </GlassCard>

          {/* Transactions */}
          <View style={styles.transactionsHeader}>
            <Text style={[styles.transactionsTitle, { color: theme.colors.text.primary }]}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: theme.colors.primary.main }]}>View All →</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No Transactions Yet"
              message="Your transaction history will appear here once you start using your wallet."
              actionText="Add Money"
              onAction={() => navigation.navigate('AddMoney')}
            />
          ) : (
            transactions?.slice(0, 10).map((transaction) => (
              <GlassCard key={transaction.id} intensity={90} style={styles.transactionCard}>
                <View style={styles.transactionContent}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type)}
                    </Text>
                    <View>
                      <Text style={[styles.transactionType, { color: theme.colors.text.primary }]}>
                        {transaction.type.replace('_', ' ')}
                      </Text>
                      <Text style={[styles.transactionDate, { color: theme.colors.text.secondary }]}>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getTransactionColor(transaction.type) },
                      ]}
                    >
                      {transaction.type.toLowerCase().includes('credit') ||
                      transaction.type.toLowerCase().includes('deposit')
                        ? '+'
                        : '-'}
                      ₹{transaction.amount.toFixed(2)}
                    </Text>
                    <Text style={[styles.transactionStatus, { color: theme.colors.text.disabled }]}>{transaction.status}</Text>
                  </View>
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
    opacity: 0.2,
    top: 50,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.2,
    bottom: 100,
    left: -80,
  },
  scrollView: {
    flex: 1,
  },
  skeletonContainer: {
    padding: 24,
    gap: 24,
  },
  content: {
    padding: 24,
  },
  balanceCard: {
    marginBottom: 32,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionCard: {
    marginBottom: 16,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  transactionIcon: {
    fontSize: 32,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 14,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionStatus: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
