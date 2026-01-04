import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { HelpCircle } from 'lucide-react';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    email: string;
    points: number;
    coins: number;
  } | null;
}

export function QRCodeDialog({ open, onClose, user }: QRCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {user ? 'Your PokinPokin QR Code' : 'QR Code'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code or Question Mark */}
          <div className="bg-white p-6 rounded-lg border-4 border-purple-500 shadow-lg">
            {user ? (
              <QRCodeSVG
                value={`pokinpokin://user/${user.email}`}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#7c3aed"
                bgColor="#ffffff"
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <HelpCircle className="w-32 h-32 text-gray-300" />
              </div>
            )}
          </div>

          {/* User Info or Login Prompt */}
          {user ? (
            <div className="text-center">
              <p className="font-semibold text-purple-600">{user.email}</p>
              <p className="text-sm text-gray-600 mt-2">
                Scan this code at our kiosks to access your account
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">
                Please log in to view your QR code
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}