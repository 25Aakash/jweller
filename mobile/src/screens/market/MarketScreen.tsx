import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Linking,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { goldAPI, silverAPI } from '../../api/endpoints';
import { newsService, NewsArticle } from '../../services/newsService';
import {
  priceHistoryService,
  PricePoint,
  TimeRange,
} from '../../services/priceHistoryService';
import { GoldPrice, SilverPrice } from '../../types';

type MetalTab = 'gold' | 'silver';
const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];

export default function MarketScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // State
  const [metalTab, setMetalTab] = useState<MetalTab>('gold');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [silverPrice, setSilverPrice] = useState<SilverPrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [goldNews, setGoldNews] = useState<NewsArticle[]>([]);
  const [silverNews, setSilverNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    loadChart();
  }, [metalTab, timeRange]);

  const loadAllData = async () => {
    try {
      const [goldP, silverP, gNews, sNews] = await Promise.all([
        goldAPI.getCurrentPrice().catch(() => null),
        silverAPI.getCurrentPrice().catch(() => null),
        newsService.fetchGoldNews(),
        newsService.fetchSilverNews(),
      ]);
      setGoldPrice(goldP);
      setSilverPrice(silverP);
      setGoldNews(gNews);
      setSilverNews(sNews);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadChart = async () => {
    setChartLoading(true);
    try {
      const data =
        metalTab === 'gold'
          ? await priceHistoryService.getGoldPriceHistory(timeRange)
          : await priceHistoryService.getSilverPriceHistory(timeRange);
      setPriceHistory(data);
    } catch {
      setPriceHistory([]);
    } finally {
      setChartLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData();
    loadChart();
  }, [metalTab, timeRange]);

  const currentPrice = metalTab === 'gold' ? goldPrice : silverPrice;
  const currentNews = metalTab === 'gold' ? goldNews : silverNews;
  const metalColor = metalTab === 'gold' ? '#FFD700' : '#C0C0C0';
  const metalBg = metalTab === 'gold' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(192, 192, 192, 0.1)';

  const chartLabels = priceHistory
    .filter((_, i) => i % Math.max(1, Math.floor(priceHistory.length / 6)) === 0)
    .map((p) => p.label);
  const chartData = priceHistory.map((p) => p.price);

  const priceChange =
    chartData.length >= 2 ? chartData[chartData.length - 1] - chartData[0] : 0;
  const priceChangePercent =
    chartData.length >= 2 && chartData[0] > 0
      ? ((priceChange / chartData[0]) * 100).toFixed(2)
      : '0.00';
  const isPositive = priceChange >= 0;

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={{ color: theme.colors.text.secondary, marginTop: 12 }}>
          Loading market data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary.main}
        />
      }
    >
      {/* Metal Toggle */}
      <View style={styles.metalToggle}>
        <TouchableOpacity
          style={[
            styles.metalTab,
            metalTab === 'gold' && { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: '#FFD700' },
            metalTab !== 'gold' && { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
          ]}
          onPress={() => setMetalTab('gold')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="gold"
            size={22}
            color={metalTab === 'gold' ? '#FFD700' : theme.colors.text.disabled}
          />
          <Text
            style={[
              styles.metalTabText,
              { color: metalTab === 'gold' ? '#FFD700' : theme.colors.text.disabled },
            ]}
          >
            Gold
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.metalTab,
            metalTab === 'silver' && { backgroundColor: 'rgba(192, 192, 192, 0.15)', borderColor: '#C0C0C0' },
            metalTab !== 'silver' && { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
          ]}
          onPress={() => setMetalTab('silver')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="circle-multiple"
            size={22}
            color={metalTab === 'silver' ? '#A0A0A0' : theme.colors.text.disabled}
          />
          <Text
            style={[
              styles.metalTabText,
              { color: metalTab === 'silver' ? '#A0A0A0' : theme.colors.text.disabled },
            ]}
          >
            Silver
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Price Card */}
      <Card
        style={[
          styles.priceCard,
          { backgroundColor: theme.colors.background.card },
          isDark && styles.darkCardBorder,
        ]}
      >
        <Card.Content>
          <View style={styles.priceHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons
                name={metalTab === 'gold' ? 'gold' : 'circle-multiple'}
                size={28}
                color={metalColor}
              />
              <View>
                <Text style={{ color: theme.colors.text.secondary, fontSize: 13 }}>
                  {metalTab === 'gold' ? 'Gold' : 'Silver'} Price per gram
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontSize: 28,
                    fontWeight: 'bold',
                  }}
                >
                  ₹{currentPrice?.final_price?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.changeBadge,
                { backgroundColor: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' },
              ]}
            >
              <MaterialCommunityIcons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={18}
                color={isPositive ? '#22C55E' : '#EF4444'}
              />
              <Text
                style={{
                  color: isPositive ? '#22C55E' : '#EF4444',
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {isPositive ? '+' : ''}
                {priceChangePercent}%
              </Text>
            </View>
          </View>

          <Text style={{ color: theme.colors.text.disabled, fontSize: 11, marginTop: 4 }}>
            MCX Base: ₹{currentPrice?.base_mcx_price?.toFixed(0) || '0'} | Margin:{' '}
            {currentPrice?.margin_percent?.toFixed(1) || '0'}% + ₹
            {currentPrice?.margin_fixed?.toFixed(0) || '0'}
          </Text>
        </Card.Content>
      </Card>

      {/* Price Chart */}
      <Card
        style={[
          styles.chartCard,
          { backgroundColor: theme.colors.background.card },
          isDark && styles.darkCardBorder,
        ]}
      >
        <Card.Content>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 12,
            }}
          >
            📈 Price Chart
          </Text>

          {/* Time Range Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeBtn,
                  timeRange === range && { backgroundColor: metalColor },
                  timeRange !== range && {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  },
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    {
                      color:
                        timeRange === range
                          ? metalTab === 'gold'
                            ? '#000'
                            : '#000'
                          : theme.colors.text.secondary,
                    },
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chart */}
          {chartLoading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="small" color={metalColor} />
            </View>
          ) : chartData.length > 1 ? (
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: chartData,
                    color: () => metalColor,
                    strokeWidth: 2.5,
                  },
                ],
              }}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: theme.colors.background.card,
                backgroundGradientTo: theme.colors.background.card,
                decimalPlaces: 0,
                color: () => metalColor,
                labelColor: () => (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
                propsForDots: {
                  r: '3',
                  strokeWidth: '1.5',
                  stroke: metalColor,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '4,4',
                  stroke: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  strokeWidth: 1,
                },
              }}
              bezier
              withInnerLines
              withOuterLines={false}
              withVerticalLabels
              withHorizontalLabels
              style={{ borderRadius: 12 }}
              fromZero={false}
            />
          ) : (
            <View style={styles.chartLoading}>
              <Text style={{ color: theme.colors.text.disabled }}>No chart data available</Text>
            </View>
          )}

          {/* Chart Stats */}
          {chartData.length > 1 && (
            <View style={styles.chartStats}>
              <View style={styles.chartStatItem}>
                <Text style={{ color: theme.colors.text.disabled, fontSize: 11 }}>High</Text>
                <Text style={{ color: theme.colors.text.primary, fontWeight: '600', fontSize: 13 }}>
                  ₹{Math.max(...chartData).toFixed(0)}
                </Text>
              </View>
              <View style={styles.chartStatItem}>
                <Text style={{ color: theme.colors.text.disabled, fontSize: 11 }}>Low</Text>
                <Text style={{ color: theme.colors.text.primary, fontWeight: '600', fontSize: 13 }}>
                  ₹{Math.min(...chartData).toFixed(0)}
                </Text>
              </View>
              <View style={styles.chartStatItem}>
                <Text style={{ color: theme.colors.text.disabled, fontSize: 11 }}>Avg</Text>
                <Text style={{ color: theme.colors.text.primary, fontWeight: '600', fontSize: 13 }}>
                  ₹{(chartData.reduce((a, b) => a + b, 0) / chartData.length).toFixed(0)}
                </Text>
              </View>
              <View style={styles.chartStatItem}>
                <Text style={{ color: theme.colors.text.disabled, fontSize: 11 }}>Change</Text>
                <Text
                  style={{
                    color: isPositive ? '#22C55E' : '#EF4444',
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {isPositive ? '+' : ''}₹{priceChange.toFixed(0)}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* News Section */}
      <View style={styles.newsSection}>
        <View style={styles.newsSectionHeader}>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: 18,
              fontWeight: '700',
            }}
          >
            📰 {metalTab === 'gold' ? 'Gold' : 'Silver'} News
          </Text>
          <Text style={{ color: theme.colors.text.disabled, fontSize: 12 }}>
            Latest updates
          </Text>
        </View>

        {currentNews.length === 0 ? (
          <Card
            style={[
              styles.emptyNews,
              { backgroundColor: theme.colors.background.card },
              isDark && styles.darkCardBorder,
            ]}
          >
            <Card.Content style={{ alignItems: 'center', padding: 30 }}>
              <MaterialCommunityIcons
                name="newspaper-variant-outline"
                size={48}
                color={theme.colors.text.disabled}
              />
              <Text style={{ color: theme.colors.text.disabled, marginTop: 12 }}>
                No news available right now
              </Text>
            </Card.Content>
          </Card>
        ) : (
          currentNews.map((article, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => {
                if (article.url) {
                  Linking.openURL(article.url);
                }
              }}
            >
              <Card
                style={[
                  styles.newsCard,
                  { backgroundColor: theme.colors.background.card },
                  isDark && styles.darkCardBorder,
                ]}
              >
                <Card.Content>
                  <View style={styles.newsRow}>
                    {article.image ? (
                      <Image
                        source={{ uri: article.image }}
                        style={styles.newsImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[styles.newsImagePlaceholder, { backgroundColor: metalBg }]}
                      >
                        <MaterialCommunityIcons
                          name={metalTab === 'gold' ? 'gold' : 'circle-multiple'}
                          size={24}
                          color={metalColor}
                        />
                      </View>
                    )}
                    <View style={styles.newsContent}>
                      <Text
                        style={{
                          color: theme.colors.text.primary,
                          fontSize: 14,
                          fontWeight: '600',
                          lineHeight: 20,
                        }}
                        numberOfLines={2}
                      >
                        {article.title}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: 12,
                          lineHeight: 18,
                          marginTop: 4,
                        }}
                        numberOfLines={2}
                      >
                        {article.description}
                      </Text>
                      <View style={styles.newsFooter}>
                        <Chip
                          style={{
                            backgroundColor: metalBg,
                            height: 24,
                          }}
                          textStyle={{ fontSize: 10, color: metalColor }}
                        >
                          {article.source.name}
                        </Chip>
                        <Text
                          style={{
                            color: theme.colors.text.disabled,
                            fontSize: 11,
                          }}
                        >
                          {formatTimeAgo(article.publishedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
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
  metalToggle: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 52,
    gap: 12,
  },
  metalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  metalTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 2,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    elevation: 2,
  },
  chartLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  chartStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  newsSection: {
    paddingHorizontal: 16,
  },
  newsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsCard: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
  },
  emptyNews: {
    borderRadius: 12,
  },
  newsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  newsImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  newsImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsContent: {
    flex: 1,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
});
