import axios from 'axios';

// Paytm API Configuration
const PAYTM_CONFIG = {
  baseURL: process.env.REACT_APP_PAYTM_API_URL || 'https://api.paytm.com',
  clientId: process.env.REACT_APP_PAYTM_CLIENT_ID,
  redirectUri: process.env.REACT_APP_PAYTM_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  scope: 'read_transactions read_profile',
};

// BHIM API Configuration
const BHIM_CONFIG = {
  baseURL: process.env.REACT_APP_BHIM_API_URL || 'https://api.bhimupi.org.in',
  appId: process.env.REACT_APP_BHIM_APP_ID,
  appSecret: process.env.REACT_APP_BHIM_APP_SECRET,
};

// Transaction mapping interface
export interface PaymentTransaction {
  transactionId: string;
  amount: number;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  category: string;
  paymentMethod: 'paytm' | 'bhim';
  merchantName?: string;
  upiId?: string;
}

// User authentication interface
export interface PaytmUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

// Paytm API Service with User Authentication
export class PaytmService {
  private static instance: PaytmService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userInfo: PaytmUser | null = null;

  static getInstance(): PaytmService {
    if (!PaytmService.instance) {
      PaytmService.instance = new PaytmService();
    }
    return PaytmService.instance;
  }

  // Initialize OAuth flow
  initiateAuth(): void {
    const authUrl = `${PAYTM_CONFIG.baseURL}/oauth/authorize?` +
      `client_id=${PAYTM_CONFIG.clientId}&` +
      `redirect_uri=${encodeURIComponent(PAYTM_CONFIG.redirectUri)}&` +
      `scope=${encodeURIComponent(PAYTM_CONFIG.scope)}&` +
      `response_type=code&` +
      `state=${this.generateState()}`;

    // Store state for verification
    localStorage.setItem('paytm_auth_state', this.generateState());
    
    // Redirect to Paytm authorization page
    window.location.href = authUrl;
  }

