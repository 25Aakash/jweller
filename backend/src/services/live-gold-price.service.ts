import axios from 'axios';
import logger from '../utils/logger';

/**
 * Live gold price fetcher
 * Fetches real-time gold price from free public APIs
 * Price is for 24K gold per gram in INR
 */

// In-memory cache to avoid hammering the API
let cachedPrice: { price: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache for 5 minutes

/**
 * Fetch live gold price per gram in INR from GoldAPI.io (free tier)
 * Falls back to metals.dev API, then to Gold Price India scraping
 */
export const fetchLiveGoldPrice = async (): Promise<number> => {
    // Return cached price if still fresh
    if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION_MS) {
        logger.info(`Returning cached gold price: ₹${cachedPrice.price}/gram`);
        return cachedPrice.price;
    }

    // Try multiple sources in order (IBJA is most reliable for India)
    const fetchers = [
        fetchFromIBJA,
        fetchFromMetalPriceAPI,
        fetchFromGoldPriceIndia,
        fetchFromExchangeRate,
    ];

    for (const fetcher of fetchers) {
        try {
            const price = await fetcher();
            if (price && price > 0) {
                cachedPrice = { price, timestamp: Date.now() };
                logger.info(`Live gold price fetched: ₹${price}/gram`);
                return price;
            }
        } catch (error) {
            logger.warn(`Gold price fetcher failed, trying next source...`);
        }
    }

    // If all sources fail, return cached price even if stale
    if (cachedPrice) {
        logger.warn(`All live sources failed, using stale cached price: ₹${cachedPrice.price}/gram`);
        return cachedPrice.price;
    }

    throw new Error('Unable to fetch live gold price from any source');
};

/**
 * Source 1: IBJA (India Bullion & Jewellers Association) via metals.dev
 * Official gold rates for India, already in grams and INR
 */
async function fetchFromIBJA(): Promise<number> {
    const apiKey = process.env.METALS_DEV_API_KEY;
    if (!apiKey) throw new Error('METALS_DEV_API_KEY not configured');

    const response = await axios.get(
        `https://api.metals.dev/v1/metal/authority?api_key=${apiKey}&authority=ibja&currency=INR&unit=g`,
        { timeout: 10000 }
    );

    if (response.data?.rates?.ibja_gold) {
        const pricePerGram = response.data.rates.ibja_gold;
        logger.info(`IBJA gold price: ₹${pricePerGram}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from IBJA API');
}

/**
 * Source 2: metals.dev free API (no API key needed, 24K gold in INR)
 */
async function fetchFromMetalPriceAPI(): Promise<number> {
    const apiKey = process.env.METALS_DEV_API_KEY;
    if (!apiKey) throw new Error('METALS_DEV_API_KEY not configured');

    const response = await axios.get(
        `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=INR&unit=gram`,
        { timeout: 10000 }
    );

    if (response.data?.metals?.gold) {
        const pricePerGram = response.data.metals.gold;
        logger.info(`metals.dev gold price: ₹${pricePerGram}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from metals.dev');
}

/**
 * Source 3: Gold Price India via public JSON endpoint  
 */
async function fetchFromGoldPriceIndia(): Promise<number> {
    // Use frankfurter for XAU -> INR conversion
    // 1 troy ounce = 31.1035 grams
    const response = await axios.get(
        'https://data-asg.goldprice.org/dbXRates/INR',
        {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        }
    );

    if (response.data?.items?.[0]?.xauPrice) {
        const pricePerOunce = response.data.items[0].xauPrice;
        const pricePerGram = pricePerOunce / 31.1035;
        logger.info(`goldprice.org gold price: ₹${pricePerGram.toFixed(2)}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from goldprice.org');
}

/**
 * Source 4: Convert XAU/USD via exchange rates
 * Uses free forex API to get gold price in USD, then convert to INR
 */
async function fetchFromExchangeRate(): Promise<number> {
    // Get gold price in USD per ounce from a free source
    const goldResponse = await axios.get(
        'https://api.frankfurter.app/latest?from=XAU&to=USD',
        { timeout: 10000 }
    );

    // Get USD to INR rate
    const forexResponse = await axios.get(
        'https://api.frankfurter.app/latest?from=USD&to=INR',
        { timeout: 10000 }
    );

    if (goldResponse.data?.rates?.USD && forexResponse.data?.rates?.INR) {
        const goldUsdPerOunce = goldResponse.data.rates.USD;
        const usdToInr = forexResponse.data.rates.INR;
        const pricePerGram = (goldUsdPerOunce * usdToInr) / 31.1035;
        logger.info(`Exchange rate gold price: ₹${pricePerGram.toFixed(2)}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from exchange rate API');
}

/**
 * Get cached price without making an API call
 */
export const getCachedPrice = (): number | null => {
    return cachedPrice?.price ?? null;
};

/**
 * Clear the price cache (useful for testing)
 */
export const clearCache = (): void => {
    cachedPrice = null;
};
