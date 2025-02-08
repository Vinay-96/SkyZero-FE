import { API_VERSION } from "constants/constants.api";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    XTREAM_LOGIN: "/auth/x-tream",
  },
  // User endpoints
  USER: {
    LIST: "/users",
    DETAILS: (id: string) => `/users/${id}`,
    PREFERENCES: "/users/preferences",
  },
  // BULK-DEALS endpoints
  BULKDEALS: {
    LIST: `${API_VERSION}/bulktrades/group-share-by-transaction-type`,
    DETAILS: `${API_VERSION}/bulktrades/bulk-trade-insights`,
  },
  // BLOCK-DEALS endpoints
  BLOCKDEALS: {
    LIST: `${API_VERSION}/blocktrades/group-share-by-transaction-type`,
    DETAILS: `${API_VERSION}/blocktrades/block-trade-insights`,
  },
  // INSIDER-TRADES endpoints
  INSIDERTRADES: {
    LIST: `${API_VERSION}/insidertrading/group-by-acq-mode`,
    DETECT_MOVEMENTS: `${API_VERSION}/insidertrading/detect-significant-movements`,
    ANALYTICS: `${API_VERSION}/insidertrading/trading-insights`,
    RECENT_ACTIVITY: `${API_VERSION}/insidertrading/analyze-transaction`,
  },
  // SAST-TRADES endpoints
  SASTTRADES: {
    LIST: `${API_VERSION}/sasttrading/group-by-company-and-acquisition-mode`,
    RECENT_ACTIVITY: `${API_VERSION}/sasttrading/analyze-transaction`,
    ANALYTICS: `${API_VERSION}/sasttrading/recommended-moves`,
    RECOMMENDATION: `${API_VERSION}/sasttrading/high-probability-trades/recommended`,
    TOP_TRANSACTIONS: `${API_VERSION}/sasttrading/top-transactions`,
  },
  // BHAVCOPY endpoints
  BHAVCOPY: {
    CORP_ACTION: `${API_VERSION}/bhavcopy/corp-actions/corporate_action`,
    PRICE_HIT: `${API_VERSION}/bhavcopy/price-band-hit/price_band_hit`,
    GAINERS_AND_LOSERS: `${API_VERSION}/bhavcopy/gainer-losers/gainers_and_losers`,
    NEW_HIGH_LOW: `${API_VERSION}/bhavcopy/new-high-low/new_high_low`,
    TOP_25_TRADES: `${API_VERSION}/bhavcopy/top-25-by-traded-value/top_25_trades`,
    SME_TRADES: `${API_VERSION}/bhavcopy/sme-market-data/sme_trades`,

    EVENTS: `${API_VERSION}/calender/events/events/equities`,
  },
  // HEALTH
  HEALTH: {
    HEALTH: `${process.env.NEXT_PUBLIC_API_URL}/health`,
  },
  // Sockets
  SOCKET: {
    OPTION_ANALYTICS: `${API_VERSION}/socket/option-analytics`,
    OPTION_DEEPLYTICS: `${API_VERSION}/socket/option-deeplytics`,
    OPTION_CONTRARIAN: `${API_VERSION}/socket/option-contrarian-signals`,
    HISTORICAL_1M_CANDLE: `${API_VERSION}/socket/historic-1m-candle`,
    HISTORICAL_5M_CANDLE: `${API_VERSION}/socket/historic-5m-candle`,
    HISTORICAL_10M_CANDLE: `${API_VERSION}/socket/historic-10m-candle`,
    HISTORICAL_15M_CANDLE: `${API_VERSION}/socket/historic-15m-candle`,
    HISTORICAL_30M_CANDLE: `${API_VERSION}/socket/historic-30m-candle`,
    HISTORICAL_60M_CANDLE: `${API_VERSION}/socket/historic-60m-candle`,
    HISTORICAL_1D_CANDLE: `${API_VERSION}/socket/historic-1d-candle`,
  },
} as const;