  // Handle OAuth callback
  async handleAuthCallback(code: string, state: string): Promise<boolean> {
    try {
      // Verify state parameter
      const storedState = localStorage.getItem('paytm_auth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Exchange authorization code for tokens
      const response = await axios.post(`${PAYTM_CONFIG.baseURL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: PAYTM_CONFIG.clientId,
        code: code,
        redirect_uri: PAYTM_CONFIG.redirectUri,
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      // Store tokens securely
      if (this.accessToken) {
        localStorage.setItem('paytm_access_token', this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem('paytm_refresh_token', this.refreshToken);
      }

      // Fetch user profile
      await this.fetchUserProfile();

      return true;
    } catch (error) {
      console.error('Paytm authentication callback failed:', error);
      return false;
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await axios.post(`${PAYTM_CONFIG.baseURL}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: PAYTM_CONFIG.clientId,
        refresh_token: this.refreshToken,
      });

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      // Update stored tokens
      if (this.accessToken) {
        localStorage.setItem('paytm_access_token', this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem('paytm_refresh_token', this.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Failed to refresh Paytm access token:', error);
      // Clear invalid tokens
      this.clearTokens();
      return false;
    }
  }

  // Fetch user profile
  async fetchUserProfile(): Promise<PaytmUser | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await axios.get(`${PAYTM_CONFIG.baseURL}/v2/user/profile`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      this.userInfo = response.data;
      localStorage.setItem('paytm_user_info', JSON.stringify(this.userInfo));
      return this.userInfo;
    } catch (error) {
      console.error('Failed to fetch Paytm user profile:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Get current user info
  getCurrentUser(): PaytmUser | null {
    return this.userInfo;
  }

  // Load stored authentication data
  loadStoredAuth(): void {
    const accessToken = localStorage.getItem('paytm_access_token');
    const refreshToken = localStorage.getItem('paytm_refresh_token');
    const userInfo = localStorage.getItem('paytm_user_info');

    if (accessToken && refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo);
      }
    }
  }

  // Clear authentication data
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.userInfo = null;
    
    localStorage.removeItem('paytm_access_token');
    localStorage.removeItem('paytm_refresh_token');
    localStorage.removeItem('paytm_user_info');
    localStorage.removeItem('paytm_auth_state');
  }

  // Logout user
  logout(): void {
    this.clearTokens();
    
    // Redirect to Paytm logout if needed
    const logoutUrl = `${PAYTM_CONFIG.baseURL}/oauth/logout?` +
      `client_id=${PAYTM_CONFIG.clientId}&` +
      `redirect_uri=${encodeURIComponent(PAYTM_CONFIG.redirectUri)}`;
    
    window.location.href = logoutUrl;
  }

  async getTransactions(
    startDate: string,
    endDate: string
  ): Promise<PaymentTransaction[]> {
    if (!this.accessToken) {
      throw new Error('User not authenticated. Please login first.');
    }

    try {
      const response = await axios.get(
        `${PAYTM_CONFIG.baseURL}/v2/user/transactions`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );

      return this.mapPaytmTransactions(response.data.transactions || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request
          return this.getTransactions(startDate, endDate);
        } else {
          // Refresh failed, user needs to re-authenticate
          this.clearTokens();
          throw new Error('Authentication expired. Please login again.');
        }
      }
      
      console.error('Failed to fetch Paytm transactions:', error);
      throw error;
    }
  }

  private mapPaytmTransactions(transactions: any[]): PaymentTransaction[] {
    return transactions.map((txn) => ({
      transactionId: txn.txn_id,
      amount: parseFloat(txn.amount),
      date: txn.txn_date,
      description: txn.txn_note || txn.merchant_name || 'Paytm Transaction',
      type: txn.txn_type === 'CREDIT' ? 'credit' : 'debit',
      category: this.categorizePaytmTransaction(txn),
      paymentMethod: 'paytm',
      merchantName: txn.merchant_name,
    }));
  }

  private categorizePaytmTransaction(txn: any): string {
    const description = (txn.txn_note || '').toLowerCase();
    const merchant = (txn.merchant_name || '').toLowerCase();

    if (description.includes('food') || merchant.includes('restaurant') || merchant.includes('zomato') || merchant.includes('swiggy')) {
      return 'Food & Dining';
    }
    if (description.includes('uber') || description.includes('ola') || merchant.includes('transport')) {
      return 'Transportation';
    }
    if (description.includes('rent') || description.includes('housing') || merchant.includes('pg')) {
      return 'Housing';
    }
    if (description.includes('shopping') || merchant.includes('amazon') || merchant.includes('flipkart')) {
      return 'Shopping';
    }
    if (description.includes('medical') || merchant.includes('pharmacy') || merchant.includes('hospital')) {
      return 'Healthcare';
    }
    if (description.includes('entertainment') || merchant.includes('movie') || merchant.includes('netflix')) {
      return 'Entertainment';
    }
    
    return 'Other';
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// BHIM API Service
export class BHIMService {
  private static instance: BHIMService;
  private accessToken: string | null = null;

  static getInstance(): BHIMService {
    if (!BHIMService.instance) {
      BHIMService.instance = new BHIMService();
    }
    return BHIMService.instance;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await axios.post(`${BHIM_CONFIG.baseURL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: BHIM_CONFIG.appId,
        client_secret: BHIM_CONFIG.appSecret,
      });

      this.accessToken = response.data.access_token;
      return true;
    } catch (error) {
      console.error('BHIM authentication failed:', error);
      return false;
    }
  }

  async getTransactions(
    startDate: string,
    endDate: string,
    upiId?: string
  ): Promise<PaymentTransaction[]> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('BHIM authentication failed');
      }
    }

    try {
      const response = await axios.get(
        `${BHIM_CONFIG.baseURL}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params: {
            start_date: startDate,
            end_date: endDate,
            upi_id: upiId,
          },
        }
      );

      return this.mapBHIMTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch BHIM transactions:', error);
      throw error;
    }
  }

  private mapBHIMTransactions(transactions: any[]): PaymentTransaction[] {
    return transactions.map((txn) => ({
      transactionId: txn.reference_id,
      amount: parseFloat(txn.amount),
      date: txn.timestamp,
      description: txn.remarks || txn.payee_name || 'BHIM Transaction',
      type: txn.transaction_type === 'CREDIT' ? 'credit' : 'debit',
      category: this.categorizeBHIMTransaction(txn),
      paymentMethod: 'bhim',
      upiId: txn.upi_id,
    }));
  }

  private categorizeBHIMTransaction(txn: any): string {
    const description = (txn.remarks || '').toLowerCase();
    const payee = (txn.payee_name || '').toLowerCase();

    if (description.includes('food') || payee.includes('restaurant') || payee.includes('zomato') || payee.includes('swiggy')) {
      return 'Food & Dining';
    }
    if (description.includes('uber') || description.includes('ola') || payee.includes('transport')) {
      return 'Transportation';
    }
    if (description.includes('rent') || payee.includes('housing') || payee.includes('pg')) {
      return 'Housing';
    }
    if (description.includes('shopping') || payee.includes('amazon') || payee.includes('flipkart')) {
      return 'Shopping';
    }
    if (description.includes('medical') || payee.includes('pharmacy') || payee.includes('hospital')) {
      return 'Healthcare';
    }
    if (description.includes('entertainment') || payee.includes('movie') || payee.includes('netflix')) {
      return 'Entertainment';
    }
    
    return 'Other';
  }
}

// Combined Payment Service
export class PaymentService {
  private paytmService: PaytmService;
  private bhimService: BHIMService;

  constructor() {
    this.paytmService = PaytmService.getInstance();
    this.bhimService = BHIMService.getInstance();
    
    // Load stored authentication data
    this.paytmService.loadStoredAuth();
  }

  // Paytm authentication methods
  initiatePaytmAuth(): void {
    this.paytmService.initiateAuth();
  }

  async handlePaytmCallback(code: string, state: string): Promise<boolean> {
    return this.paytmService.handleAuthCallback(code, state);
  }

  isPaytmAuthenticated(): boolean {
    return this.paytmService.isAuthenticated();
  }

  getPaytmUser(): PaytmUser | null {
    return this.paytmService.getCurrentUser();
  }

  logoutPaytm(): void {
    this.paytmService.logout();
  }

  async syncAllTransactions(
    startDate: string,
    endDate: string
  ): Promise<PaymentTransaction[]> {
    try {
      const [paytmTransactions, bhimTransactions] = await Promise.allSettled([
        this.paytmService.isAuthenticated() 
          ? this.paytmService.getTransactions(startDate, endDate)
          : Promise.resolve([]),
        this.bhimService.getTransactions(startDate, endDate),
      ]);

      const allTransactions: PaymentTransaction[] = [];

      if (paytmTransactions.status === 'fulfilled') {
        allTransactions.push(...paytmTransactions.value);
      }

      if (bhimTransactions.status === 'fulfilled') {
        allTransactions.push(...bhimTransactions.value);
      }

      // Sort by date (newest first)
      return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      throw error;
    }
  }

  async syncRecentTransactions(days: number = 7): Promise<PaymentTransaction[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.syncAllTransactions(startDate, endDate);
  }
}

export default PaymentService;
