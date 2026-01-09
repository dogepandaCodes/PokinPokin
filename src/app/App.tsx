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
  id : string;
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


  const fetchProfile = async (userId: string) => {
    const {data,error} = await supabase
      .from('profiles')
      .select('id,email,points,coins')
      .eq('id', userId)
      .single();

    if(error){
      console.error('Failed to fetch profile:', error.message);
      return null;
    }
    return data as  User;
  };

useEffect(() => {
  // Restore session on app start (refresh/first load)
  const restoreSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Failed to get session:', error.message);
      return;
    }

    const sessionUser = data.session?.user;

    // If a session exists, restore user state so UI stays "logged in"
    if (sessionUser) {
       const profile = await fetchProfile(sessionUser.id);
       if (profile) setUser(profile);
    }
  };

  restoreSession();

  // Listen for auth state changes (login/logout/token refresh)
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    const sessionUser = session?.user;

    if (sessionUser) {
      fetchProfile(sessionUser.id).then((profile) => {
        if (profile) setUser(profile);
      });
    }
    else {
      setUser(null);
    }
  });

  // Cleanup subscription on unmount
  return () => {
    listener.subscription.unsubscribe();
  };
  }, []);

  const handleLogin = async(email: string, password: string) => {
    const { data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if(error){
      console.error('Supabase login failed:', error.message);
      return;
    }
    
    const authUser = data.user;
    if(!authUser){
      console.error('login success but no user returned');
      return;
    }

    console.log('Supabase login success:', authUser.email);

    const profile = await fetchProfile(authUser.id);

    if(profile){
      setUser(profile);
    }
    else{
      setUser({
        id: authUser.id,
        email: authUser.email ?? email,
        points: 150,
        coins: 50,
      });
    }

    setShowLoginDialog(false);

    const hasClaimedToday = checkDailyTokenClaim(authUser.email ?? email);
    if (!hasClaimedToday) {
      setTimeout(() => setShowDailyTokenDialog(true), 500);
    }
  };


  const handleClaimDailyToken = async () => {
    if(!user) return;

    // Increment coins in the database for the current user
    const {error} = await supabase.from('profiles')
      .update({ coins: user.coins + 1})
      .eq('id', user.id);
    
    if(error){
      console.error('Failed to claim daily token:', error.message);
      return;
    }

    // Re-fetch profile to sync UI with the database
    const update = await fetchProfile(user.id);
    if (update) setUser(update);

    // Save claim date to localStorage (keeps your "once per day" UX)
    const today = new Date().toDateString();
    localStorage.setItem(`lastTokenClaim_${user.email}`, today);

  }

  const handleCloseDailyToken = () => {
    setShowDailyTokenDialog(false);
    // If they skip, still mark as shown for today so it doesn't pop up again
    if (user) {
      const today = new Date().toDateString();
      localStorage.setItem(`lastTokenClaim_${user.email}`, today);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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