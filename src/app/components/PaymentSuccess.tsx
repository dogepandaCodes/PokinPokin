import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Coins } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function PaymentSuccess() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [coins, setCoins] = useState<number>(0);

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/verify-payment/${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setCoins(data.coins);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support.
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 my-6">
          <p className="text-sm text-purple-600 mb-2">You received</p>
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-purple-600" />
            <span className="text-4xl font-bold text-purple-700">+{coins}</span>
            <span className="text-lg text-purple-600">coins</span>
          </div>
        </div>
        
        <Button 
          onClick={() => window.location.href = '/'} 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500"
          size="lg"
        >
          Start Playing! 🎮
        </Button>
      </div>
    </div>
  );
}