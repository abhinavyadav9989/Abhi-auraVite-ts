
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, CheckCircle2, CreditCard, ArrowRight, Clock, ShieldOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dealer } from "@/api/entities";

export default function ConditionalBanners({ dealer }) {
  const { toast } = useToast();

  const handleExtendProvisional = async () => {
    if (!dealer || !dealer.id) {
      toast({
        title: "Error",
        description: "Unable to extend provisional access - dealer data not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const currentExtensionCount = dealer.extension_count || 0;
      
      await Dealer.update(dealer.id, {
        provisional_until: newExpiryDate,
        extension_requested: true,
        extension_count: currentExtensionCount + 1
      });
      
      toast({
        title: "Extension Granted",
        description: "Your provisional access has been extended for another 7 days.",
      });
      
      // Reload the page to show updated banner
      window.location.reload();
    } catch (error) {
      console.error('Error extending provisional period:', error);
      toast({
        title: "Error",
        description: "Failed to extend provisional access. Please try again.",
        variant: "destructive"
      });
    }
  };

  const banners = [];

  // ONB-17: Suspended dealer banner - HIGHEST PRIORITY
  const isSuspended = dealer?.verification_status === 'suspended' || dealer?.verification_status_new === 'suspended';
  if (isSuspended) {
    banners.push({
      id: 'account_suspended',
      type: 'error',
      icon: ShieldOff,
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${dealer.verification_notes || 'Compliance review required.'}. Please contact support to resolve this issue.`,
      action: (
        <a href={`mailto:support@aura.com?subject=Account Suspension Appeal - Dealer ID ${dealer.id}`}>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Contact Support
            </Button>
        </a>
      ),
      color: 'border-red-200 bg-red-50'
    });
  }
  // ONB-10: Provisional status banner - Fixed logic
  const isProvisional = (dealer?.verification_status === 'provisional' || dealer?.verification_status_new === 'provisional') && dealer?.provisional_until;
  if (isProvisional) {
    const expiryDate = new Date(dealer.provisional_until);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const extensionCount = dealer.extension_count || 0;
    const maxExtensions = 2;
    
    banners.push({
      id: 'provisional',
      type: 'warning',
      icon: Clock,
      title: 'Complete Your Verification',
      message: daysLeft > 0 
        ? `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your provisional access. Complete KYB verification for full platform access.`
        : 'Your provisional access has expired. Please complete verification to continue.',
      action: (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => window.location.href = createPageUrl('KYBWizard')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Complete Now
          </Button>
          {daysLeft > 0 && extensionCount < maxExtensions && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleExtendProvisional}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Extend Trial ({maxExtensions - extensionCount} left)
            </Button>
          )}
        </div>
      ),
      color: 'border-orange-200 bg-orange-50'
    });
  }
  // ONB-11: Verification rejected banner
  const isRejected = dealer?.verification_status === 'rejected' || dealer?.verification_status_new === 'rejected';
  if (isRejected) {
    banners.push({
      id: 'verification_rejected',
      type: 'error',
      icon: AlertTriangle,
      title: 'Verification Needs Attention',
      message: `Your verification was rejected: ${dealer.verification_notes || 'Please review and resubmit your documents.'}`,
      action: (
        <Button size="sm" onClick={() => window.location.href = createPageUrl('KYBWizard')}>
          Resubmit Documents
        </Button>
      ),
      color: 'border-red-200 bg-red-50'
    });
  }
  // Documents submitted - waiting for review
  const isDocumentsSubmitted = dealer?.verification_status === 'documents_submitted' || dealer?.verification_status_new === 'documents_submitted';
  if (isDocumentsSubmitted) {
    banners.push({
      id: 'documents_submitted',
      type: 'info',
      icon: Clock,
      title: 'Verification Under Review',
      message: 'Your documents have been submitted and are being reviewed by our team. We\'ll notify you within 24-48 hours.',
      action: (
        <Button size="sm" variant="outline" disabled>
          <Clock className="w-4 h-4 mr-2" />
          Under Review
        </Button>
      ),
      color: 'border-blue-200 bg-blue-50'
    });
  }
  // KYB Verification Banner - REMOVED: This should be handled during onboarding, not after adding vehicles
  // The verification banner is now shown at the top of the dashboard for users who haven't completed onboarding

  // Mock Bank Account Banner
  const hasBankAccount = true; // This would come from actual dealer data
  if (!hasBankAccount) {
    banners.push({
      id: 'bank_account',
      type: 'info',
      icon: CreditCard,
      title: 'Add Payout Bank Account',
      message: 'Add your bank account details to receive escrow funds automatically when deals complete',
      cta: 'Add Bank Account',
      link: createPageUrl("Profile") + "#bank",
      color: 'border-blue-200 bg-blue-50'
    });
  }

  // Success Banner for verified dealers
  const isVerified = dealer?.verification_status === 'verified' || dealer?.verification_status_new === 'verified';
  if (isVerified && banners.length === 0) {
    banners.push({
      id: 'success',
      type: 'success',
      icon: CheckCircle2,
      title: 'Account Fully Verified',
      message: 'Your dealer account is verified and ready for full trading. You can now access all platform features.',
      cta: 'Start Trading',
      link: createPageUrl("Marketplace"),
      color: 'border-green-200 bg-green-50'
    });
  }

  if (banners.length === 0) return null;

  return (
    <div className="space-y-4">
      {banners.map((banner) => {
        const Icon = banner.icon;
        let iconBgColor = '';
        let iconTextColor = '';
        let buttonBgColor = '';

        switch (banner.type) {
          case 'warning':
            iconBgColor = 'bg-orange-100';
            iconTextColor = 'text-orange-600';
            buttonBgColor = 'bg-orange-600 hover:bg-orange-700';
            break;
          case 'success':
            iconBgColor = 'bg-green-100';
            iconTextColor = 'text-green-600';
            buttonBgColor = 'bg-green-600 hover:bg-green-700';
            break;
          case 'error':
            iconBgColor = 'bg-red-100';
            iconTextColor = 'text-red-600';
            buttonBgColor = 'bg-red-600 hover:bg-red-700';
            break;
          case 'info':
          default:
            iconBgColor = 'bg-blue-100';
            iconTextColor = 'text-blue-600';
            buttonBgColor = 'bg-blue-600 hover:bg-blue-700';
            break;
        }

        return (
          <Card key={banner.id} className={`border-2 ${banner.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full ${iconBgColor}`}>
                    <Icon className={`w-5 h-5 ${iconTextColor}`} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {banner.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {banner.message}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  {banner.action ? (
                    // Render custom action component if provided
                    banner.action
                  ) : (
                    // Otherwise, render default button with link
                    <Link to={banner.link}>
                      <Button 
                        size="sm" 
                        className={`gap-2 ${buttonBgColor}`}
                      >
                        {banner.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
