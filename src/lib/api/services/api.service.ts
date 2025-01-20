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
    login: (credentials: LoginCredentials) =>
      api.post<{ user: User; token: string }>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      ),

    register: (data: RegisterData) =>
      api.post<{ user: User }>(API_ENDPOINTS.AUTH.REGISTER, data),

    getProfile: () => api.get<User>(API_ENDPOINTS.AUTH.PROFILE),
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
};

