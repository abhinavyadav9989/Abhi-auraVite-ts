import React from 'react';

export default function MarginGauge({ margin }) {
  const getMarginColor = () => {
    if (margin < 5) return 'bg-red-500';
    if (margin < 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const widthPercentage = Math.min(Math.max(margin, 0), 20); // Cap at 20% for visual purposes

  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div
        className={`${getMarginColor()} h-2.5 rounded-full transition-all duration-300`}
        style={{ width: `${widthPercentage * 5}%` }} // Scale to fit 100% width
      ></div>
    </div>
  );
}