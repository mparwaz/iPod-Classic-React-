import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Song } from '../../types';
import { motion } from 'motion/react';

interface SearchViewProps {
  isDarkMode: boolean;
  mode?: 'music' | 'podcast';
  onSelectSong: (song: Song) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ isDarkMode, mode = 'music', onSelectSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const mediaParam = mode === 'podcast' ? 'podcast' : 'music';
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=${mediaParam}&limit=20&_c=${Date.now()}`);
        const data = await res.json();
        
        if (data.results) {
          if (mode === 'podcast') {
            const parsedPodcasts: Song[] = [];
            for (const r of data.results) {
              if (r.feedUrl) {
                 parsedPodcasts.push({
                   id: r.collectionId.toString(),
                   title: r.collectionName,
                   artist: r.artistName,
                   album: 'Podcast',
                   url: r.feedUrl, // save feedUrl in the url field
                   coverArt: r.artworkUrl100?.replace('100x100', '600x600'),
                   duration: 0,
                   source: 'stream',
                   streamId: r.feedUrl,
                   mediaType: 'podcast_show'
                 });
              }
            }
            setResults(parsedPodcasts);
          } else {
            const songs: Song[] = data.results.map((r: any) => ({
              id: r.trackId.toString(),
              title: r.trackName,
              artist: r.artistName,
              album: r.collectionName,
              url: r.previewUrl,
              coverArt: r.artworkUrl100?.replace('100x100', '600x600'),
              duration: Math.floor(r.trackTimeMillis / 1000),
              source: 'stream',
              streamId: r.previewUrl
            }));
            setResults(songs);
          }
          setSelectedIndex(0);
        }
      } catch (e) {
        console.error("iTunes search failed", e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounce);
  }, [query, mode]);

  // Handle keyboard navigation for the search results (since the physical wheel isn't hooked up directly to this input field yet)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        onSelectSong(results[selectedIndex]);
      }
    }
  };

  return (
    <div className={cn(
      "w-full h-[216px] flex flex-col overflow-hidden text-sm",
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      <div className={cn(
        "px-2 py-1 border-b shrink-0",
        isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"
      )}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search iTunes..."
          className={cn(
            "w-full px-2 py-1 rounded-sm text-xs outline-none",
            isDarkMode ? "bg-black text-white border border-gray-600" : "bg-white text-black border border-gray-300"
          )}
        />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50">
            Searching...
          </div>
        )}
        
        {!loading && results.length === 0 && query && (
          <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50">
            No results found
          </div>
        )}

        {!loading && results.map((song, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className={cn(
                "w-full px-2 py-1 flex items-center gap-2 cursor-pointer",
                isSelected && (isDarkMode 
                  ? "bg-gradient-to-b from-[#444] to-[#222] text-white" 
                  : "bg-gradient-to-b from-[#509ff1] to-[#186fee] text-white")
              )}
            >
              <img src={song.coverArt} alt="" className="w-8 h-8 rounded-sm object-cover bg-gray-300 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-xs truncate leading-tight">{song.title}</span>
                <span className={cn(
                  "text-[10px] truncate leading-tight",
                  !isSelected && (isDarkMode ? "text-gray-300" : "text-gray-600")
                )}>{song.artist}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};
