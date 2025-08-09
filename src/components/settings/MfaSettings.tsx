import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Download } from 'lucide-react';

// In a real app, this would be a real QR code image URL from the backend
const MOCK_QR_CODE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Aura:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Aura";
const MOCK_BACKUP_CODES = [
  "f12a-3b9c-d4e5", "a6b7-8c9d-e0f1", "1a2b-3c4d-5e6f", 
  "7g8h-9i0j-1k2l", "m3n4-o5p6-q7r8"
];

export default function MfaSettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleToggleMfa = (enabled) => {
    setMfaEnabled(enabled);
    if (enabled) {
      setShowQr(true);
      setShowBackupCodes(false);
    } else {
      setShowQr(false);
      setShowBackupCodes(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Authenticator App</div>
              <div className="text-sm text-slate-600">Use an app like Google Authenticator</div>
            </div>
          <Switch 
            id="mfa-switch"
            checked={mfaEnabled}
            onCheckedChange={handleToggleMfa}
          />
        </div>

        {showQr && (
          <div className="p-6 bg-slate-50 rounded-lg text-center space-y-4 border">
            <h3 className="font-semibold">1. Scan this QR code with your authenticator app</h3>
            <img src={MOCK_QR_CODE_URL} alt="MFA QR Code" className="mx-auto border p-2 bg-white" />
            <p className="text-sm text-slate-600">Once scanned, enter the 6-digit code from your app to verify and complete setup.</p>
             <Button onClick={() => { setShowQr(false); setShowBackupCodes(true); }}>Verify & Complete</Button>
          </div>
        )}

        {showBackupCodes && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center space-y-4">
                <Shield className="w-8 h-8 mx-auto text-green-600" />
                <h3 className="font-semibold text-green-800">MFA is Enabled!</h3>
                <p className="text-sm">Save these backup codes in a secure place. They can be used to access your account if you lose your device.</p>
                <div className="grid grid-cols-2 gap-2 font-mono bg-white p-4 rounded text-sm">
                    {MOCK_BACKUP_CODES.map(code => <span key={code}>{code}</span>)}
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2"/>
                  Download Codes
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}