import React, { useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { tick } from '../lib/audio';

interface ClickWheelProps {
  onRotate: (direction: 1 | -1) => void;
  onCenterClick: () => void;
  onMenuClick: () => void;
  onPlayPauseClick: () => void;
  onNextClick: () => void;
  onPrevClick: () => void;
  wheelColorClass?: string;
  textColorClass?: string;
}

export const ClickWheel: React.FC<ClickWheelProps> = ({
  onRotate,
  onCenterClick,
  onMenuClick,
  onPlayPauseClick,
  onNextClick,
  onPrevClick,
  wheelColorClass = 'bg-gradient-to-br from-[#dcdcdc] to-[#f0f0f0]',
  textColorClass = 'text-[#b0b0b0]',
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [lastAngle, setLastAngle] = useState<number | null>(null);

  const calculateAngle = (x: number, y: number) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(y - cy, x - cx);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setLastAngle(calculateAngle(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (lastAngle === null) return;
    
    let currentAngle = calculateAngle(e.clientX, e.clientY);
    let diff = currentAngle - lastAngle;

    // Adjust for wraparound
    if (diff > Math.PI) diff -= 2 * Math.PI;
    else if (diff < -Math.PI) diff += 2 * Math.PI;

    // Threshold for registering a scroll tick
    const SENSITIVITY_THRESHOLD = 0.3; // radians
    
    if (Math.abs(diff) > SENSITIVITY_THRESHOLD) {
      const direction = diff > 0 ? 1 : -1;
      onRotate(direction);
      tick();
      setLastAngle(currentAngle);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setLastAngle(null);
  };

  return (
    <div 
      className={cn(
        "relative w-[240px] h-[240px] rounded-full border select-none touch-none",
        "shadow-[inset_0_-2px_10px_rgba(0,0,0,0.3),_inset_0_2px_10px_rgba(255,255,255,0.3)] border-[#e0e0e0]",
        wheelColorClass.includes('from-[#111111]') ? 'bg-[#181818] border-black' : 'bg-[#f2f2f2]'
      )}
      ref={wheelRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* MENU button */}
      <div 
        className={cn("absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 cursor-pointer font-bold active:text-[#888] text-[13px] tracking-widest", textColorClass)}
        onClick={(e) => { e.stopPropagation(); tick(); onMenuClick(); }}
      >
        MENU
      </div>

      {/* Play/Pause button */}
      <div 
        className={cn("absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 cursor-pointer font-bold active:text-[#888] text-[13px] tracking-widest flex items-center justify-center space-x-0.5", textColorClass)}
        onClick={(e) => { e.stopPropagation(); tick(); onPlayPauseClick(); }}
      >
        <span>▶</span><span className="text-[10px]">||</span>
      </div>

      {/* Prev button */}
      <div 
        className={cn("absolute left-3 top-1/2 -translate-y-1/2 px-2 py-4 cursor-pointer font-bold active:text-[#888] text-[13px] tracking-tighter", textColorClass)}
        onClick={(e) => { e.stopPropagation(); tick(); onPrevClick(); }}
      >
        |◀
      </div>

      {/* Next button */}
      <div 
        className={cn("absolute right-3 top-1/2 -translate-y-1/2 px-2 py-4 cursor-pointer font-bold active:text-[#888] text-[13px] tracking-tighter", textColorClass)}
        onClick={(e) => { e.stopPropagation(); tick(); onNextClick(); }}
      >
        ▶|
      </div>

      {/* Center Button */}
      <div 
        className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84px] h-[84px] rounded-full shadow-md border border-[#ccc] cursor-pointer",
          wheelColorClass
        )}
        onClick={(e) => { e.stopPropagation(); tick(); onCenterClick(); }}
      />
    </div>
  );
};
