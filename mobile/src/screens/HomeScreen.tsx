import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { walletAPI, goldAPI } from '../api/endpoints';
import { WalletBalance, GoldPrice } from '../types';
import GlassCard from '../components/GlassCard';
import AnimatedNumber from '../components/AnimatedNumber';
import SkeletonCard from '../components/SkeletonCard';
import PressableCard from '../components/PressableCard';
import QuickActionButton from '../components/QuickActionButton';
import StatsCard from '../components/StatsCard';
import PriceTrend from '../components/PriceTrend';
import { getGreeting } from '../utils/greetings';
import { theme } from '../theme/theme';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const greeting = getGreeting();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletData, goldData] = await Promise.all([
        walletAPI.getBalance(),
        goldAPI.getCurrentPrice(),
      ]);
      
      if (goldPrice) {
        setPreviousPrice(goldPrice.final_price);
      }
      
      setWallet(walletData);
      setGoldPrice(goldData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Soft decorative circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        <View style={styles.content}>
          {/* Personalized Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting.emoji} {greeting.text}!</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.lastUpdated}>Updated {formatLastUpdated()}</Text>
          </View>

          {/* Quick Stats - Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
          >
            <StatsCard
              icon="💰"
              label="Wallet Balance"
              value={`₹${wallet?.balance?.toFixed(0) || '0'}`}
              colors={theme.colors.gradients.secondary}
            />
            <StatsCard
              icon="🏆"
              label="Gold Price"
              value={`₹${goldPrice?.final_price?.toFixed(0) || '0'}`}
              colors={theme.colors.gradients.primary}
            />
            <StatsCard
              icon="📊"
              label="Total Invested"
              value="₹0"
              colors={theme.colors.gradients.sunset}
            />
          </ScrollView>

          {/* Wallet Balance Card */}
          <PressableCard onPress={() => navigation.navigate('Wallet')}>
            <GlassCard
              gradient
              gradientColors={theme.colors.gradients.secondary}
              intensity={90}
              style={styles.walletCard}
            >
              <View style={styles.walletContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.walletLabel}>💰 Wallet Balance</Text>
                  <QuickActionButton
                    title="Add Money"
                    icon="+"
                    onPress={() => navigation.navigate('Wallet')}
                    colors={['#FFFFFF', '#F0F0F0'] as const}
                    style={styles.quickAction}
                  />
                </View>
                <AnimatedNumber
                  value={wallet?.balance || 0}
                  prefix="₹"
                  decimals={2}
                  style={styles.walletAmount}
                />
                <Text style={styles.walletSubtext}>Available for gold booking</Text>
              </View>
            </GlassCard>
          </PressableCard>

          {/* Gold Price Card */}
          <PressableCard onPress={() => navigation.navigate('GoldBooking')}>
            <GlassCard
              gradient
              gradientColors={theme.colors.gradients.primary}
              intensity={90}
              style={styles.goldCard}
            >
              <View style={styles.goldContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.goldHeader}>
                    <Text style={styles.goldEmoji}>🏆</Text>
                    <Text style={styles.goldLabel}>Live Gold Price</Text>
                  </View>
                  {previousPrice > 0 && goldPrice && (
                    <PriceTrend
                      currentPrice={goldPrice.final_price}
                      previousPrice={previousPrice}
                      size="small"
                    />
                  )}
                </View>
                
                <AnimatedNumber
                  value={goldPrice?.final_price || 0}
                  prefix="₹"
                  decimals={2}
                  style={styles.goldPrice}
                />
                <Text style={styles.goldUnit}>per gram</Text>
                
                <View style={styles.goldDetails}>
                  <View style={styles.goldDetailRow}>
                    <Text style={styles.goldDetailLabel}>Base Price:</Text>
                    <Text style={styles.goldDetailValue}>₹{goldPrice?.base_mcx_price?.toFixed(2) || 'N/A'}</Text>
                  </View>
                  <View style={styles.goldDetailRow}>
                    <Text style={styles.goldDetailLabel}>Margin:</Text>
                    <Text style={styles.goldDetailValue}>{goldPrice?.margin_percent || '0'}%</Text>
                  </View>
                </View>

                <QuickActionButton
                  title="Buy Gold Now"
                  icon="🛒"
                  onPress={() => navigation.navigate('GoldBooking')}
                  colors={['#FFFFFF', '#F0F0F0'] as const}
                  style={styles.buyButton}
                />
              </View>
            </GlassCard>
          </PressableCard>

          {/* User Info Card */}
          <GlassCard intensity={90} style={styles.infoCard}>
            <Text style={styles.infoTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Phone:</Text>
              <Text style={styles.infoValue}>{user?.phone_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Location:</Text>
              <Text style={styles.infoValue}>
                {user?.city && user?.state ? `${user.city}, ${user.state}` : 'Not available'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Role:</Text>
              <Text style={styles.infoValue}>{user?.role}</Text>
            </View>
          </GlassCard>

          {/* Logout Button */}
          <QuickActionButton
            title="Logout"
            icon="🚪"
            onPress={handleLogout}
            colors={['#FCA5A5', '#F87171', '#EF4444'] as const}
            style={styles.logoutButton}
          />
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
    top: 100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.secondary.light,
    opacity: 0.2,
    top: 400,
    left: -80,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.accent.pink,
    opacity: 0.2,
    bottom: 200,
    right: -60,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  skeletonContainer: {
    gap: theme.spacing.lg,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  lastUpdated: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
  },
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  walletCard: {
    marginBottom: theme.spacing.lg,
  },
  walletContent: {
    paddingVertical: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  walletLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  quickAction: {
    marginLeft: 'auto',
  },
  walletAmount: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  walletSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  goldCard: {
    marginBottom: theme.spacing.lg,
  },
  goldContent: {
    paddingVertical: theme.spacing.md,
  },
  goldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  goldEmoji: {
    fontSize: 24,
  },
  goldLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  goldPrice: {
    fontSize: 42,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  goldUnit: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  goldDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  goldDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  goldDetailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  goldDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  buyButton: {
    marginTop: theme.spacing.sm,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.light,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoutButton: {
    marginBottom: theme.spacing.xl,
  },
});
