import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, StatusBar } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { walletAPI, goldAPI, silverAPI } from '../../api/endpoints';
import { useTheme } from '../../context/ThemeContext';
import { GoldPrice, SilverPrice } from '../../types';

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
  const [goldGrams, setGoldGrams] = useState(0);
  const [silverGrams, setSilverGrams] = useState(0);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [silverPrice, setSilverPrice] = useState<SilverPrice | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, transactionsData, goldData, silverData] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        goldAPI.getCurrentPrice(),
        silverAPI.getCurrentPrice(),
      ]);
      setBalance(balanceData?.wallet?.balance ?? balanceData?.balance ?? 0);
      setGoldGrams(balanceData?.wallet?.gold_grams ?? balanceData?.gold_grams ?? 0);
      setSilverGrams(balanceData?.wallet?.silver_grams ?? balanceData?.silver_grams ?? 0);
      setGoldPrice(goldData);
      setSilverPrice(silverData);
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
      case 'silver_purchase': return 'circle-multiple';
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

  const goldValue = goldGrams * (goldPrice?.final_price || 0);
  const silverValue = silverGrams * (silverPrice?.final_price || 0);

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
          Your gold & silver holdings
        </Text>
      </View>

      {/* Gold Holdings Card */}
      <Card style={[styles.holdingCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content style={styles.holdingContent}>
          <View style={styles.holdingLeft}>
            <View style={[styles.holdingIconBg, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
              <MaterialCommunityIcons name="gold" size={28} color="#FFD700" />
            </View>
            <View style={styles.holdingInfo}>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
                Gold Holdings
              </Text>
              <Text variant="headlineSmall" style={[styles.holdingGrams, { color: theme.colors.text.primary }]}>
                {goldGrams.toFixed(3)} g
              </Text>
            </View>
          </View>
          <View style={styles.holdingRight}>
            <Text variant="titleMedium" style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
              ₹{goldValue.toFixed(0)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>
              @ ₹{goldPrice?.final_price?.toFixed(0) || '0'}/g
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Silver Holdings Card */}
      <Card style={[styles.holdingCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content style={styles.holdingContent}>
          <View style={styles.holdingLeft}>
            <View style={[styles.holdingIconBg, { backgroundColor: 'rgba(192,192,192,0.15)' }]}>
              <MaterialCommunityIcons name="circle-multiple" size={28} color="#C0C0C0" />
            </View>
            <View style={styles.holdingInfo}>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
                Silver Holdings
              </Text>
              <Text variant="headlineSmall" style={[styles.holdingGrams, { color: theme.colors.text.primary }]}>
                {silverGrams.toFixed(3)} g
              </Text>
            </View>
          </View>
          <View style={styles.holdingRight}>
            <Text variant="titleMedium" style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
              ₹{silverValue.toFixed(0)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>
              @ ₹{silverPrice?.final_price?.toFixed(0) || '0'}/g
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Wallet Balance */}
      <Card style={[styles.balanceCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content style={styles.balanceContent}>
          <View style={styles.balanceRow}>
            <View>
              <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
                Cash Balance
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
                ₹{balance.toFixed(2)}
              </Text>
            </View>
            <Button
              mode="contained"
              icon="plus"
              compact
              style={styles.addBtn}
              buttonColor={theme.colors.primary.main}
              textColor="#fff"
              onPress={() => navigation.navigate('AddMoney')}
            >
              Add Money
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
  holdingCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  holdingContent: {
    paddingVertical: 4,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdingIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdingInfo: {
    marginLeft: 14,
    flex: 1,
  },
  holdingGrams: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  holdingRight: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  balanceCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
  },
  balanceContent: {
    paddingVertical: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    borderRadius: 20,
  },
  transactionsSection: {
    padding: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
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
