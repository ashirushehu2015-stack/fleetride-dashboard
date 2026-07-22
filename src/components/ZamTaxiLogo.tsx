import React from 'react';
// @ts-ignore
import zamtaxiOfficialLogoImg from '../assets/images/zamtaxi_official_logo_1784741646633.jpg';

interface ZamTaxiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  className?: string;
}

export default function ZamTaxiLogo({ size = 'md', showSubtext = true, className = '' }: ZamTaxiLogoProps) {
  const imageSizes = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official ZAMTAXI Emblem Image */}
      <div className="relative overflow-hidden rounded-xl shadow-md border border-emerald-600/30 bg-emerald-600 group shrink-0">
        <img
          src={zamtaxiOfficialLogoImg}
          alt="ZAMTAXI 100% Electric Zamfara State Transport"
          className={`${imageSizes[size]} w-auto object-cover transition-transform duration-300 group-hover:scale-105`}
          referrerPolicy="no-referrer"
        />
      </div>

      {showSubtext && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-0.5 font-black text-zinc-950 tracking-tight leading-none text-base sm:text-lg">
            <span>ZamTa</span>
            <span className="text-red-600 font-extrabold drop-shadow-xs">X</span>
            <span>i</span>
          </div>
          <span className="text-emerald-700 text-[9px] uppercase font-extrabold tracking-wider block mt-0.5">
            ZAMFARA STATE TRANSPORT
          </span>
        </div>
      )}
    </div>
  );
}
