import React from "react";
import { Button } from "./ui/button";
import { Coins, LogOut, QrCode, Star } from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  points: number;
  coins: number;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onQRCodeClick: () => void;
}

export function Header({
  user,
  onLogout,
  onLoginClick,
  onQRCodeClick,
}: HeaderProps) {
  const displayName = user?.username ?? user?.email ?? "Guest";

  return (
    <header className="w-full bg-gradient-to-r from-purple-700 to-red-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            P
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-lg">PokinPokin</span>
            <span className="text-xs text-white/80">Win Big, Play More!</span>
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Username */}
              <span className="hidden sm:block font-medium">
                {displayName}
              </span>

              {/* Points */}
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <Star className="w-4 h-4" />
                <span>{user.points}</span>
                <span className="opacity-70">pts</span>
              </div>

              {/* Coins */}
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <Coins className="w-4 h-4" />
                <span>{user.coins}</span>
                <span className="opacity-70">coins</span>
              </div>

              {/* QR Code */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onQRCodeClick}
              >
                <QrCode className="w-5 h-5" />
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button
              onClick={onLoginClick}
              className="bg-white text-purple-700 hover:bg-white/90"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
