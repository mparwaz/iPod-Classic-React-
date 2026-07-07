import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Song } from '../types';
import { TopBar } from './TopBar';
import { MenuView } from './views/MenuView';
import { cn } from '../lib/utils';

interface ScreenProps {
  currentMenu: Menu;
  selectedIndex: number;
  scrollDirection: 'up' | 'down' | null;
  isPlaying: boolean;
  batteryLevel: number;
  isDarkMode: boolean;
  navDirection: 'forward' | 'backward' | 'none';
  currentSong: Song | null;
  progress: number;
  currentTime: number;
  librarySize?: number;
  volumeLimit?: number;
  onSearchSelect?: (song: Song) => void;
}

export const Screen: React.FC<ScreenProps> = ({
  currentMenu,
  selectedIndex,
  isPlaying,
  batteryLevel,
  isDarkMode,
  navDirection,
  currentSong,
  progress,
  currentTime,
  librarySize,
  volumeLimit,
  onSearchSelect,
}) => {
  
  const variants = {
    enter: (direction: 'forward' | 'backward' | 'none') => {
      if (direction === 'none') return { x: 0, opacity: 1 };
      return {
        x: direction === 'forward' ? '100%' : '-100%',
        opacity: 1,
      };
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward' | 'none') => {
      if (direction === 'none') return { x: 0, opacity: 1 };
      return {
        x: direction === 'forward' ? '-100%' : '100%',
        opacity: 1,
      };
    }
  };

  return (
    <div className={cn(
      "w-full h-full overflow-hidden flex flex-col relative select-none",
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      <TopBar 
        title={currentMenu.title} 
        isPlaying={isPlaying} 
        batteryLevel={batteryLevel}
        isDarkMode={isDarkMode}
      />
      
      <div className="relative w-full h-[216px] overflow-hidden">
        <AnimatePresence initial={false} custom={navDirection}>
          <motion.div
            key={currentMenu.id}
            custom={navDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 40 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <MenuView 
              menu={currentMenu} 
              selectedIndex={selectedIndex} 
              isDarkMode={isDarkMode}
              currentSong={currentSong}
              progress={progress}
              currentTime={currentTime}
              librarySize={librarySize}
              volumeLimit={volumeLimit}
              onSearchSelect={onSearchSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
