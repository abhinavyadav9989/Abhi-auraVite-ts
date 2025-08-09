import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

type TrendValue = number | { value: number; isPositive: boolean }

export default function KpiCard({ 
  title, 
  value, 
  trend = 0 as TrendValue, 
  icon: Icon, 
  format = "number", 
  unit = "", 
  trendUnit = "%", 
  positiveTrendIsGood = true,
  onClick,
  className = ""
}: any) {
  // Ensure trend is a number
  const numericTrend = typeof trend === 'number' ? trend : (trend?.value ?? 0);
  const isPositive = typeof trend === 'number' ? numericTrend >= 0 : !!trend?.isPositive;
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;
  
  let trendColor = 'text-slate-500';
  if ((isPositive && positiveTrendIsGood) || (!isPositive && !positiveTrendIsGood)) {
    trendColor = 'text-green-600';
  } else {
    trendColor = 'text-red-600';
  }

  const formatValue = (val) => {
    if (!val && val !== 0) return '0';
    
    if (format === "currency") {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    if (format === "percentage") {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}{unit}
        </div>
        {numericTrend !== 0 && (
          <div className={`flex items-center text-xs ${trendColor} mt-1`}>
            <TrendIcon className="w-3 h-3 mr-1" />
            <span>{Math.abs(numericTrend)}{trendUnit} from yesterday</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}