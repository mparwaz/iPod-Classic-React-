import React from 'react';
import { Menu, MenuItem, Song } from '../../types';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnalyticsView } from './AnalyticsView';
import { SearchView } from './SearchView';
import { NowPlayingView } from './NowPlayingView';
import { VolumeLimitView } from './VolumeLimitView';
import { PodcastEpisodesView } from './PodcastEpisodesView';

interface MenuViewProps {
  menu: Menu;
  selectedIndex: number;
  isDarkMode: boolean;
  currentSong?: Song | null;
  progress?: number;
  currentTime?: number;
  librarySize?: number;
  volumeLimit?: number;
  onSearchSelect?: (song: Song) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ 
  menu, 
  selectedIndex, 
  isDarkMode, 
  currentSong, 
  progress, 
  currentTime,
  librarySize,
  volumeLimit = 100,
  onSearchSelect
}) => {
  const selectedItem = menu.items[selectedIndex];
  
  // If the menu has exactly 1 item and it's custom or search, render it full screen
  if (menu.items.length === 1 && (menu.items[0].type === 'custom' || menu.items[0].type === 'search')) {
    return (
      <div className={cn(
        "w-full h-[216px] overflow-hidden",
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      )}>
        {menu.items[0].id === 'chart' && <AnalyticsView isDarkMode={isDarkMode} />}
        {menu.items[0].id === 'volume_limit_view' && <VolumeLimitView isDarkMode={isDarkMode} volumeLimit={volumeLimit} />}
        {menu.items[0].id === 'search_view' && onSearchSelect && <SearchView isDarkMode={isDarkMode} mode="music" onSelectSong={onSearchSelect} />}
        {menu.items[0].id === 'search_podcasts_view' && onSearchSelect && <SearchView isDarkMode={isDarkMode} mode="podcast" onSelectSong={onSearchSelect} />}
        {menu.items[0].id.startsWith('podcast_episodes_view_') && onSearchSelect && (
          <PodcastEpisodesView 
            isDarkMode={isDarkMode} 
            podcastUrl={menu.items[0].value as string} 
            podcastTitle={menu.title} 
            podcastArt={menu.items[0].image}
            onSelectEpisode={onSearchSelect} 
          />
        )}
        {menu.items[0].id === 'np_view' && (
          <NowPlayingView 
            isDarkMode={isDarkMode} 
            currentSong={currentSong || null} 
            progress={progress || 0} 
            currentTime={currentTime || 0} 
          />
        )}
      </div>
    );
  }

  // Decide if this menu should be split screen (has items with images)
  const isSplitScreen = menu.items.some(item => item.image);

  return (
    <div className={cn(
      "w-full h-[216px] flex overflow-hidden",
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Left List Pane (or full width if not split) */}
      <div className={cn(
        "h-full overflow-hidden flex flex-col pt-0.5",
        isSplitScreen ? "w-1/2 shrink-0 border-r border-gray-300 dark:border-gray-700" : "w-full"
      )}>
        {menu.items.map((item, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <div
              key={item.id}
              className={cn(
                "w-full h-[22px] px-1.5 flex items-center justify-between shrink-0",
                isSelected && (isDarkMode 
                  ? "bg-gradient-to-b from-[#444] to-[#222] text-white" 
                  : "bg-gradient-to-b from-[#509ff1] to-[#186fee] text-white")
              )}
            >
              <span className={cn(
                "font-semibold text-[13px] truncate flex-1 min-w-0 tracking-tight",
                !isSelected && (isDarkMode ? "text-gray-100" : "text-black")
              )}>
                {item.label}
              </span>
              
              <div className="flex items-center pl-1 shrink-0">
                {(item.type === 'info' || item.value) && (
                  <span className={cn(
                    "text-[12px] font-medium mr-1",
                    !isSelected && (isDarkMode ? "text-gray-300" : "text-gray-600")
                  )}>
                    {item.value}
                  </span>
                )}
                
                {item.type === 'toggle' && (
                  <span className={cn(
                    "text-[12px] font-bold mr-1",
                    !isSelected && (isDarkMode ? "text-gray-300" : "text-gray-600")
                  )}>
                    {item.value ? 'On' : 'Off'}
                  </span>
                )}

                {item.hasChevron && (
                  <ChevronRight className={cn(
                    "w-3.5 h-3.5",
                    isSelected ? "text-white" : (isDarkMode ? "text-gray-300" : "text-black")
                  )} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Content Pane (Image or Custom View) */}
      {isSplitScreen && (
        <div className="w-1/2 shrink-0 h-full bg-black relative">
          {selectedItem?.id === 'settings' ? (
            <div className="w-full h-full flex flex-col items-center justify-between py-2.5 bg-gradient-to-b from-[#5c6d86] to-[#252f40] text-white overflow-hidden shrink-0">
              <div className="font-semibold text-[12px] tracking-tight">User's iPod</div>
              
              <div className="flex-1 flex items-center justify-center">
                {/* Apple Logo SVG */}
                <svg viewBox="0 0 384 512" className="w-10 h-10 fill-current opacity-90">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
              </div>
          
              <div className="w-full px-3 flex flex-col items-center gap-1 shrink-0">
                <div className="w-[100px] h-[10px] bg-gray-400/30 rounded-[1px] border border-gray-500/50 overflow-hidden shadow-inner">
                  <div className="h-full bg-white" style={{ width: `${Math.min(100, 15 + (librarySize || 0) * 2)}%` }} />
                </div>
                <div className="font-semibold text-[10px] tracking-tight whitespace-nowrap">
                  {Math.max(0, 148 - (librarySize || 0) * 0.05).toFixed(1)} GB Free
                </div>
              </div>
            </div>
          ) : selectedItem?.image ? (
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-300"
              style={{ 
                backgroundImage: `url(${
                  ['music', 'shuffle', 'nowplaying'].includes(selectedItem.id) 
                    ? (currentSong?.coverArt || selectedItem.image) 
                    : selectedItem.image
                })` 
              }}
            />
          ) : (
            // Default gradient background for right pane if no image
            <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#111]" />
          )}
        </div>
      )}
    </div>
  );
};
