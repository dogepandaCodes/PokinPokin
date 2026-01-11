import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Coins, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
  icon: React.ReactNode;
  popular?: boolean;
}

interface PricingSectionProps {
  user: {
    id: string;
    email: string;
    points: number;
    coins: number;
  } | null;
  onLoginClick: () => void;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 10,
    price: 10,
    bonus: 0,
    icon: <Coins className="w-8 h-8" />,
  },
  {
    id: 'popular',
    name: 'Player Pack',
    coins: 20,
    price: 20,
    bonus: 2,
    icon: <Zap className="w-8 h-8" />,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Pro Pack',
    coins: 50,
    price: 50,
    bonus: 10,
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 100,
    price: 100,
    bonus: 30,
    icon: <Crown className="w-8 h-8" />,
  },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function PricingSection({ user, onLoginClick }: PricingSectionProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (tier: PricingTier) => {
    setError(null);

    if (!user) {
      onLoginClick();
      return;
    }

    setLoadingTier(tier.id);

    try {
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: tier.id,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Coin Packages</h2>
          <p className="text-muted-foreground">
            Get more coins and earn bonus points with larger packages!
          </p>
          {!user && (
            <p className="text-sm text-purple-600 mt-2">
              Please log in to purchase coins
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${
                tier.popular ? 'border-purple-500 border-2 shadow-lg scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-1 rounded-full text-sm font-semibold z-10 whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <div className="flex justify-center text-purple-600 mb-2">{tier.icon}</div>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>
                  {tier.coins} coins {tier.bonus > 0 && `+ ${tier.bonus} bonus`}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-4xl font-bold text-purple-600">${tier.price}</div>
                {tier.bonus > 0 && (
                  <div className="text-sm text-green-600 font-semibold">
                    🪙 {tier.bonus} Bonus Coins!
                  </div>
                )}
                <Button
                  onClick={() => handlePurchase(tier)}
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  disabled={loadingTier !== null}
                >
                  {loadingTier === tier.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : !user ? (
                    'Login to Purchase'
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-lg p-6 border">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="text-2xl">🪙</div>
              <div>
                <h4 className="font-semibold mb-1">Purchase Coins</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a coin package that fits your playstyle
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🎮</div>
              <div>
                <h4 className="font-semibold mb-1">Play Games</h4>
                <p className="text-sm text-muted-foreground">
                  Use coins to play any claw machine in our arcade
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">⭐️</div>
              <div>
                <h4 className="font-semibold mb-1">Earn Points</h4>
                <p className="text-sm text-muted-foreground">
                  Win prizes and earn points for exclusive rewards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}