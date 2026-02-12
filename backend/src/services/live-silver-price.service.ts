import axios from 'axios';
import logger from '../utils/logger';
import { fetchMCXSilverPrice } from './live-mcx-price.service';

/**
 * Live silver price fetcher
 * Primary: MCX authority API (shared fetcher for gold + silver)
 * Fallbacks: goldprice.org (XAG), exchange rate conversion
 * Price is per gram in INR
 */

let fallbackCachedPrice: { price: number; timestamp: number } | null = null;

/**
 * Fetch live silver price per gram in INR
 * MCX is the primary source, other APIs are fallbacks only
 */
export const fetchLiveSilverPrice = async (): Promise<number> => {
    // Try MCX first (has its own caching)
    try {
        const price = await fetchMCXSilverPrice();
        if (price && price > 0) {
            fallbackCachedPrice = { price, timestamp: Date.now() };
            return price;
        }
    } catch (error) {
        logger.warn('MCX silver price failed, trying fallback sources...');
    }

    // Fallbacks
    const fallbacks = [
        fetchFromSilverPriceOrg,
        fetchFromExchangeRate,
    ];

    for (const fetcher of fallbacks) {
        try {
            const price = await fetcher();
            if (price && price > 0) {
                fallbackCachedPrice = { price, timestamp: Date.now() };
                logger.info(`Fallback silver price fetched: ₹${price}/gram`);
                return price;
            }
        } catch (error) {
            logger.warn(`Silver price fallback failed, trying next...`);
        }
    }

    if (fallbackCachedPrice) {
        logger.warn(`All sources failed, using stale cached silver price: ₹${fallbackCachedPrice.price}/gram`);
        return fallbackCachedPrice.price;
    }

    throw new Error('Unable to fetch live silver price from any source');
};

/**
 * Fallback 1: Silver price via goldprice.org (XAG)
 */
async function fetchFromSilverPriceOrg(): Promise<number> {
    const response = await axios.get(
        'https://data-asg.goldprice.org/dbXRates/INR',
        {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' },
        }
    );

    if (response.data?.items?.[0]?.xagPrice) {
        const pricePerOunce = response.data.items[0].xagPrice;
        const pricePerGram = pricePerOunce / 31.1035;
        logger.info(`goldprice.org silver price: ₹${pricePerGram.toFixed(2)}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from goldprice.org for silver');
}

/**
 * Fallback 2: Convert XAG/USD via exchange rates
 */
async function fetchFromExchangeRate(): Promise<number> {
    const silverResponse = await axios.get(
        'https://api.frankfurter.app/latest?from=XAG&to=USD',
        { timeout: 10000 }
    );

    const forexResponse = await axios.get(
        'https://api.frankfurter.app/latest?from=USD&to=INR',
        { timeout: 10000 }
    );

    if (silverResponse.data?.rates?.USD && forexResponse.data?.rates?.INR) {
        const silverUsdPerOunce = silverResponse.data.rates.USD;
        const usdToInr = forexResponse.data.rates.INR;
        const pricePerGram = (silverUsdPerOunce * usdToInr) / 31.1035;
        logger.info(`Exchange rate silver price: ₹${pricePerGram.toFixed(2)}/gram`);
        return Math.round(pricePerGram * 100) / 100;
    }
    throw new Error('Invalid response from exchange rate API for silver');
}

/**
 * Get cached price without API call
 */
export const getCachedSilverPrice = (): number | null => {
    return fallbackCachedPrice?.price ?? null;
};

/**
 * Clear cache
 */
export const clearSilverCache = (): void => {
    fallbackCachedPrice = null;
};
