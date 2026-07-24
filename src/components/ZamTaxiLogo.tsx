import React from 'react';

interface ZamTaxiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  className?: string;
}

export default function ZamTaxiLogo({
  size = 'md',
  showSubtext = true,
  className = ''
}: ZamTaxiLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const subtextSizes = {
    sm: 'text-[8px]',
    md: 'text-[9.5px]',
    lg: 'text-[11px]',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 select-none ${className}`}>
      {/* Sleek Green EV Emblem */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white font-black shadow-md border border-emerald-400/30 transition-transform duration-300 hover:scale-105 shrink-0 ${iconSizes[size]}`}
      >
        {/* Electric Bolt & Taxi Emblem SVG */}
        <svg className="w-1/2 h-1/2 fill-current text-white drop-shadow-xs" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z" />
          <circle cx="7.5" cy="15" r="1.5" />
          <circle cx="16.5" cy="15" r="1.5" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-zinc-950"></span>
        </span>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col justify-center text-left leading-none">
        <div className={`flex items-center font-black text-zinc-950 tracking-tight ${textSizes[size]}`}>
          <span>ZamTa</span>
          <span className="text-red-600 font-extrabold drop-shadow-xs px-0.5">X</span>
          <span>i</span>
        </div>
        {showSubtext && (
          <span className={`text-emerald-800 font-black uppercase tracking-widest block mt-1 ${subtextSizes[size]}`}>
            ZAMFARA STATE TRANSPORT
          </span>
        )}
      </div>
    </div>
  );
}



