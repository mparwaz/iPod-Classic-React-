import React from 'react';

export type MenuItemType = 'menu' | 'action' | 'info' | 'toggle' | 'custom' | 'search';

export interface MenuItem {
  id: string;
  label: string;
  type: MenuItemType;
  target?: string; // Target menu id if type is 'menu'
  hasChevron?: boolean;
  image?: string; // Image URL for the right pane
  value?: string | boolean; // For info or toggle types
  action?: () => void;
  CustomComponent?: React.FC;
}

export interface Menu {
  id: string;
  title: string;
  items: MenuItem[];
}

export type DeviceColor = 'silver' | 'black' | 'red' | 'blue' | 'gold' | 'purple' | 'green';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  url: string;
  coverArt?: string;
  duration: number;
  source?: 'local' | 'stream';
  streamId?: string;
  mediaType?: 'audio' | 'video' | 'podcast' | 'podcast_show';
}

export interface IpodState {
  menuHistory: string[]; // Stack of menu IDs
  currentMenuId: string;
  selectedIndex: number;
  scrollDirection: 'up' | 'down' | null;
  isDarkMode: boolean;
  batteryLevel: number;
  isPlaying: boolean;
  deviceColor: DeviceColor;
  library: Song[];
  currentSong: Song | null;
  progress: number; // 0 to 100
  currentTime: number; // in seconds
  brightness: number;
  volumeLimit: number;
}

export type IpodAction = 
  | { type: 'SCROLL'; payload: { direction: 1 | -1 } }
  | { type: 'SELECT' }
  | { type: 'MENU_BACK' }
  | { type: 'TOGGLE_PLAY_PAUSE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'RESET_SCROLL_DIRECTION' };

