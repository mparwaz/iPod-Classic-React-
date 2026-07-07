import React from 'react';
import { cn } from '../../lib/utils';
import { Song } from '../../types';

interface NowPlayingViewProps {
  isDarkMode: boolean;
  currentSong: Song | null;
  progress: number;
  currentTime: number;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({ isDarkMode, currentSong, progress, currentTime }) => {

  const title = currentSong?.title || 'No Song Playing';
  const artist = currentSong?.artist || 'Unknown Artist';
  const album = currentSong?.album || 'Unknown Album';
  const coverArt = currentSong?.coverArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200';
  
  // Calculate remaining time if duration is available, else just show progress
  // Since we don't have duration in props easily, we'll just show current time for now
  // We can pass duration down or just format it
  const duration = (currentTime / (progress / 100)) || 0;
  const remainingTime = duration ? duration - currentTime : 0;

  return (
    <div className={cn(
      "w-full h-full flex flex-col p-2",
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      <div className="flex-1 flex pt-2 px-1 gap-3">
        {/* Album Art */}
        <div className="w-[100px] h-[100px] shadow-[0_2px_10px_rgba(0,0,0,0.5)] shrink-0 bg-gray-200">
          <img 
            src={coverArt} 
            alt="Album Art" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 flex flex-col pt-1 min-w-0">
          <div className="text-[14px] font-bold truncate tracking-tight">{title}</div>
          <div className="text-[12px] font-semibold opacity-80 truncate tracking-tight mt-0.5">{artist}</div>
          <div className="text-[12px] opacity-60 truncate tracking-tight mt-0.5">{album}</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-[24px] w-full px-2 flex flex-col justify-center">
        <div className={cn(
          "w-full h-2 rounded-full overflow-hidden border",
          isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-400 bg-gray-200"
        )}>
          <div 
            className={cn("h-full", isDarkMode ? "bg-blue-400" : "bg-blue-500")} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between text-[9px] font-medium opacity-60 mt-0.5 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? `-${formatTime(remainingTime)}` : ''}</span>
        </div>
      </div>
    </div>
  );
};
