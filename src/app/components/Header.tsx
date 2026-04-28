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
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const rotationRef = React.useRef<number>(0);
  const lastTimestampRef = React.useRef<number | null>(null);
  const isSpinningRef = React.useRef<boolean>(false);

  // Degrees per millisecond at full speed (180 deg/sec)
  const SPEED = 180 / 1000;

  const applyRotation = (deg: number) => {
    rotationRef.current = deg;
    if (imgRef.current) {
      imgRef.current.style.transform = `rotate(${deg}deg)`;
    }
  };

  const spinLoop = (timestamp: number) => {
    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }
    const delta = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;
    applyRotation(rotationRef.current + delta * SPEED);

    if (isSpinningRef.current) {
      animationRef.current = requestAnimationFrame(spinLoop);
    }
  };

  const stopSpinToOrigin = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const current = rotationRef.current;
    const nextFull = Math.ceil(current / 360) * 360;
    const remaining = nextFull - current;

    if (remaining <= 0) {
      applyRotation(nextFull);
      return;
    }

    // Ease out over the remaining arc
    const duration = (remaining / 360) * (1000 / SPEED) * 0.4; // faster decel
    const startRotation = current;
    const startTime = performance.now();

    const finish = (ts: number) => {
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      applyRotation(startRotation + remaining * eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(finish);
      } else {
        applyRotation(nextFull);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(finish);
  };

  const handleLogoClick = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsPlaying(false);
      isSpinningRef.current = false;
      stopSpinToOrigin();
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(bgMusic);
        audioRef.current.loop = true;
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          isSpinningRef.current = false;
          stopSpinToOrigin();
        });
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      setIsPlaying(true);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isSpinningRef.current = true;
      lastTimestampRef.current = null;
      animationRef.current = requestAnimationFrame(spinLoop);
    }
  };

  React.useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center flex-shrink-0">
              <img
                ref={imgRef}
                src={logo}
                alt="PokinPokin Logo"
                className="w-full h-full object-cover rounded-full cursor-pointer transition-transform hover:scale-110"
                onClick={handleLogoClick}
                style={{ willChange: 'transform' }}
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
