export interface User {
  id: string;
  name: string;
  email: string;
  userName?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  userName: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  email: string;
  password: string;
  profilePicture?: File;
}

export interface DashboardData {
  historical?: any;
  [key: string]: any;
}

export interface Transaction {
  id: string;
  company: string;
  symbol: string;
  quantity: string;
  price: string;
  value: string;
  date: string;
  type: 'buy' | 'sell';
  [key: string]: any;
}

export interface CompanyData {
  Buy: Transaction[];
  Sell: Transaction[];
  Both: Transaction[];
}

export interface PotentialSignal {
  id: string;
  company: string;
  symbol: string;
  signal: string;
  confidence: number;
  description: string;
  type: "buy" | "sell";
}

export interface CompanyInsights {
  company: string;
  totalTransactions: number;
  buyTransactions: number;
  sellTransactions: number;
  netValue: string;
  averagePrice: string;
  insights: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
}
