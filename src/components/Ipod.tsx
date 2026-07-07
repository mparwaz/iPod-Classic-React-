import React, { useState, useEffect, useRef } from 'react';
import { Screen } from './Screen';
import { ClickWheel } from './ClickWheel';
import { menus } from '../data/menus';
import { IpodState, DeviceColor, Song } from '../types';
import { getLibrary, saveSong, deleteSong } from '../lib/db';

const colorStyles: Record<DeviceColor, { body: string; wheel: string; text: string }> = {
  silver: {
    body: 'linear-gradient(135deg, #e6e6e6 0%, #ffffff 25%, #c5c5c5 50%, #f0f0f0 75%, #b3b3b3 100%)',
    wheel: 'bg-gradient-to-br from-[#ffffff] to-[#f5f5f5]',
    text: 'text-[#a0a0a0]'
  },
  black: {
    body: 'linear-gradient(135deg, #2a2a2a 0%, #444444 25%, #1a1a1a 50%, #333333 75%, #000000 100%)',
    wheel: 'bg-gradient-to-br from-[#111111] to-[#222222]',
    text: 'text-[#666666]'
  },
  red: {
    body: 'linear-gradient(135deg, #cc0000 0%, #ff3333 25%, #990000 50%, #e60000 75%, #660000 100%)',
    wheel: 'bg-gradient-to-br from-[#111111] to-[#222222]',
    text: 'text-[#555555]'
  },
  blue: {
    body: 'linear-gradient(135deg, #0055aa 0%, #3388ff 25%, #003366 50%, #004488 75%, #001133 100%)',
    wheel: 'bg-gradient-to-br from-[#ffffff] to-[#f5f5f5]',
    text: 'text-[#a0a0a0]'
  },
  gold: {
    body: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 25%, #aa8000 50%, #c5a017 75%, #806000 100%)',
    wheel: 'bg-gradient-to-br from-[#ffffff] to-[#f5f5f5]',
    text: 'text-[#a0a0a0]'
  },
  purple: {
    body: 'linear-gradient(135deg, #660099 0%, #9933ff 25%, #440066 50%, #7711aa 75%, #220033 100%)',
    wheel: 'bg-gradient-to-br from-[#ffffff] to-[#f5f5f5]',
    text: 'text-[#a0a0a0]'
  },
  green: {
    body: 'linear-gradient(135deg, #008800 0%, #33cc33 25%, #005500 50%, #00aa00 75%, #003300 100%)',
    wheel: 'bg-gradient-to-br from-[#ffffff] to-[#f5f5f5]',
    text: 'text-[#a0a0a0]'
  }
};

