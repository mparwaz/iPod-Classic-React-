import React from 'react';
import { cn } from '../../lib/utils';
import { Battery } from 'lucide-react';

interface VolumeLimitViewProps {
  isDarkMode: boolean;
  volumeLimit: number;
}

export const VolumeLimitView: React.FC<VolumeLimitViewProps> = ({ isDarkMode, volumeLimit }) => {
  return (
    <div className={cn(
      "w-full h-[216px] flex flex-col overflow-hidden text-sm",
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      <div className={cn(
        "px-2 py-1 flex items-center justify-between border-b shrink-0",
        isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"
      )}>
        <span className="font-semibold text-xs">Volume Limit</span>
        <Battery className="w-4 h-4" />
      </div>

      <div className="flex-1 flex flex-col items-center p-4 relative">
        <p className="text-center text-xs mb-8 leading-tight font-medium">
          Select a new maximum volume and press the Center button to continue.
        </p>

        <div className="w-full flex items-center gap-2 mt-4 px-2">
          <span className="text-xs">🔈</span>
          <div className="flex-1 h-3 rounded bg-gray-300 relative border border-gray-400">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-l"
              style={{ width: `${volumeLimit}%` }}
            />
            <div 
              className="absolute bottom-[-8px] text-blue-500 text-[10px]"
              style={{ left: `calc(${volumeLimit}% - 4px)` }}
            >
              ▲
            </div>
          </div>
          <span className="text-xs">🔊</span>
        </div>
      </div>
    </div>
  );
};
