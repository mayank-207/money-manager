import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import PaymentService from '../../services/paymentApis';

const PaytmAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setAuthStatus('error');
          setErrorMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code || !state) {
          setAuthStatus('error');
          setErrorMessage('Invalid callback parameters');
          return;
        }

        const paymentService = new PaymentService();
        const success = await paymentService.handlePaytmCallback(code, state);

        if (success) {
          setAuthStatus('success');
          // Redirect to transactions page after successful authentication
          setTimeout(() => {
            navigate('/transactions');
          }, 2000);
        } else {
          setAuthStatus('error');
          setErrorMessage('Failed to complete authentication');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setAuthStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  if (authStatus === 'processing') {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <Loader2 size={48} className="animate-spin text-[#0A84FF] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">
            Completing Authentication
          </h2>
          <p className="text-[#86868B]">
            Please wait while we complete your Paytm authentication...
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <CheckCircle size={48} className="text-[#30D158] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">
            Authentication Successful!
          </h2>
          <p className="text-[#86868B] mb-4">
            You have successfully connected your Paytm account.
          </p>
          <p className="text-sm text-[#86868B]">
            Redirecting to transactions page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
        <XCircle size={48} className="text-[#FF453A] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1D1D1F] mb-2">
          Authentication Failed
        </h2>
        <p className="text-[#86868B] mb-4">
          {errorMessage}
        </p>
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 bg-[#0A84FF] text-white rounded-lg hover:bg-[#0A84FF]/90 transition-colors"
        >
          Go Back to Transactions
        </button>
      </div>
    </div>
  );
};

export default PaytmAuthCallback;
