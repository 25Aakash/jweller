import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { walletAPI, goldAPI, silverAPI } from '../api/endpoints';
import { WalletBalance, GoldPrice, SilverPrice } from '../types';
import { getGreeting } from '../utils/greetings';
import { newsService, NewsArticle } from '../services/newsService';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [silverPrice, setSilverPrice] = useState<SilverPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [topNews, setTopNews] = useState<NewsArticle[]>([]);

  const greeting = getGreeting();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletData, goldData, silverData] = await Promise.all([
        walletAPI.getBalance(),
        goldAPI.getCurrentPrice(),
        silverAPI.getCurrentPrice(),
      ]);
      setWallet(walletData);
      setGoldPrice(goldData);
      setSilverPrice(silverData);
      setLastUpdated(new Date());

      // Load top 2 news articles for home widget
      try {
        const [gNews, sNews] = await Promise.all([
          newsService.fetchGoldNews(),
          newsService.fetchSilverNews(),
        ]);
        const combined = [...gNews.slice(0, 1), ...sNews.slice(0, 1)];
        setTopNews(combined);
      } catch {}
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
        <Text variant="bodyLarge" style={{ color: isDark ? theme.colors.text.secondary : 'rgba(255,255,255,0.9)' }}>
          {greeting.emoji} {greeting.text}!
        </Text>
        <Text variant="headlineMedium" style={[styles.headerName, { color: isDark ? theme.colors.text.primary : '#fff' }]}>
          {user?.name || 'Guest'}
        </Text>
        <Text variant="bodySmall" style={{ color: isDark ? theme.colors.text.disabled : 'rgba(255,255,255,0.7)' }}>
          Updated {formatLastUpdated()}
        </Text>
      </View>

      {/* My Holdings */}
      <View style={styles.holdingsSection}>
        <Text variant="titleMedium" style={[styles.holdingsSectionTitle, { color: theme.colors.text.secondary }]}>
          My Holdings
        </Text>
        <View style={styles.holdingsRow}>
          <Card style={[styles.holdingCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.holdingCardContent}>
              <View style={[styles.holdingIconBg, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
                <MaterialCommunityIcons name="gold" size={24} color="#FFD700" />
              </View>
              <Text variant="titleLarge" style={[styles.holdingGrams, { color: theme.colors.text.primary }]}>
                {(wallet?.wallet?.gold_grams ?? wallet?.gold_grams ?? 0).toFixed(3)}g
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                Gold
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.disabled, marginTop: 2 }}>
                ≈ ₹{((wallet?.wallet?.gold_grams ?? wallet?.gold_grams ?? 0) * (goldPrice?.final_price || 0)).toFixed(0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.holdingCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.holdingCardContent}>
              <View style={[styles.holdingIconBg, { backgroundColor: 'rgba(192,192,192,0.15)' }]}>
                <MaterialCommunityIcons name="circle-multiple" size={24} color="#C0C0C0" />
              </View>
              <Text variant="titleLarge" style={[styles.holdingGrams, { color: theme.colors.text.primary }]}>
                {(wallet?.wallet?.silver_grams ?? wallet?.silver_grams ?? 0).toFixed(3)}g
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                Silver
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.disabled, marginTop: 2 }}>
                ≈ ₹{((wallet?.wallet?.silver_grams ?? wallet?.silver_grams ?? 0) * (silverPrice?.final_price || 0)).toFixed(0)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Price Grid - 2x2 */}
      <View style={styles.priceSection}>
        <Text variant="titleMedium" style={[styles.priceSectionTitle, { color: theme.colors.text.secondary }]}>
          Live Prices
        </Text>
        <View style={styles.priceGrid}>
          <Card style={[styles.priceCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.priceCardContent}>
              <View style={[styles.priceIconBg, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
                <MaterialCommunityIcons name="gold" size={22} color="#FFD700" />
              </View>
              <Text variant="titleMedium" style={[styles.priceValue, { color: theme.colors.text.primary }]}>
                ₹{goldPrice?.final_price?.toFixed(0) || '0'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                Gold Price/g
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.priceCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.priceCardContent}>
              <View style={[styles.priceIconBg, { backgroundColor: 'rgba(192,192,192,0.15)' }]}>
                <MaterialCommunityIcons name="circle-multiple" size={22} color="#C0C0C0" />
              </View>
              <Text variant="titleMedium" style={[styles.priceValue, { color: theme.colors.text.primary }]}>
                ₹{silverPrice?.final_price?.toFixed(0) || '0'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                Silver Price/g
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.priceCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.priceCardContent}>
              <View style={[styles.priceIconBg, { backgroundColor: isDark ? 'rgba(255,183,77,0.15)' : 'rgba(255,183,77,0.10)' }]}>
                <MaterialCommunityIcons name="currency-inr" size={22} color={theme.colors.warning} />
              </View>
              <Text variant="titleMedium" style={[styles.priceValue, { color: theme.colors.text.primary }]}>
                ₹{goldPrice?.base_mcx_price?.toFixed(0) || '0'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                Gold MCX
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.priceCard, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
            <Card.Content style={styles.priceCardContent}>
              <View style={[styles.priceIconBg, { backgroundColor: 'rgba(192,192,192,0.15)' }]}>
                <MaterialCommunityIcons name="currency-inr" size={22} color="#C0C0C0" />
              </View>
              <Text variant="titleMedium" style={[styles.priceValue, { color: theme.colors.text.primary }]}>
                ₹{silverPrice?.base_mcx_price?.toFixed(0) || '0'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.text.secondary }}>
                Silver MCX
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Market Snapshot Widget */}
      <View style={styles.marketWidget}>
        <View style={styles.marketWidgetHeader}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary, marginBottom: 0 }]}>
            📈 Market
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Market' })}>
            <Text style={{ color: theme.colors.primary.main, fontSize: 13, fontWeight: '600' }}>
              View All →
            </Text>
          </TouchableOpacity>
        </View>

        {topNews.length > 0 && (
          <View style={styles.newsWidgetList}>
            {topNews.map((article, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Main', { screen: 'Market' })}
              >
                <Card
                  style={[
                    styles.newsWidgetCard,
                    { backgroundColor: theme.colors.background.card },
                    isDark && styles.darkCardBorder,
                  ]}
                >
                  <Card.Content style={styles.newsWidgetContent}>
                    <View style={[styles.newsWidgetIcon, { backgroundColor: idx === 0 ? 'rgba(255,215,0,0.12)' : 'rgba(192,192,192,0.12)' }]}>
                      <MaterialCommunityIcons
                        name={idx === 0 ? 'gold' : 'circle-multiple'}
                        size={20}
                        color={idx === 0 ? '#FFD700' : '#C0C0C0'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: theme.colors.text.primary, fontSize: 13, fontWeight: '600', lineHeight: 18 }}
                        numberOfLines={2}
                      >
                        {article.title}
                      </Text>
                      <Text style={{ color: theme.colors.text.disabled, fontSize: 11, marginTop: 2 }}>
                        {article.source.name}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.text.disabled} />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Quick Actions
        </Text>

        <Button
          mode="contained"
          icon="wallet-plus"
          style={styles.actionButton}
          buttonColor={theme.colors.primary.main}
          textColor="#fff"
          onPress={() => navigation.navigate('AddMoney')}
        >
          Add Money to Wallet
        </Button>

        <Button
          mode="contained"
          icon="gold"
          style={styles.actionButton}
          buttonColor="#FFD700"
          textColor="#000"
          onPress={() => navigation.navigate('Gold')}
        >
          Buy Gold Now
        </Button>

        <Button
          mode="contained"
          icon="circle-multiple"
          style={styles.actionButton}
          buttonColor="#C0C0C0"
          textColor="#000"
          onPress={() => navigation.navigate('Silver')}
        >
          Buy Silver Now
        </Button>

        <Button
          mode="outlined"
          icon="book-open-variant"
          style={[styles.actionButton, { borderColor: theme.colors.primary.main }]}
          textColor={theme.colors.primary.main}
          onPress={() => navigation.navigate('Bookings')}
        >
          View My Gold Bookings
        </Button>

        <Button
          mode="outlined"
          icon="book-open-variant"
          style={[styles.actionButton, { borderColor: '#C0C0C0' }]}
          textColor={theme.colors.text.primary}
          onPress={() => navigation.navigate('SilverBookings')}
        >
          View My Silver Bookings
        </Button>
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
  headerName: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  holdingsSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  holdingsSectionTitle: {
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 2,
  },
  holdingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holdingCard: {
    width: '48%',
    borderRadius: 14,
    elevation: 1,
  },
  holdingCardContent: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  holdingIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  holdingGrams: {
    fontWeight: 'bold',
  },
  priceSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  priceSectionTitle: {
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 2,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  priceCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 14,
    elevation: 1,
  },
  priceCardContent: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  priceIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceValue: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButton: {
    marginBottom: 10,
    borderRadius: 10,
  },
  marketWidget: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  marketWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsWidgetList: {
    gap: 8,
  },
  newsWidgetCard: {
    borderRadius: 12,
    elevation: 1,
  },
  newsWidgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  newsWidgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
