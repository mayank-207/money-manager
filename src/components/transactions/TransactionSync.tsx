import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings, AlertCircle, CheckCircle, XCircle, Loader2, LogIn, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import PaymentService, { PaymentTransaction, PaytmUser } from '../../services/paymentApis';

interface TransactionSyncProps {
  onTransactionsSynced: (transactions: PaymentTransaction[]) => void;
  onSyncError: (error: string) => void;
}

const TransactionSync: React.FC<TransactionSyncProps> = ({ 
  onTransactionsSynced, 
  onSyncError 
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration state
  const [bhimUpiId, setBhimUpiId] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30); // minutes

  const paymentService = new PaymentService();
  const [paytmUser, setPaytmUser] = useState<PaytmUser | null>(null);
  const [isPaytmAuthenticated, setIsPaytmAuthenticated] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('paymentSyncConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setBhimUpiId(config.bhimUpiId || '');
      setAutoSync(config.autoSync || false);
      setSyncInterval(config.syncInterval || 30);
    }

    // Load last sync time
    const savedLastSync = localStorage.getItem('lastTransactionSync');
    if (savedLastSync) {
      setLastSyncTime(savedLastSync);
    }
  }, []);

  useEffect(() => {
    // Save configuration
    const config = {
      bhimUpiId,
      autoSync,
      syncInterval,
    };
    localStorage.setItem('paymentSyncConfig', JSON.stringify(config));

    // Set up auto-sync if enabled
    if (autoSync) {
      const interval = setInterval(() => {
        handleSync();
      }, syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [bhimUpiId, autoSync, syncInterval]);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('syncing');
    setErrorMessage('');

    try {
      // Validate configuration
      if (!isPaytmAuthenticated && !bhimUpiId) {
        throw new Error('Please connect at least one payment method (Paytm account or BHIM UPI ID)');
      }

      const transactions = await paymentService.syncRecentTransactions(7); // Last 7 days
      
      if (transactions.length > 0) {
        onTransactionsSynced(transactions);
        setSyncStatus('success');
        setLastSyncTime(new Date().toISOString());
        localStorage.setItem('lastTransactionSync', new Date().toISOString());
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('success');
        setErrorMessage('No new transactions found');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sync transactions');
      onSyncError(error instanceof Error ? error.message : 'Failed to sync transactions');
    } finally {
      setIsSyncing(false);
    }
  };

  const checkPaytmAuthStatus = () => {
    const authenticated = paymentService.isPaytmAuthenticated();
    const user = paymentService.getPaytmUser();
    
    setIsPaytmAuthenticated(authenticated);
    setPaytmUser(user);
  };

  const handlePaytmLogin = () => {
    paymentService.initiatePaytmAuth();
  };

  const handlePaytmLogout = () => {
    paymentService.logoutPaytm();
    setPaytmUser(null);
    setIsPaytmAuthenticated(false);
  };

  const handleManualSync = () => {
    handleSync();
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E5EA] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1D1D1F]">Payment Sync</h3>
          <p className="text-sm text-[#86868B]">
            Automatically sync transactions from Paytm and BHIM
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2"
        >
          <Settings size={16} />
          <span>Settings</span>
        </Button>
      </div>

      {/* Paytm Authentication Status */}
      <div className="bg-[#F5F5F7] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">P</span>
            </div>
            <div>
              <h4 className="font-medium text-[#1D1D1F]">Paytm Account</h4>
              {isPaytmAuthenticated && paytmUser ? (
                <p className="text-sm text-[#86868B]">
                  Connected as {paytmUser.name} ({paytmUser.phone})
                </p>
              ) : (
                <p className="text-sm text-[#86868B]">Not connected</p>
              )}
            </div>
          </div>
          
          {isPaytmAuthenticated ? (
            <Button
              variant="outline"
              onClick={handlePaytmLogout}
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut size={16} />
              <span>Disconnect</span>
            </Button>
          ) : (
            <Button
              onClick={handlePaytmLogin}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <LogIn size={16} />
              <span>Connect Paytm</span>
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[#F5F5F7] rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-[#1D1D1F]">Payment Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
              BHIM UPI ID (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter BHIM UPI ID for additional transactions"
              value={bhimUpiId}
              onChange={(e) => setBhimUpiId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF]"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded border-[#E5E5EA] text-[#0A84FF] focus:ring-[#0A84FF]"
              />
              <span className="text-sm text-[#1D1D1F]">Enable auto-sync</span>
            </label>
            
            {autoSync && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#1D1D1F]">Every</span>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  className="px-2 py-1 border border-[#E5E5EA] rounded text-sm"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={1440}>1 day</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sync Status and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleManualSync}
            disabled={isSyncing || (!isPaytmAuthenticated && !bhimUpiId)}
            className="flex items-center space-x-2"
          >
            {isSyncing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </Button>

          {lastSyncTime && (
            <div className="text-sm text-[#86868B]">
              Last sync: {formatLastSync(lastSyncTime)}
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          {syncStatus === 'syncing' && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}
          
          {syncStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm">Sync successful</span>
            </div>
          )}
          
          {syncStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle size={16} />
              <span className="text-sm">Sync failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-sm text-red-600">{errorMessage}</span>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 text-xs">
              <li>• Connect your Paytm account using the button above</li>
              <li>• Optionally add your BHIM UPI ID for additional transactions</li>
              <li>• Transactions are automatically categorized based on merchant names and descriptions</li>
              <li>• Sync happens every 7 days by default, or customize the interval</li>
              <li>• Only new transactions are imported to avoid duplicates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSync;
