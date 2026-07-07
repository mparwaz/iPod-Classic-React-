import React from 'react';
import { Battery, Play, Pause } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  title: string;
  isPlaying: boolean;
  batteryLevel: number; // 0-100
  isDarkMode?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ title, isPlaying, batteryLevel, isDarkMode }) => {
  return (
    <div className={cn(
      "w-full h-6 px-1.5 flex items-center justify-between border-b shrink-0 transition-colors duration-300",
      isDarkMode ? "bg-gradient-to-b from-[#444] to-[#222] border-black text-white" : "bg-gradient-to-b from-[#f8f8f8] to-[#cecece] border-[#8a8a8a] text-black"
    )}>
      <div className="w-5 flex items-center justify-start">
        {isPlaying ? <Play className="w-[10px] h-[10px] fill-current" /> : <Pause className="w-[10px] h-[10px] fill-current" />}
      </div>
      <div className="font-bold text-[12px] font-sans tracking-tight leading-none">
        {title}
      </div>
      <div className="w-5 flex items-center justify-end relative">
        <div className={cn(
          "w-5 h-2.5 rounded-[1px] border-[1px] relative",
          isDarkMode ? "border-gray-200" : "border-gray-600"
        )}>
          <div className="absolute inset-[1px]">
             <div 
               className={cn("h-full", batteryLevel > 20 ? (isDarkMode ? "bg-gray-200" : "bg-[#4ade80]") : "bg-red-500")}
               style={{ width: `${batteryLevel}%` }}
             />
          </div>
          {/* Battery nub */}
          <div className={cn(
            "absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] rounded-r-[1px]",
            isDarkMode ? "bg-gray-200" : "bg-gray-600"
          )} />
        </div>
      </div>
    </div>
  );
};
