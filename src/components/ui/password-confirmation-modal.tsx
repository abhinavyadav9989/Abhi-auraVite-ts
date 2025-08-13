import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/api/supabaseClient';

interface PasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  actionType: 'edit' | 'delete';
}

export default function PasswordConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  actionType
}: PasswordConfirmationModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Password confirmation - Attempting authentication for:', user?.email);
      
      // Re-authenticate user with password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password
      });

      console.log('Password confirmation - Auth result:', { authError });

      if (authError) {
        console.error('Password confirmation - Auth error:', authError);
        setError('Incorrect password. Please try again.');
        return;
      }

      console.log('Password confirmation - Authentication successful, proceeding with action');
      
      // Password is correct, proceed with action
      onConfirm();
      handleClose();
    } catch (err) {
      console.error('Password confirmation - Unexpected error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  const getActionColor = () => {
    return actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${actionType === 'delete' ? 'text-red-600' : 'text-blue-600'}`} />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Enter your password to continue</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleConfirm();
                }
              }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={getActionColor()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
