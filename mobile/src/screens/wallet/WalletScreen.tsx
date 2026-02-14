import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, StatusBar } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { walletAPI } from '../../api/endpoints';
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

  const getTransactionIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'credit': case 'deposit': return 'arrow-down-circle';
      case 'debit': case 'withdrawal': return 'arrow-up-circle';
      case 'gold_purchase': return 'gold';
      default: return 'credit-card';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit': case 'deposit': return theme.colors.success;
      case 'debit': case 'withdrawal': return theme.colors.error;
      default: return theme.colors.text.secondary;
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.primary.dark }]}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: isDark ? theme.colors.text.primary : '#fff' }]}>
          💰 My Wallet
        </Text>
        <Text variant="bodyMedium" style={{ color: isDark ? theme.colors.text.secondary : 'rgba(255,255,255,0.9)' }}>
          Manage your funds
        </Text>
      </View>

      {/* Balance Card */}
      <Card style={[styles.balanceCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content style={styles.balanceContent}>
          <MaterialCommunityIcons name="wallet" size={40} color={theme.colors.primary.main} />
          <Text variant="bodyLarge" style={{ color: theme.colors.text.secondary, marginTop: 8 }}>
            Total Balance
          </Text>
          <Text variant="displaySmall" style={[styles.balanceAmount, { color: theme.colors.text.primary }]}>
            ₹{balance.toFixed(2)}
          </Text>
          <View style={styles.actionRow}>
            <Button
              mode="contained"
              icon="plus"
              style={styles.actionButton}
              buttonColor={theme.colors.primary.main}
              textColor="#fff"
              onPress={() => navigation.navigate('AddMoney')}
            >
              Add Money
            </Button>
            <Button
              mode="outlined"
              icon="minus"
              style={[styles.actionButton, { borderColor: theme.colors.primary.main }]}
              textColor={theme.colors.primary.main}
              onPress={() => navigation.navigate('Withdraw')}
            >
              Withdraw
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Transactions */}
      <View style={styles.transactionsSection}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Recent Transactions
        </Text>

        {transactions.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="inbox-outline" size={48} color={theme.colors.text.disabled} />
              <Text variant="titleMedium" style={{ color: theme.colors.text.secondary, marginTop: 12 }}>
                No Transactions Yet
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.disabled, textAlign: 'center', marginTop: 4 }}>
                Your transaction history will appear here
              </Text>
              <Button
                mode="contained"
                icon="plus"
                style={{ marginTop: 16, borderRadius: 10 }}
                buttonColor={theme.colors.primary.main}
                textColor="#fff"
                onPress={() => navigation.navigate('AddMoney')}
              >
                Add Money
              </Button>
            </Card.Content>
          </Card>
        ) : (
          transactions.slice(0, 10).map((transaction) => (
            <Card
              key={transaction.id}
              style={[styles.transactionCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}
            >
              <Card.Content style={styles.transactionContent}>
                <View style={styles.transactionLeft}>
                  <MaterialCommunityIcons
                    name={getTransactionIcon(transaction.type) as any}
                    size={28}
                    color={getTransactionColor(transaction.type)}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text variant="titleSmall" style={{ color: theme.colors.text.primary, textTransform: 'capitalize' }}>
                      {transaction.type.replace('_', ' ')}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    variant="titleSmall"
                    style={{ color: getTransactionColor(transaction.type), fontWeight: 'bold' }}
                  >
                    {transaction.type.toLowerCase().includes('credit') || transaction.type.toLowerCase().includes('deposit') ? '+' : '-'}
                    ₹{transaction.amount.toFixed(2)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.text.disabled, textTransform: 'capitalize' }}>
                    {transaction.status}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 56,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  balanceCard: {
    margin: 10,
    borderRadius: 12,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  balanceAmount: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
  },
  transactionsSection: {
    padding: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  transactionCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
});
