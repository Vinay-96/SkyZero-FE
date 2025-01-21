export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
  },
  // User endpoints
  USER: {
    LIST: "/users",
    DETAILS: (id: string) => `/users/${id}`,
    PREFERENCES: "/users/preferences",
  },
  // BULK-DEALS endpoints
  BULKDEALS: {
    LIST: `${process.env.API_VERSION}/bulktrades/group-share-by-transaction-type/bulk_data`,
    DETAILS: `${process.env.API_VERSION}/bulktrades/bulk-trade-insights/bulk_data`,
  },
  // BLOCK-DEALS endpoints
  BLOCKDEALS: {
    LIST: `${process.env.API_VERSION}/blocktrades/group-share-by-transaction-type/block_data`,
    DETAILS: `${process.env.API_VERSION}/blocktrades/block-trade-insights/block_data`,
  },
  // INSIDER-TRADES endpoints
  INSIDERTRADES: {
    LIST: `${process.env.API_VERSION}/insidertrading/group-by-acq-mode/insider_data`,
    DETECT_MOMENTS: `${process.env.API_VERSION}/insidertrading/detect-significant-movements/insider_data`,
    ANALYTICS: `${process.env.API_VERSION}/insidertrading/trading-insights/insider_data`,
    RECENT_ACTIVITY: `${process.env.API_VERSION}/insidertrading/analyze-transaction/insider_data`,
  },
  // SAST-TRADES endpoints
  SASTTRADES: {
    LIST: `${process.env.API_VERSION}/sasttrading/group-by-company-and-acquisition-mode/SAST_data`,
    TOP_TRANSACTIONS: `${process.env.API_VERSION}/sasttrading/top-transactions/SAST_data`,
    ANALYTICS: `${process.env.API_VERSION}/sasttrading/recommended-moves/SAST_data`,
    RECENT_ACTIVITY: `${process.env.API_VERSION}/sasttrading/analyze-transaction/SAST_data`,
    RECOMMENDATION: `${process.env.API_VERSION}/sasttrading/high-probability-trades/recommended/SAST_data`,
  },
  // BHAVCOPY endpoints
  BHAVCOPY: {
    CORP_ACTION: `${process.env.API_VERSION}/bhavcopy/corp-actions/corporate_action`,
    PRICE_HIT: `${process.env.API_VERSION}/bhavcopy/price-band-hit/price_band_hit`,
    GAINERS_AND_LOSERS: `${process.env.API_VERSION}/bhavcopy/gainer-losers/gainers_and_losers`,
    NEW_HIGH_LOW: `${process.env.API_VERSION}/bhavcopy/new-high-low/new_high_low`,
    TOP_25_TRADES: `${process.env.API_VERSION}/bhavcopy/top-25-by-traded-value/top_25_trades`,
    SME_TRADES: `${process.env.API_VERSION}/bhavcopy/sme-market-data/sme_trades`,

    EVENTS: `${process.env.API_VERSION}/calender/events/events/equities`,
  },
  // HEALTH
  HEALTH: {
    HEALTH: `${process.env.NEXT_PUBLIC_API_URL}/health`,
  },
} as const;

