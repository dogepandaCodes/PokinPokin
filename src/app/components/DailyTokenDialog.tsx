import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Gift, Coins } from 'lucide-react';

interface DailyTokenDialogProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
}

export function DailyTokenDialog({ open, onClose, onClaim }: DailyTokenDialogProps) {
  const handleClaim = () => {
    onClaim();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 rounded-full">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Daily Token!</DialogTitle>
          <DialogDescription className="text-center">
            Welcome back! Claim your free daily token to play more games.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-8 py-4 rounded-xl flex items-center gap-3">
            <Coins className="w-8 h-8 text-purple-600" />
            <span className="font-bold text-3xl text-purple-600">+1</span>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleClaim}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            Claim Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
