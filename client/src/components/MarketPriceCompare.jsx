import React from 'react';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

/**
 * 24. PRICE TRANSPARENCY COMPONENT
 * Compares FarmPay direct farmer price with standard mandi benchmark reference price
 */
export const MarketPriceCompare = ({ cropName, farmerPrice, marketRefPrice, unit = 'kg' }) => {
  if (!marketRefPrice) return null;

  const diff = farmerPrice - marketRefPrice;
  const isDirectDeal = diff <= 0;

  return (
    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs space-y-1.5">
      <div className="flex items-center justify-between font-medium">
        <span className="text-slate-500">Mandi Reference:</span>
        <span className="text-slate-700 font-semibold">₹{marketRefPrice}/{unit}</span>
      </div>
      <div className="flex items-center justify-between font-medium">
        <span className="text-slate-500">FarmPay Direct:</span>
        <span className="text-emerald-700 font-bold">₹{farmerPrice}/{unit}</span>
      </div>

      <div className={`text-[11px] pt-1 border-t border-slate-200 flex items-center ${isDirectDeal ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
        {isDirectDeal ? (
          <>
            <TrendingDown className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Direct price saves middleman commission</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-amber-600" />
            <span>Direct premium for sorted Grade-A produce</span>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketPriceCompare;
