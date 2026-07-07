import { Menu } from '../types';

const defaultImage = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
const clockImage = 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=400&h=400';
const gameImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400&h=400';
const contactsImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400';
const calendarImage = 'https://images.unsplash.com/photo-1506784918456-659f81a7d656?auto=format&fit=crop&q=80&w=400&h=400';
const notesImage = 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400&h=400';
const stopwatchImage = 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&q=80&w=400&h=400';
const lockImage = 'https://images.unsplash.com/photo-1614064641913-a520faff3f8b?auto=format&fit=crop&q=80&w=400&h=400';
const musicImage = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400';
const videoImage = 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?auto=format&fit=crop&q=80&w=400&h=400';
const photoImage = 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&q=80&w=400&h=400';
const podcastImage = 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?auto=format&fit=crop&q=80&w=400&h=400';
const settingsImage = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=400';
const uploadImage = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400&h=400';

export const menus: Record<string, Menu> = {
  root: {
    id: 'root',
    title: 'iPod',
    items: [
      { id: 'music', label: 'Music', type: 'menu', target: 'music', hasChevron: true, image: musicImage },
      { id: 'videos', label: 'Videos', type: 'menu', target: 'videos', hasChevron: true, image: videoImage },
      { id: 'photos', label: 'Photos', type: 'menu', target: 'photos', hasChevron: true, image: photoImage },
      { id: 'podcasts', label: 'Podcasts', type: 'menu', target: 'podcasts', hasChevron: true, image: podcastImage },
      { id: 'extras', label: 'Extras', type: 'menu', target: 'extras', hasChevron: true, image: clockImage },
      { id: 'settings', label: 'Settings', type: 'menu', target: 'settings', hasChevron: true, image: settingsImage },
      { id: 'search', label: 'Search', type: 'menu', target: 'search', hasChevron: true, image: musicImage },
      { id: 'shuffle', label: 'Shuffle Songs', type: 'action', image: musicImage },
      { id: 'nowplaying', label: 'Now Playing', type: 'menu', target: 'nowplaying', hasChevron: true, image: defaultImage },
    ]
  },
  music: {
    id: 'music',
    title: 'Music',
    items: [
      { id: 'upload_music', label: 'Upload Music (PC/Mobile)', type: 'action', image: uploadImage },
      { id: 'playlists', label: 'Playlists', type: 'menu', target: 'playlists', hasChevron: true, image: musicImage },
      { id: 'artists', label: 'Artists', type: 'menu', target: 'artists', hasChevron: true, image: musicImage },
      { id: 'albums', label: 'Albums', type: 'menu', target: 'albums', hasChevron: true, image: musicImage },
      { id: 'songs', label: 'Songs', type: 'menu', target: 'songs', hasChevron: true, image: musicImage },
    ]
  },
  extras: {
    id: 'extras',
    title: 'Extras',
    items: [
      { id: 'clocks', label: 'Clocks', type: 'menu', target: 'clocks', hasChevron: true, image: clockImage },
      { id: 'games', label: 'Games', type: 'menu', target: 'games', hasChevron: true, image: gameImage },
      { id: 'contacts', label: 'Contacts', type: 'menu', target: 'contacts', hasChevron: true, image: contactsImage },
      { id: 'calendar', label: 'Calendar', type: 'menu', target: 'calendar', hasChevron: true, image: calendarImage },
      { id: 'notes', label: 'Notes', type: 'menu', target: 'notes', hasChevron: true, image: notesImage },
      { id: 'stopwatch', label: 'Stopwatch', type: 'menu', target: 'stopwatch', hasChevron: true, image: stopwatchImage },
      { id: 'screen_lock', label: 'Screen Lock', type: 'menu', target: 'screen_lock', hasChevron: true, image: lockImage },
    ]
  },
  clocks: { id: 'clocks', title: 'Clocks', items: [{ id: 'clock_view', label: 'Clock', type: 'info', value: '12:00 PM', image: clockImage }] },
  games: { id: 'games', title: 'Games', items: [{ id: 'brick', label: 'Brick', type: 'action', image: gameImage }, { id: 'parachute', label: 'Parachute', type: 'action', image: gameImage }, { id: 'solitaire', label: 'Solitaire', type: 'action', image: gameImage }] },
  contacts: { id: 'contacts', title: 'Contacts', items: [{ id: 'empty_contacts', label: 'No Contacts', type: 'info', image: contactsImage }] },
  calendar: { id: 'calendar', title: 'Calendar', items: [{ id: 'empty_calendar', label: 'No Events', type: 'info', image: calendarImage }] },
  notes: { id: 'notes', title: 'Notes', items: [{ id: 'empty_notes', label: 'No Notes', type: 'info', image: notesImage }] },
  stopwatch: { id: 'stopwatch', title: 'Stopwatch', items: [{ id: 'sw_time', label: '00:00.00', type: 'info', image: stopwatchImage }] },
  screen_lock: { id: 'screen_lock', title: 'Screen Lock', items: [{ id: 'lock_btn', label: 'Lock', type: 'action', image: lockImage }] },
  videos: { 
    id: 'videos', 
    title: 'Videos', 
    items: [
      { id: 'movies', label: 'Movies', type: 'menu', target: 'movies', hasChevron: true, image: videoImage },
      { id: 'rentals', label: 'Rentals', type: 'menu', target: 'rentals', hasChevron: true, image: videoImage },
      { id: 'tv_shows', label: 'TV Shows', type: 'menu', target: 'tv_shows', hasChevron: true, image: videoImage },
      { id: 'music_videos', label: 'Music Videos', type: 'menu', target: 'music_videos', hasChevron: true, image: videoImage },
      { id: 'video_playlists', label: 'Video Playlists', type: 'menu', target: 'video_playlists', hasChevron: true, image: videoImage },
      { id: 'video_settings', label: 'Settings', type: 'menu', target: 'video_settings', hasChevron: true, image: settingsImage },
      { id: 'upload_video', label: 'Upload Video', type: 'action', image: uploadImage },
      { id: 'no_videos', label: 'No Videos Uploaded', type: 'info', image: videoImage }
    ] 
  },
  movies: { id: 'movies', title: 'Movies', items: [{ id: 'no_movies', label: 'No Movies', type: 'info', image: videoImage }] },
  rentals: { id: 'rentals', title: 'Rentals', items: [{ id: 'no_rentals', label: 'No Rentals', type: 'info', image: videoImage }] },
  tv_shows: { id: 'tv_shows', title: 'TV Shows', items: [{ id: 'no_tv_shows', label: 'No TV Shows', type: 'info', image: videoImage }] },
  music_videos: { id: 'music_videos', title: 'Music Videos', items: [{ id: 'no_music_videos', label: 'No Music Videos', type: 'info', image: videoImage }] },
  video_playlists: { id: 'video_playlists', title: 'Video Playlists', items: [{ id: 'no_v_playlists', label: 'No Video Playlists', type: 'info', image: videoImage }] },
  video_settings: { id: 'video_settings', title: 'Video Settings', items: [{ id: 'tv_out', label: 'TV Out', type: 'toggle', value: 'Off', image: settingsImage }] },
  search: {
    id: 'search',
    title: 'Search Music',
    items: [
      { id: 'search_view', label: 'Search iTunes', type: 'search' }
    ]
  },
  photos: { id: 'photos', title: 'Photos', items: [{ id: 'no_photos', label: 'No Photos', type: 'info', image: photoImage }] },
  podcasts: {
    id: 'podcasts',
    title: 'Podcasts',
    items: [
      { id: 'search_podcasts_view', label: 'Search Podcasts', type: 'search' }
    ]
  },
  nowplaying: {
    id: 'nowplaying',
    title: 'Now Playing',
    items: [
      { id: 'np_view', label: 'Now Playing', type: 'custom' }
    ]
  },
  playlists: { id: 'playlists', title: 'Playlists', items: [{ id: 'no_playlists', label: 'No Playlists', type: 'info', image: musicImage }] },
  artists: { id: 'artists', title: 'Artists', items: [{ id: 'no_artists', label: 'No Artists', type: 'info', image: musicImage }] },
  albums: { id: 'albums', title: 'Albums', items: [{ id: 'no_albums', label: 'No Albums', type: 'info', image: musicImage }] },
  songs: { id: 'songs', title: 'Songs', items: [{ id: 'no_songs', label: 'No Songs Uploaded', type: 'info', image: musicImage }] },
  settings: {
    id: 'settings',
    title: 'Settings',
    items: [
      { id: 'about', label: 'About', type: 'menu', target: 'about', hasChevron: true, image: settingsImage },
      { id: 'manage_library', label: 'Manage Storage', type: 'menu', target: 'manage_library', hasChevron: true, image: settingsImage },
      { id: 'appearance', label: 'Appearance', type: 'menu', target: 'appearance', hasChevron: true, image: settingsImage },
      { id: 'volume_limit', label: 'Volume Limit', type: 'menu', target: 'volume_limit', hasChevron: true, image: settingsImage },
      { id: 'device_color', label: 'Device Color', type: 'menu', target: 'device_color', hasChevron: true, image: settingsImage },
      { id: 'analytics', label: 'Analytics', type: 'menu', target: 'analytics', hasChevron: true, image: settingsImage },
      { id: 'backlight', label: 'Backlight Timer', type: 'info', value: '10 Seconds', image: settingsImage },
      { id: 'brightness', label: 'Brightness', type: 'menu', target: 'brightness', hasChevron: true, value: 'High', image: settingsImage },
    ]
  },
  manage_library: {
    id: 'manage_library',
    title: 'Storage',
    items: [
      { id: 'no_songs', label: 'Library Empty', type: 'info', image: settingsImage }
    ]
  },
  brightness: {
    id: 'brightness',
    title: 'Brightness',
    items: [
      { id: 'bright_30', label: 'Low', type: 'action', image: settingsImage },
      { id: 'bright_60', label: 'Medium', type: 'action', image: settingsImage },
      { id: 'bright_100', label: 'High', type: 'action', image: settingsImage },
    ]
  },
  volume_limit: {
    id: 'volume_limit',
    title: 'Volume Limit',
    items: [
      { id: 'volume_limit_view', label: 'Volume Limit', type: 'custom' }
    ]
  },
  about: {
    id: 'about',
    title: 'About',
    items: [
      { id: 'fw', label: 'Version', value: '2.0.4 (Mac)', type: 'info', image: settingsImage },
      { id: 'model', label: 'Model', value: 'MC297LL', type: 'info', image: settingsImage },
      { id: 'format', label: 'Format', value: 'Macintosh', type: 'info', image: settingsImage },
      { id: 'capacity', label: 'Capacity', value: '148 GB', type: 'info', image: settingsImage },
      { id: 'available', label: 'Available', value: '140 GB', type: 'info', image: settingsImage },
      { id: 'songs_count', label: 'Songs', value: '0', type: 'info', image: settingsImage },
    ]
  },
  appearance: {
    id: 'appearance',
    title: 'Appearance',
    items: [
      { id: 'dark_mode', label: 'Dark Mode', type: 'toggle', value: false, image: settingsImage },
    ]
  },
  device_color: {
    id: 'device_color',
    title: 'Device Color',
    items: [
      { id: 'color_silver', label: 'Silver', type: 'action', image: defaultImage },
      { id: 'color_black', label: 'Charcoal Black', type: 'action', image: defaultImage },
      { id: 'color_red', label: 'Product(RED)', type: 'action', image: defaultImage },
      { id: 'color_blue', label: 'Blue', type: 'action', image: defaultImage },
      { id: 'color_gold', label: 'Gold', type: 'action', image: defaultImage },
      { id: 'color_purple', label: 'Purple', type: 'action', image: defaultImage },
      { id: 'color_green', label: 'Green', type: 'action', image: defaultImage },
    ]
  },
  analytics: {
    id: 'analytics',
    title: 'Analytics',
    items: [
      { id: 'chart', label: 'System Usage', type: 'custom' }
    ]
  }
};
