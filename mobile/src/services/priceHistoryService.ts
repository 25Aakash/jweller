import { goldAPI, silverAPI } from '../api/endpoints';

export interface PricePoint {
  date: string;
  price: number;
  label: string;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

/**
 * Generate realistic price history data based on current live price.
 * Uses a random-walk model seeded from the current price to simulate historical data.
 */
function generatePriceHistory(
  currentPrice: number,
  range: TimeRange,
  volatility: number = 0.005
): PricePoint[] {
  const now = new Date();
  let points: number;
  let intervalMs: number;

  switch (range) {
    case '1D':
      points = 24;
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case '1W':
      points = 7;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1M':
      points = 30;
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case '3M':
      points = 12;
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case '6M':
      points = 24;
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '1Y':
      points = 12;
      intervalMs = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
  }

  // Walk backwards from current price
  const prices: number[] = [currentPrice];
  for (let i = 1; i < points; i++) {
    const prevPrice = prices[i - 1];
    const change = prevPrice * volatility * (Math.random() * 2 - 1.2); // slight downward bias going back
    prices.push(Math.max(prevPrice + change, currentPrice * 0.85));
  }
  prices.reverse();

  const result: PricePoint[] = prices.map((price, index) => {
    const date = new Date(now.getTime() - (points - 1 - index) * intervalMs);
    let label: string;

    switch (range) {
      case '1D':
        label = `${date.getHours()}:00`;
        break;
      case '1W':
        label = date.toLocaleDateString('en-IN', { weekday: 'short' });
        break;
      case '1M':
      case '3M':
      case '6M':
        label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        break;
      case '1Y':
        label = date.toLocaleDateString('en-IN', { month: 'short' });
        break;
    }

    return {
      date: date.toISOString(),
      price: Math.round(price * 100) / 100,
      label,
    };
  });

  return result;
}

export const priceHistoryService = {
  getGoldPriceHistory: async (range: TimeRange): Promise<PricePoint[]> => {
    try {
      const priceData = await goldAPI.getCurrentPrice();
      const currentPrice = priceData?.final_price || 7200;
      return generatePriceHistory(currentPrice, range, 0.004);
    } catch {
      return generatePriceHistory(7200, range, 0.004);
    }
  },

  getSilverPriceHistory: async (range: TimeRange): Promise<PricePoint[]> => {
    try {
      const priceData = await silverAPI.getCurrentPrice();
      const currentPrice = priceData?.final_price || 85;
      return generatePriceHistory(currentPrice, range, 0.006);
    } catch {
      return generatePriceHistory(85, range, 0.006);
    }
  },
};
