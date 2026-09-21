import React from 'react';

export default function Logo({ className = "h-9", textClass = "text-xl", showText = true }) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0F2C59] shadow-md border border-slate-700/30 overflow-hidden group">
        {/* Modern Winged Arrow Logo Emblem */}
        <svg viewBox="0 0 100 100" className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" fill="none">
          <path d="M15 50L45 20H85L55 50L85 80H45L15 50Z" fill="#FF6B00" />
          <path d="M38 50L58 30H74L54 50L74 70H58L38 50Z" fill="#FFFFFF" />
        </svg>
        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-extrabold tracking-tight ${textClass} font-display flex items-center gap-1`}>
            <span className="text-[#0F2C59] dark:text-white font-extrabold">SWIFT</span>
            <span className="text-[#FF6B00] font-black">LINE</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-0.5">
            Worldwide Courier
          </span>
        </div>
      )}
    </div>
  );
}