export const Ipod: React.FC = () => {
  const [state, setState] = useState<IpodState>({
    menuHistory: ['root'],
    currentMenuId: 'root',
    selectedIndex: 0,
    scrollDirection: null,
    isDarkMode: false,
    batteryLevel: 85,
    isPlaying: false,
    deviceColor: 'silver',
    library: [],
    currentSong: null,
    progress: 0,
    currentTime: 0,
    brightness: 100,
    volumeLimit: 100,
  });
  
  const [navDirection, setNavDirection] = useState<'forward' | 'backward' | 'none'>('none');
  const [mutableMenus, setMutableMenus] = useState(menus);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const [isYtReady, setIsYtReady] = useState(false);

  const activeMenu = mutableMenus[state.currentMenuId] || mutableMenus.root;

  useEffect(() => {
    // Load YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        ytPlayerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '1',
          width: '1',
          playerVars: { autoplay: 1, controls: 0, playsinline: 1, origin: window.location.origin },
          events: {
            onReady: () => {
               setIsYtReady(true);
            },
            onStateChange: (e: any) => {
              if (e.data === (window as any).YT.PlayerState.ENDED) {
                handleNextClick();
              } else if (e.data === (window as any).YT.PlayerState.CUED) {
                e.target.playVideo();
              }
            },
            onError: (e: any) => {
               console.error("YouTube Player Error", e);
               // Try to move to next track if there is a fatal error
               handleNextClick();
            }
          }
        });
      };
    }

    getLibrary().then((loadedLibrary) => {
      setState(prev => ({ ...prev, library: loadedLibrary }));
    }).catch(console.error);
  }, []);

  // Drain battery slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        batteryLevel: Math.max(0, prev.batteryLevel - 1)
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update about stats when library changes
  useEffect(() => {
    setMutableMenus(prev => {
      const newMenus = { ...prev };
      const aboutMenu = newMenus['about'];
      if (aboutMenu) {
        const songsIndex = aboutMenu.items.findIndex(i => i.id === 'songs_count');
        if (songsIndex !== -1) {
          aboutMenu.items[songsIndex] = { ...aboutMenu.items[songsIndex], value: state.library.length.toString() };
        }
      }
      
      const audioSongs = state.library.filter(s => s.mediaType !== 'video' && s.mediaType !== 'podcast' && s.mediaType !== 'podcast_show');
      const videoSongs = state.library.filter(s => s.mediaType === 'video');

      const songsMenu = newMenus['songs'];
      if (songsMenu) {
        if (audioSongs.length > 0) {
          songsMenu.items = audioSongs.map(song => ({
            id: `song_${song.id}`,
            label: song.title,
            type: 'action',
            image: song.coverArt || 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=400&h=400'
          }));
        } else {
          songsMenu.items = [{ id: 'no_songs', label: 'No Songs Uploaded', type: 'info', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=400&h=400' }];
        }
      }

      const moviesMenu = newMenus['movies'];
      if (moviesMenu) {
        if (videoSongs.length > 0) {
          moviesMenu.items = videoSongs.map(video => ({
            id: `video_${video.id}`,
            label: video.title,
            type: 'action',
            image: video.coverArt || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400&h=400'
          }));
        } else {
          moviesMenu.items = [{ id: 'no_movies', label: 'No Movies', type: 'info', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400&h=400' }];
        }
      }
      
      const storageMenu = newMenus['manage_library'];
      if (storageMenu) {
         if (state.library.length > 0) {
            storageMenu.items = state.library.map(media => ({
               id: `delete_${media.id}`,
               label: `Delete: ${media.title}`,
               type: 'action',
               image: media.coverArt || 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=400&h=400'
            }));
         } else {
            storageMenu.items = [{ id: 'no_songs', label: 'Library Empty', type: 'info', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=400' }];
         }
      }
      
      const podcastShows = state.library.filter(s => s.mediaType === 'podcast_show');
      const podcastsMenu = newMenus['podcasts'];
      if (podcastsMenu) {
        const searchItem = podcastsMenu.items.find(i => i.id === 'search_podcasts_link');
        const showItems = podcastShows.map(show => ({
          id: `menu_podcast_${show.id}`,
          label: show.title,
          type: 'menu' as const,
          target: `podcast_${show.id}`,
          hasChevron: true,
          image: show.coverArt || 'https://images.unsplash.com/photo-1593697972679-c4041d132a46?auto=format&fit=crop&q=80&w=400&h=400'
        }));
        podcastsMenu.items = searchItem ? [searchItem, ...showItems] : showItems;

        podcastShows.forEach(show => {
           newMenus[`podcast_${show.id}`] = {
             id: `podcast_${show.id}`,
             title: show.title,
             items: [
               { 
                 id: `podcast_episodes_view_${show.id}`, 
                 label: 'Episodes', 
                 type: 'custom', 
                 value: show.url, 
                 image: show.coverArt 
               }
             ]
           };
        });
      }

      return newMenus;
    });
  }, [state.library]);

  const handleRotate = (direction: 1 | -1) => {
    if (activeMenu.items.length === 1 && activeMenu.items[0].id === 'volume_limit_view') {
      setState(prev => {
        const newVol = Math.max(0, Math.min(100, (prev.volumeLimit || 100) + direction * 5));
        if (audioRef.current) {
          audioRef.current.volume = newVol / 100;
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(newVol);
        }
        return { ...prev, volumeLimit: newVol };
      });
      return;
    }

    if (activeMenu.items.length === 1 && activeMenu.items[0].id === 'np_view') {
      const seekAmount = 5 * direction;
      if (state.currentSong?.source === 'stream' && state.currentSong?.mediaType !== 'podcast' && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        const currentTime = ytPlayerRef.current.getCurrentTime() || 0;
        const duration = ytPlayerRef.current.getDuration() || 0;
        const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount));
        ytPlayerRef.current.seekTo(newTime, true);
        setState(prev => ({ ...prev, currentTime: newTime }));
      } else if (audioRef.current) {
        const currentTime = audioRef.current.currentTime || 0;
        const duration = audioRef.current.duration || 0;
        if (!isNaN(duration)) {
           const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount));
           audioRef.current.currentTime = newTime;
           setState(prev => ({ ...prev, currentTime: newTime }));
        }
      }
      return;
    }

    if (activeMenu.items.length === 1 && (activeMenu.items[0].id === 'search_view' || activeMenu.items[0].id === 'search_podcasts_view' || activeMenu.items[0].id.startsWith('podcast_episodes_view_'))) {
      const event = new KeyboardEvent('keydown', { key: direction === 1 ? 'ArrowDown' : 'ArrowUp' });
      window.dispatchEvent(event);
      return;
    }

    setState(prev => {
      const itemsCount = activeMenu.items.length;
      if (itemsCount === 0) return prev;
      
      let nextIndex = prev.selectedIndex + direction;
      // Clamp index
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= itemsCount) nextIndex = itemsCount - 1;
      
      return {
        ...prev,
        selectedIndex: nextIndex,
        scrollDirection: direction === 1 ? 'down' : 'up'
      };
    });
  };

  const handleCenterClick = () => {
    if (activeMenu.items.length === 1 && activeMenu.items[0].id === 'volume_limit_view') {
      handleMenuClick();
      return;
    }

    if (activeMenu.items.length === 1 && (activeMenu.items[0].id === 'search_view' || activeMenu.items[0].id === 'search_podcasts_view' || activeMenu.items[0].id.startsWith('podcast_episodes_view_'))) {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);
      return;
    }

    const selectedItem = activeMenu.items[state.selectedIndex];
    if (!selectedItem) return;

    if (selectedItem.type === 'menu' && selectedItem.target) {
      setNavDirection('forward');
      setState(prev => ({
        ...prev,
        menuHistory: [...prev.menuHistory, selectedItem.target!],
        currentMenuId: selectedItem.target!,
        selectedIndex: 0,
      }));
    } else if (selectedItem.type === 'toggle') {
      if (selectedItem.id === 'dark_mode') {
        const newValue = !state.isDarkMode;
        setState(prev => ({ ...prev, isDarkMode: newValue }));
        setMutableMenus(prev => {
          const newMenus = { ...prev };
          const appearanceMenu = newMenus['appearance'];
          const dmIndex = appearanceMenu.items.findIndex(i => i.id === 'dark_mode');
          if (dmIndex !== -1) {
             appearanceMenu.items[dmIndex] = { ...appearanceMenu.items[dmIndex], value: newValue };
          }
          return newMenus;
        });
      }
    } else if (selectedItem.type === 'action') {
      if (selectedItem.id === 'upload_music') {
        fileInputRef.current?.click();
      } else if (selectedItem.id === 'upload_video') {
        videoInputRef.current?.click();
      } else if (selectedItem.id.startsWith('bright_')) {
        const val = parseInt(selectedItem.id.replace('bright_', ''));
        const label = selectedItem.label;
        setState(prev => ({ ...prev, brightness: val }));
        
        setMutableMenus(prev => {
          const newMenus = { ...prev };
          const settingsMenu = newMenus['settings'];
          if (settingsMenu) {
            newMenus['settings'] = {
              ...settingsMenu,
              items: settingsMenu.items.map(item => 
                item.id === 'brightness' ? { ...item, value: label } : item
              )
            };
          }
          return newMenus;
        });
      } else if (selectedItem.id.startsWith('vol_')) {
        const val = parseInt(selectedItem.id.replace('vol_', ''));
        const label = selectedItem.label;
        if (audioRef.current) {
          audioRef.current.volume = val / 100;
        }
        
        setMutableMenus(prev => {
          const newMenus = { ...prev };
          const settingsMenu = newMenus['settings'];
          if (settingsMenu) {
            newMenus['settings'] = {
              ...settingsMenu,
              items: settingsMenu.items.map(item => 
                item.id === 'volume_limit' ? { ...item, value: label } : item
              )
            };
          }
          return newMenus;
        });
      } else if (selectedItem.id.startsWith('color_')) {
        const color = selectedItem.id.replace('color_', '') as DeviceColor;
        setState(prev => ({ ...prev, deviceColor: color }));
      } else if (selectedItem.id.startsWith('delete_')) {
        const songId = selectedItem.id.replace('delete_', '');
        deleteSong(songId).then(() => {
          setState(prev => {
            const newLibrary = prev.library.filter(s => s.id !== songId);
            const isPlayingDeleted = prev.currentSong?.id === songId;
            if (isPlayingDeleted) {
              if (audioRef.current) audioRef.current.pause();
              if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
            }
            return {
              ...prev,
              library: newLibrary,
              currentSong: isPlayingDeleted ? null : prev.currentSong,
              isPlaying: isPlayingDeleted ? false : prev.isPlaying,
            };
          });
        }).catch(e => console.warn("Failed to delete song", e));
      } else if (selectedItem.id.startsWith('song_') || selectedItem.id.startsWith('video_')) {
        const idPrefix = selectedItem.id.startsWith('song_') ? 'song_' : 'video_';
        const songId = selectedItem.id.replace(idPrefix, '');
        const song = state.library.find(s => s.id === songId);
        if (song) {
          playSong(song);
        }
      } else if (selectedItem.id === 'shuffle') {
        if (state.library.length > 0) {
          const randomSong = state.library[Math.floor(Math.random() * state.library.length)];
          playSong(randomSong);
        }
      }
    }
  };

  const playSong = async (song: Song) => {
    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      currentMenuId: 'nowplaying',
      menuHistory: [...prev.menuHistory, 'nowplaying'],
      selectedIndex: 0
    }));
    setNavDirection('forward');

    if (song.source === 'stream' && song.mediaType !== 'podcast') {
      if (audioRef.current) audioRef.current.pause();
      
      let videoId = song.streamId;
      // If it's still the iTunes preview URL, resolve it to a YouTube video ID
      if (videoId && videoId.includes('apple.com')) {
         try {
           const queryStr = `${song.artist} - ${song.title} (Official Audio)`;
           const proxies = [
             "https://invidious.projectsegfau.lt",
             "https://yewtu.be",
             "https://iv.melmac.space"
           ];
           
           let resolvedId = null;
           for (const proxy of proxies) {
             try {
                const res = await fetch(`${proxy}/api/v1/search?q=${encodeURIComponent(queryStr)}&type=video`);
                if (res.ok) {
                   const data = await res.json();
                   if (data && data.length > 0) {
                      resolvedId = data[0].videoId;
                      break;
                   }
                }
             } catch (e) {
                console.warn(`Proxy ${proxy} failed`);
             }
           }
           if (resolvedId) {
              videoId = resolvedId;
              // update the song in state and DB so we don't fetch again
              const updatedSong = { ...song, streamId: resolvedId };
              setState(prev => ({
                 ...prev,
                 currentSong: updatedSong,
                 library: prev.library.map(s => s.id === song.id ? updatedSong : s)
              }));
              saveSong(updatedSong).catch(console.warn);
           }
         } catch (e) {
           console.error("Failed to resolve YouTube ID", e);
         }
      }

      if (ytPlayerRef.current?.loadVideoById) {
        if (videoId && !videoId.includes('apple.com')) {
           ytPlayerRef.current.loadVideoById({ videoId, startSeconds: 0 });
        } else {
           // fallback to search playlist
           ytPlayerRef.current.loadPlaylist({
             list: `${song.title} ${song.artist}`,
             listType: 'search'
           });
        }
        ytPlayerRef.current.setVolume(state.volumeLimit || 100);
      }
    } else {
      if (ytPlayerRef.current?.pauseVideo) {
        ytPlayerRef.current.pauseVideo();
      }
    }
  };

  const handleSearchSelect = async (song: Song) => {
    try {
      const exists = state.library.find(s => s.id === song.id);
      if (!exists) {
        await saveSong(song);
        setState(prev => ({ ...prev, library: [...prev.library, song] }));
      }
      if (song.mediaType === 'podcast_show') {
        // Navigate to the podcast episodes menu
        setNavDirection('forward');
        setState(prev => ({
          ...prev,
          menuHistory: [...prev.menuHistory, `podcast_${song.id}`],
          currentMenuId: `podcast_${song.id}`,
          selectedIndex: 0,
        }));
      } else {
        playSong(song);
      }
    } catch (e: any) {
      console.warn("Failed to save streamed song", e?.message || e);
    }
  };

  const handleMenuClick = () => {
    if (state.menuHistory.length > 1) {
      setNavDirection('backward');
      setState(prev => {
        const newHistory = [...prev.menuHistory];
        newHistory.pop(); // remove current
        const previousMenuId = newHistory[newHistory.length - 1];
        
        return {
          ...prev,
          menuHistory: newHistory,
          currentMenuId: previousMenuId,
          selectedIndex: 0,
        };
      });
    }
  };

  const handlePlayPauseClick = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const lastSongRef = useRef<string | null>(null);

  useEffect(() => {
    const isNewSong = lastSongRef.current !== state.currentSong?.id;
    lastSongRef.current = state.currentSong?.id || null;

    if (state.currentSong?.source === 'stream' && state.currentSong?.mediaType !== 'podcast') {
      if (ytPlayerRef.current?.playVideo) {
        if (state.isPlaying && !isNewSong) {
          ytPlayerRef.current.playVideo();
        } else if (!state.isPlaying) {
          ytPlayerRef.current.pauseVideo();
        }
      }
    } else if (audioRef.current) {
      if (state.isPlaying && !isNewSong) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
              console.warn('Audio play error:', e?.message || e);
            }
          });
        }
      } else if (!state.isPlaying) {
        audioRef.current.pause();
      }
    }
  }, [state.isPlaying, state.currentSong?.url, state.currentSong?.source, state.currentSong?.id, state.currentSong?.mediaType]);

  useEffect(() => {
    let ytInterval: any;
    if (state.isPlaying && state.currentSong?.source === 'stream' && state.currentSong?.mediaType !== 'podcast') {
      ytInterval = setInterval(() => {
        if (ytPlayerRef.current?.getCurrentTime && ytPlayerRef.current?.getDuration) {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          const duration = ytPlayerRef.current.getDuration();
          if (duration > 0) {
            setState(prev => ({
              ...prev,
              currentTime,
              progress: (currentTime / duration) * 100 || 0,
              currentSong: prev.currentSong ? { ...prev.currentSong, duration } : null
            }));
          }
        }
      }, 1000);
    }
    return () => clearInterval(ytInterval);
  }, [state.isPlaying, state.currentSong]);

  const handleNextClick = () => {
    if (state.library.length > 0 && state.currentSong) {
      const currentIndex = state.library.findIndex(s => s.id === state.currentSong?.id);
      const nextIndex = (currentIndex + 1) % state.library.length;
      playSong(state.library[nextIndex]);
    }
  };

  const handlePrevClick = () => {
    if (state.library.length > 0 && state.currentSong) {
      const currentIndex = state.library.findIndex(s => s.id === state.currentSong?.id);
      const prevIndex = (currentIndex - 1 + state.library.length) % state.library.length;
      playSong(state.library[prevIndex]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    // Use placeholder images for cover arts to keep it simple and robust
    const placeholderImages = [
      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400&h=400',
    ];

    const newSongs: Song[] = [];
    
    for (const file of files) {
      const cover = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      const song: Song = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        url: URL.createObjectURL(file), // will be used immediately for this session
        coverArt: cover,
        duration: 0,
        source: 'local'
      };
      
      try {
        await saveSong(song, file);
        newSongs.push(song);
      } catch (err) {
        console.error("Failed to save song", err);
      }
    }

    setState(prev => ({
      ...prev,
      library: [...prev.library, ...newSongs]
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newVideos: Song[] = [];
    
    for (const file of files) {
      const video: Song = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown',
        album: 'Unknown',
        url: URL.createObjectURL(file), // will be used immediately for this session
        coverArt: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400&h=400',
        duration: 0,
        source: 'local',
        mediaType: 'video'
      };
      
      try {
        await saveSong(video, file);
        newVideos.push(video);
      } catch (err) {
        console.error("Failed to save video", err);
      }
    }

    if (newVideos.length > 0) {
      setState(prev => ({
        ...prev,
        library: [...prev.library, ...newVideos]
      }));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      setState(prev => ({
        ...prev,
        currentTime,
        progress: (currentTime / duration) * 100 || 0
      }));
    }
  };

  const currentColors = colorStyles[state.deviceColor];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111] p-4 font-sans">
      <div id="youtube-player" className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
        onClick={(e) => e.stopPropagation()} 
        accept="audio/*" 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onClick={(e) => e.stopPropagation()} 
        onChange={handleVideoUpload}
        accept="video/*" 
        multiple 
        className="hidden" 
      />

      {/* iPod Body */}
      <div 
        className="relative w-[360px] h-[600px] rounded-[36px] shadow-2xl overflow-hidden border-2 border-[#b0b0b0] transition-colors duration-500"
        style={{
          background: currentColors.body,
          boxShadow: 'inset 0px 0px 15px rgba(255,255,255,0.4), 0 25px 50px -12px rgba(0,0,0,0.8)'
        }}
      >
        
        {/* Screen Bezel */}
        <div className="absolute top-[32px] left-[20px] right-[20px] h-[260px] bg-[#1a1a1a] rounded-[14px] p-2 border-4 border-[#111] shadow-inner">
          <div id="ipod-screen-container" className="w-full h-full rounded-[10px] overflow-hidden relative" style={{ filter: `brightness(${state.brightness}%)` }}>
            <video 
              ref={audioRef}
              playsInline
              src={state.currentSong?.source === 'stream' && state.currentSong?.mediaType !== 'podcast' ? undefined : (state.currentSong?.url || undefined)}
              autoPlay={state.isPlaying}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => {
                const duration = e.currentTarget.duration;
                if (!isNaN(duration) && state.currentSong) {
                  setState(prev => ({
                    ...prev,
                    currentSong: { ...prev.currentSong!, duration },
                    library: prev.library.map(s => s.id === prev.currentSong?.id ? { ...s, duration } : s)
                  }));
                }
              }}
              onEnded={handleNextClick}
              className={state.currentSong?.mediaType === 'video' && activeMenu.items[0]?.id === 'np_view' ? 'absolute inset-0 w-full h-full object-contain bg-black z-50' : 'hidden'}
            />
            <Screen 
              currentMenu={activeMenu}
              selectedIndex={state.selectedIndex}
              scrollDirection={state.scrollDirection}
              isPlaying={state.isPlaying}
              batteryLevel={state.batteryLevel}
              isDarkMode={state.isDarkMode}
              navDirection={navDirection}
              currentSong={state.currentSong}
              progress={state.progress}
              currentTime={state.currentTime}
              librarySize={state.library.length}
              volumeLimit={state.volumeLimit}
              onSearchSelect={handleSearchSelect}
            />
          </div>
        </div>

        {/* Click Wheel Area */}
        <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2">
          <ClickWheel 
            onRotate={handleRotate}
            onCenterClick={handleCenterClick}
            onMenuClick={handleMenuClick}
            onPlayPauseClick={handlePlayPauseClick}
            onNextClick={handleNextClick}
            onPrevClick={handlePrevClick}
            wheelColorClass={currentColors.wheel}
            textColorClass={currentColors.text}
          />
        </div>
      </div>
    </div>
  );
};
