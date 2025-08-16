import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  Building2,
  User,
  CreditCard
} from 'lucide-react';

interface Dealer {
  business_name?: string;
  kyb_status?: string;
  payment_method_verified?: boolean;
  background_check_status?: string;
}

interface DashboardUser {
  email_verified?: boolean;
}

interface VerificationStatusProps {
  dealer: Dealer;
  user: DashboardUser;
}

export default function VerificationStatus({ dealer, user }: VerificationStatusProps) {
  // Calculate verification progress
  const getVerificationProgress = () => {
    const checks = [
      { name: 'Email Verified', status: user?.email_verified || false, icon: User },
      { name: 'Business Profile', status: !!dealer?.business_name, icon: Building2 },
      { name: 'Documents Uploaded', status: dealer?.kyb_status === 'completed', icon: FileText },
      { name: 'Payment Method', status: dealer?.payment_method_verified || false, icon: CreditCard },
      { name: 'Background Check', status: dealer?.background_check_status === 'approved', icon: Shield }
    ];

    const completed = checks.filter(check => check.status).length;
    const total = checks.length;
    const percentage = Math.round((completed / total) * 100);

    return { checks, completed, total, percentage };
  };

  const { checks, completed, total, percentage } = getVerificationProgress();

  const getOverallStatus = () => {
    if (percentage === 100) return { status: 'verified', label: 'Fully Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (percentage >= 80) return { status: 'pending', label: 'Almost Complete', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    if (percentage >= 50) return { status: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle };
    return { status: 'not_started', label: 'Not Started', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={overallStatus.color}>
              <overallStatus.icon className="w-3 h-3 mr-1" />
              {overallStatus.label}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
            <div className="text-sm text-gray-500">{completed} of {total} completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={percentage} className="h-2" />

        {/* Individual Checks */}
        <div className="space-y-2">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <check.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{check.name}</span>
              </div>
              <Badge variant={check.status ? "default" : "secondary"} className="text-xs">
                {check.status ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </>
                )}
              </Badge>
            </div>
          ))}
        </div>

        {/* Action Required Message */}
        {percentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">Action Required</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Complete your verification to unlock full marketplace access and features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
