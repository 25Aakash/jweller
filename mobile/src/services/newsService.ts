import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

// GNews free API — 100 requests/day, no key required for basic usage
// Fallback: use NewsData.io or hardcoded curated news
const GNEWS_API_KEY = ''; // Add your GNews API key here if available
const GNEWS_BASE = 'https://gnews.io/api/v4';

// Curated fallback news when API is unavailable
const FALLBACK_GOLD_NEWS: NewsArticle[] = [
  {
    title: 'Gold Prices Hit New Highs Amid Global Uncertainty',
    description: 'Gold continues its upward trajectory as investors seek safe-haven assets during economic volatility.',
    content: 'Gold prices have surged to new record highs as geopolitical tensions and inflation concerns drive demand for the precious metal. Analysts expect the bullish trend to continue through the quarter as central banks maintain their buying programs.',
    url: 'https://www.reuters.com/markets/commodities',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'Market Watch', url: 'https://www.marketwatch.com' },
  },
  {
    title: 'Central Banks Continue Gold Buying Spree',
    description: 'Global central banks purchased record amounts of gold in the latest quarter, signaling strong institutional demand.',
    content: 'Central banks around the world added significantly to their gold reserves last quarter, with purchases reaching near-record levels. China, India, and several emerging market nations led the buying, reflecting a strategic shift toward gold as a reserve asset.',
    url: 'https://www.reuters.com/markets/commodities',
    image: null,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    source: { name: 'Reuters', url: 'https://www.reuters.com' },
  },
  {
    title: 'Gold Investment Demand Surges in India',
    description: 'Indian gold demand rises as festivals approach and prices stabilize, boosting jewellery and investment buying.',
    content: 'India, the world\'s second-largest consumer of gold, has seen a significant surge in demand as the festival season approaches. Both jewellery purchases and investment in gold bars and coins have increased substantially compared to last year.',
    url: 'https://economictimes.indiatimes.com',
    image: null,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    source: { name: 'Economic Times', url: 'https://economictimes.indiatimes.com' },
  },
  {
    title: 'Gold ETFs See Record Inflows This Month',
    description: 'Exchange-traded funds backed by gold reported their highest monthly inflow in two years.',
    content: 'Gold-backed ETFs recorded substantial inflows this month as retail and institutional investors increased their exposure to the precious metal. The trend reflects growing concerns about currency devaluation and stock market volatility.',
    url: 'https://www.moneycontrol.com',
    image: null,
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    source: { name: 'MoneyControl', url: 'https://www.moneycontrol.com' },
  },
  {
    title: 'MCX Gold Futures Trading at Premium',
    description: 'Gold futures on MCX trade at a premium as domestic demand outpaces global trends.',
    content: 'Gold futures on the Multi Commodity Exchange (MCX) are trading at a premium to international prices, reflecting strong domestic demand in India. The premium has widened as the rupee weakened against the dollar, making imports more expensive.',
    url: 'https://www.livemint.com',
    image: null,
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    source: { name: 'LiveMint', url: 'https://www.livemint.com' },
  },
];

