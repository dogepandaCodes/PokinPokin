import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { QRCodeDialog } from './components/QRCodeDialog';
import { DailyTokenDialog } from './components/DailyTokenDialog';
import { HeroSection } from './components/HeroSection';
import { PricingSection } from './components/PricingSection';
import { PrizesSection } from './components/PrizesSection';
import { LocationsSection } from './components/LocationsSection';
import logo from '../assets/logo.png';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { supabase } from '../lib/supabaseClient';

interface User {
  email: string;
  points: number;
  coins: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [showDailyTokenDialog, setShowDailyTokenDialog] = useState(false);

  // Check if user has claimed daily token
  const checkDailyTokenClaim = (email: string): boolean => {
    const lastClaimDate = localStorage.getItem(`lastTokenClaim_${email}`);
    const today = new Date().toDateString();
    
    return lastClaimDate === today;
  };

  const handleLogin = (email: string, password: string) => {
    // Mock login - in a real app, this would authenticate with a backend
    // For demo purposes, create a user with initial points and coins
    const newUser = {
      email: email,
      points: 150,
      coins: 50,
    };
    setUser(newUser);
    setShowLoginDialog(false);

    // Check if user has already claimed today's token
    const hasClaimedToday = checkDailyTokenClaim(email);
    if (!hasClaimedToday) {
      // Show daily token dialog after a short delay
      setTimeout(() => {
        setShowDailyTokenDialog(true);
      }, 500);
    }
  };

  const handleClaimDailyToken = () => {
    if (user) {
      // Add 1 token (coin) to user's account
      setUser({
        ...user,
        coins: user.coins + 1,
      });

      // Save claim date to localStorage
      const today = new Date().toDateString();
      localStorage.setItem(`lastTokenClaim_${user.email}`, today);
    }
  };

  const handleCloseDailyToken = () => {
    setShowDailyTokenDialog(false);
    // If they skip, still mark as shown for today so it doesn't pop up again
    if (user) {
      const today = new Date().toDateString();
      localStorage.setItem(`lastTokenClaim_${user.email}`, today);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleLoginClick = () => {
    setShowLoginDialog(true);
  };

  const handleCloseLogin = () => {
    setShowLoginDialog(false);
  };

  const handleQRCodeClick = () => {
    setShowQRCodeDialog(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCodeDialog(false);
  };
console.log('Supabase URL from App:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_ENV_TEST:', import.meta.env.VITE_ENV_TEST);
console.log('SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL);


  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onLogout={handleLogout} onLoginClick={handleLoginClick} onQRCodeClick={handleQRCodeClick} />
      <LoginForm onLogin={handleLogin} open={showLoginDialog} onClose={handleCloseLogin} />
      <QRCodeDialog open={showQRCodeDialog} onClose={handleCloseQRCode} user={user} />
      <DailyTokenDialog open={showDailyTokenDialog} onClose={handleCloseDailyToken} onClaim={handleClaimDailyToken} />
      <HeroSection />
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="prizes">
        <PrizesSection />
      </div>
      <div id="locations">
        <LocationsSection />
      </div>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex flex-col items-center">
            <img src={logo} alt="PokinPokin Logo" className="w-16 h-16 object-cover rounded-full mb-2" />
            <h3 className="font-bold text-xl">PokinPokin</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            The ultimate destination for claw machine enthusiasts
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact Us
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            © 2026 PokinPokin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;