import api from "../config";
import { API_ENDPOINTS } from "../endpoints";
import type {
  User,
  // LoginCredentials,
  // RegisterData
} from "../../../types";
import { useAuthStore } from "@/lib/zustand/store";

export const apiService = {
  // Auth services
  auth: {
    login: async (credentials: LoginCredentials) =>
      api.post<{ user: User; token: string }>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      ),

    register: async (data: RegisterData) =>
      api.post<{ user: User }>(API_ENDPOINTS.AUTH.REGISTER, data),

    getProfile: async () => api.get<User>(API_ENDPOINTS.AUTH.PROFILE),

    xtreamLogin: async (credentials: LoginCredentials) =>
      api.post<{ user: User; token: string }>(
        API_ENDPOINTS.AUTH.XTREAM_LOGIN,
        credentials
      ),
  },

  // User services
  users: {
    getAll: async () => {
      const response = await api.get(API_ENDPOINTS.USER.LIST);
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get(API_ENDPOINTS.USER.DETAILS(id));
      return response.data;
    },
  },

  // Bulk trades
  bulkDeals: {
    getAll: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.BULKDEALS.LIST}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getDetails: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.BULKDEALS.DETAILS}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
  },

  // Block trades
  blockDeals: {
    getAll: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.BLOCKDEALS.LIST}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getDetails: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.BLOCKDEALS.DETAILS}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
  },

  // Insider trades
  insiderDeals: {
    getAll: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.INSIDERTRADES.LIST}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getRecentActivity: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.INSIDERTRADES.RECENT_ACTIVITY}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getMovements: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.INSIDERTRADES.DETECT_MOVEMENTS}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getAnalytics: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.INSIDERTRADES.ANALYTICS}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
  },

  // SAST trades
  sastDeals: {
    getAll: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.SASTTRADES.LIST}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getRecentActivity: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.SASTTRADES.RECENT_ACTIVITY}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getRecommendation: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.SASTTRADES.ANALYTICS}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getAnalytics: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.SASTTRADES.RECOMMENDATION}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
    getTopTransactions: async (timeFrame: string, params: string) => {
      const response = await api.get(
        `${API_ENDPOINTS.SASTTRADES.TOP_TRANSACTIONS}/${params}?timeframe=${timeFrame}`
      );
      return response.data;
    },
  },

  // Health trades
  health: {
    getApplicationHealth: async () => {
      const response = await api.get(`${API_ENDPOINTS.HEALTH.HEALTH}`);
      return response.data;
    },
  },

  // Socket data
  socket: {
    getRecentOptionAnalytics: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.OPTION_ANALYTICS}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getRecentOptionDeeplytics: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.OPTION_DEEPLYTICS}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical1mCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_1M_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical5mCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_5M_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical10mCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_10M_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical15mCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_15M_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical30mCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_30M_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical60mCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_60M_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getHistorical1dCandle: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.HISTORICAL_1D_CANDLE}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
    getRecentOptionContrarianSignals: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.SOCKET.OPTION_CONTRARIAN}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      return response.data;
    },
  },
};

