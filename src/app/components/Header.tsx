import React from 'react';
import { Button } from './ui/button';
import { Coins, LogOut, User, LogIn, QrCode, Star } from 'lucide-react';
import logo from '../../assets/logo.png';
import bgMusic from '../../assets/bg.mp3';

interface HeaderProps {
  user: {
    email: string;
    points: number;
    coins: number;
  } | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onQRCodeClick: () => void;
}

export function Header({ user, onLogout, onLoginClick, onQRCodeClick }: HeaderProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const [isSpinning, setIsSpinning] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const lastRotationRef = React.useRef<number>(0);

  const animateSpin = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    
    // 2 seconds per rotation = 180 degrees per second
    // Don't use modulo - let rotation keep increasing
    const newRotation = lastRotationRef.current + (elapsed / 2000) * 360;
    setRotation(newRotation);
    
    if (isSpinning) {
      animationRef.current = requestAnimationFrame(animateSpin);
    }
  };

  const stopSpinToOrigin = () => {
    // Calculate next multiple of 360
    const currentRotation = rotation;
    const nextMultiple = Math.ceil(currentRotation / 360) * 360;
    const remaining = nextMultiple - currentRotation;
    
    // Animate to next multiple of 360
    const duration = (remaining / 360) * 2000; // Proportional to remaining distance
    const startRotation = currentRotation;
    const startTime = performance.now();
    
    const finishSpin = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRotation + (remaining * easeProgress);
      
      setRotation(currentRot);
      
      if (progress < 1) {
        requestAnimationFrame(finishSpin);
      } else {
        setRotation(nextMultiple);
        setIsSpinning(false);
      }
    };
    
    if (remaining > 0) {
      requestAnimationFrame(finishSpin);
    } else {
      setRotation(nextMultiple);
      setIsSpinning(false);
    }
  };

  React.useEffect(() => {
    if (isSpinning) {
      startTimeRef.current = 0;
      lastRotationRef.current = rotation;
      animationRef.current = requestAnimationFrame(animateSpin);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning]);

  const handleLogoClick = () => {
    if (isPlaying) {
      // Stop music immediately
      audioRef.current?.pause();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      
      // Stop spinning and return to origin
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      stopSpinToOrigin();
    } else {
      // Start music
      if (!audioRef.current) {
        // Note: YouTube videos cannot be directly embedded as audio sources
        // You'll need to provide a direct MP3/audio file URL
        // For demonstration, using a placeholder URL
        audioRef.current = new Audio();
        // Replace this with your actual audio file URL
        audioRef.current.src = bgMusic;
        audioRef.current.loop = true; // Enable looping
        
        // Add event listeners
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          stopSpinToOrigin();
        });
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current?.play().catch(err => console.log('Audio play failed:', err));
      setIsPlaying(true);
      setIsSpinning(true);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center flex-shrink-0">
              <img 
                src={logo} 
                alt="PokinPokin Logo" 
                className="w-full h-full object-cover rounded-full cursor-pointer transition-transform hover:scale-110"
                onClick={handleLogoClick}
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  aspectRatio: '1 / 1'
                }}
              />
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-xl">PokinPokin</h1>
              <p className="text-sm text-white/80">Win Big, Play More!</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                onClick={onQRCodeClick}
                variant="ghost"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white p-2.5 md:p-2 h-10 md:h-9"
                title="View QR Code"
              >
                <QrCode className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 px-2.5 py-2 md:px-3 md:py-2 rounded-lg h-10 md:h-9">
                <Star className="w-5 h-5" />
                <span className="font-semibold text-sm md:text-base">{user ? user.points : '?'}</span>
                <span className="hidden sm:inline text-sm md:text-base">pts</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 px-2.5 py-2 md:px-3 md:py-2 rounded-lg h-10 md:h-9">
                <Coins className="w-5 h-5" />
                <span className="font-semibold text-sm md:text-base">{user ? user.coins : '?'}</span>
                <span className="hidden sm:inline text-sm md:text-base">coins</span>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden lg:flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 hover:bg-white/30 text-white text-sm md:text-sm px-3 py-2 md:px-4 h-10 md:h-9"
                >
                  <LogOut className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onLoginClick}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 hover:bg-white/30 text-white text-sm md:text-sm px-3 py-2 md:px-4 h-10 md:h-9"
              >
                <LogIn className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}