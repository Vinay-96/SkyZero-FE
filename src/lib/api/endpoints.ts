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
  // Product endpoints
  PRODUCT: {
    LIST: "/products",
    DETAILS: (id: string) => `/products/${id}`,
    CATEGORIES: "/products/categories",
  },
  // Order endpoints
  ORDER: {
    LIST: "/orders",
    DETAILS: (id: string) => `/orders/${id}`,
    HISTORY: "/orders/history",
  },
  // Dashboard endpoints
  DASHBOARD: {
    STATS: "/dashboard/stats",
    RECENT_ACTIVITY: "/dashboard/recent-activity",
    ANALYTICS: "/dashboard/analytics",
  },
} as const;
