import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Star, 
  CheckCircle, 
  Award, 
  Clock, 
  TrendingUp,
  Users,
  Phone
} from 'lucide-react';

export default function TrustIndicators({ dealer, compact = false }) {
  if (!dealer) return null;

  const getTrustScore = (dealer) => {
    let score = 0;
    
    // Verification status (40 points)
    if (dealer.verification_status === 'verified') score += 40;
    else if (dealer.verification_status === 'pending') score += 20;
    
    // Rating (30 points)
    if (dealer.rating >= 4.5) score += 30;
    else if (dealer.rating >= 4.0) score += 25;
    else if (dealer.rating >= 3.5) score += 20;
    else if (dealer.rating >= 3.0) score += 15;
    
    // Deal completion (20 points)
    if (dealer.total_deals >= 50) score += 20;
    else if (dealer.total_deals >= 20) score += 15;
    else if (dealer.total_deals >= 10) score += 10;
    else if (dealer.total_deals >= 5) score += 5;
    
    // Response time (10 points)
    if (dealer.avg_response_time === '< 1 hour') score += 10;
    else if (dealer.avg_response_time === '< 2 hours') score += 8;
    else if (dealer.avg_response_time === '< 4 hours') score += 6;
    
    return Math.min(score, 100);
  };

  const trustScore = getTrustScore(dealer);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Building';
  };

  const trustBadges = [];
  
  // Verification badge
  if (dealer.verification_status === 'verified') {
    trustBadges.push({
      icon: Shield,
      label: 'Verified Dealer',
      color: 'bg-green-100 text-green-700',
      priority: 1
    });
  }
  
  // Rating badge
  if (dealer.rating >= 4.0) {
    trustBadges.push({
      icon: Star,
      label: `${dealer.rating} Stars`,
      color: 'bg-yellow-100 text-yellow-700',
      priority: 2
    });
  }
  
  // Experience badge
  if (dealer.total_deals >= 20) {
    trustBadges.push({
      icon: Award,
      label: 'Experienced',
      color: 'bg-purple-100 text-purple-700',
      priority: 3
    });
  }
  
  // Response time badge
  if (dealer.avg_response_time === '< 1 hour') {
    trustBadges.push({
      icon: Clock,
      label: 'Quick Response',
      color: 'bg-blue-100 text-blue-700',
      priority: 4
    });
  }

  // Sort by priority and limit for compact view
  trustBadges.sort((a, b) => a.priority - b.priority);
  const displayBadges = compact ? trustBadges.slice(0, 2) : trustBadges;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={`${getScoreColor(trustScore)} font-medium`}>
          {getScoreLabel(trustScore)} {trustScore}%
        </Badge>
        {displayBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <Badge key={index} className={`${badge.color} gap-1`} variant="secondary">
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{badge.label}</span>
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Trust Score */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getScoreColor(trustScore)}`}>
              <Shield className="w-5 h-5" />
              <span className="font-bold">{getScoreLabel(trustScore)} Trust Score: {trustScore}%</span>
            </div>
          </div>

          {/* Trust Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                {dealer.rating || 'New'}
              </div>
              <div className="text-xs text-slate-600">Rating</div>
            </div>
            
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                <Users className="w-4 h-4 text-blue-500" />
                {dealer.total_deals || 0}
              </div>
              <div className="text-xs text-slate-600">Deals</div>
            </div>
            
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                <Clock className="w-4 h-4 text-green-500" />
                {dealer.avg_response_time || 'New'}
              </div>
              <div className="text-xs text-slate-600">Response</div>
            </div>
            
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                {dealer.verification_status === 'verified' ? 'Yes' : 'Pending'}
              </div>
              <div className="text-xs text-slate-600">Verified</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Trust Indicators</h3>
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <Badge key={index} className={`${badge.color} gap-1`} variant="secondary">
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Security Features */}
          <div className="pt-3 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <Shield className="w-3 h-3" />
                <span>Identity Verified</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>KYB Complete</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Phone className="w-3 h-3" />
                <span>Phone Verified</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>Active Seller</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}