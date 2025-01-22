import api from "../config";
import { API_ENDPOINTS } from "../endpoints";
import type {
  User,
  // LoginCredentials,
  // RegisterData
} from "../../../types";

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
    getAll: async () => {
      const response = await api.get(API_ENDPOINTS.BLOCKDEALS.LIST);
      return response.data;
    },
    getDetails: async () => {
      const response = await api.get(API_ENDPOINTS.BLOCKDEALS.DETAILS);
      return response.data;
    },
  },
};