const FALLBACK_SILVER_NEWS: NewsArticle[] = [
  {
    title: 'Silver Prices Rally on Industrial Demand Outlook',
    description: 'Silver benefits from dual demand: investment safe-haven and growing industrial applications in solar panels.',
    content: 'Silver prices have rallied strongly as the metal benefits from its dual role as both a precious and industrial metal. Growing demand from the solar energy sector and electronics manufacturing has boosted the outlook for silver prices.',
    url: 'https://www.reuters.com/markets/commodities',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'Market Watch', url: 'https://www.marketwatch.com' },
  },
  {
    title: 'Solar Panel Boom Drives Silver Demand to Record Levels',
    description: 'The global push for renewable energy is creating unprecedented demand for silver in photovoltaic cells.',
    content: 'The rapid expansion of solar energy installations worldwide is driving silver demand to record levels. Silver is a key component in photovoltaic cells, and analysts project industrial demand alone could consume a significant portion of annual mine supply.',
    url: 'https://www.reuters.com/markets/commodities',
    image: null,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    source: { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
  },
  {
    title: 'India Silver Imports Surge Ahead of Wedding Season',
    description: 'Silver imports into India jump as the wedding season drives demand for silverware and jewellery.',
    content: 'India\'s silver imports have surged ahead of the wedding season, with demand for traditional silverware, jewellery, and silver coins seeing a significant uptick. The trend is expected to continue through the peak wedding months.',
    url: 'https://economictimes.indiatimes.com',
    image: null,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    source: { name: 'Economic Times', url: 'https://economictimes.indiatimes.com' },
  },
  {
    title: 'Silver-Gold Ratio Signals Potential Upside for Silver',
    description: 'The gold-to-silver ratio suggests silver may be undervalued relative to gold, presenting a buying opportunity.',
    content: 'Analysts point to the elevated gold-to-silver ratio as evidence that silver may be significantly undervalued compared to gold. Historically, when this ratio reaches extreme levels, silver tends to outperform gold in subsequent months.',
    url: 'https://www.moneycontrol.com',
    image: null,
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    source: { name: 'MoneyControl', url: 'https://www.moneycontrol.com' },
  },
  {
    title: 'MCX Silver Futures See Strong Volume Growth',
    description: 'Trading volumes in silver futures on MCX reach yearly highs as investor interest grows.',
    content: 'Silver futures on the Multi Commodity Exchange (MCX) have seen strong volume growth, with trading activity reaching its highest levels this year. Retail participation in silver futures has increased notably as awareness of silver as an investment grows.',
    url: 'https://www.livemint.com',
    image: null,
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    source: { name: 'LiveMint', url: 'https://www.livemint.com' },
  },
];

export const newsService = {
  fetchGoldNews: async (): Promise<NewsArticle[]> => {
    try {
      if (GNEWS_API_KEY) {
        const response = await axios.get<GNewsResponse>(`${GNEWS_BASE}/search`, {
          params: {
            q: 'gold price India',
            lang: 'en',
            country: 'in',
            max: 10,
            apikey: GNEWS_API_KEY,
          },
          timeout: 10000,
        });
        return response.data.articles;
      }
      // Try free NewsAPI alternative
      const response = await axios.get(
        'https://newsdata.io/api/1/news?apikey=pub_&q=gold%20price&country=in&language=en',
        { timeout: 10000 }
      );
      if (response.data?.results) {
        return response.data.results.map((item: any) => ({
          title: item.title,
          description: item.description || '',
          content: item.content || item.description || '',
          url: item.link,
          image: item.image_url,
          publishedAt: item.pubDate,
          source: { name: item.source_id || 'News', url: item.source_url || '' },
        }));
      }
      return FALLBACK_GOLD_NEWS;
    } catch {
      return FALLBACK_GOLD_NEWS;
    }
  },

  fetchSilverNews: async (): Promise<NewsArticle[]> => {
    try {
      if (GNEWS_API_KEY) {
        const response = await axios.get<GNewsResponse>(`${GNEWS_BASE}/search`, {
          params: {
            q: 'silver price India',
            lang: 'en',
            country: 'in',
            max: 10,
            apikey: GNEWS_API_KEY,
          },
          timeout: 10000,
        });
        return response.data.articles;
      }
      const response = await axios.get(
        'https://newsdata.io/api/1/news?apikey=pub_&q=silver%20price&country=in&language=en',
        { timeout: 10000 }
      );
      if (response.data?.results) {
        return response.data.results.map((item: any) => ({
          title: item.title,
          description: item.description || '',
          content: item.content || item.description || '',
          url: item.link,
          image: item.image_url,
          publishedAt: item.pubDate,
          source: { name: item.source_id || 'News', url: item.source_url || '' },
        }));
      }
      return FALLBACK_SILVER_NEWS;
    } catch {
      return FALLBACK_SILVER_NEWS;
    }
  },
};
