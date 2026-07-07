import React, { useState, useEffect } from 'react';
import { Song } from '../../types';
import { cn } from '../../lib/utils';

interface PodcastEpisodesViewProps {
  isDarkMode: boolean;
  podcastUrl?: string;
  podcastTitle: string;
  podcastArt?: string;
  onSelectEpisode: (song: Song) => void;
}

export const PodcastEpisodesView: React.FC<PodcastEpisodesViewProps> = ({ isDarkMode, podcastUrl, podcastTitle, podcastArt, onSelectEpisode }) => {
  const [episodes, setEpisodes] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!podcastUrl) {
      setLoading(false);
      return;
    }

    const fetchEpisodes = async () => {
      try {
        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(podcastUrl)}`,
          `https://api.allorigins.win/get?url=${encodeURIComponent(podcastUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(podcastUrl)}`
        ];
        
        let foundEpisodes: Song[] = [];
        
        for (const proxy of proxies) {
          try {
            const res = await fetch(proxy);
            if (res.ok) {
              let xmlText = "";
              if (proxy.includes("/get?url=")) {
                const wrapper = await res.json();
                xmlText = wrapper.contents || "";
              } else {
                xmlText = await res.text();
              }

              if (xmlText) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                const items = xmlDoc.getElementsByTagName("item");
                
                if (items && items.length > 0) {
                  for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    
                    let title = "Untitled Episode";
                    const titleEls = item.getElementsByTagName("title");
                    if (titleEls.length > 0) title = titleEls[0].textContent || title;
                    
                    // Extract season and episode information
                    let seasonStr = "";
                    const seasonEls = item.getElementsByTagName("itunes:season");
                    if (seasonEls.length > 0 && seasonEls[0].textContent) {
                      seasonStr += `S${seasonEls[0].textContent}`;
                    }
                    const epEls = item.getElementsByTagName("itunes:episode");
                    if (epEls.length > 0 && epEls[0].textContent) {
                      seasonStr += `E${epEls[0].textContent}`;
                    }
                    if (seasonStr) {
                      title = `[${seasonStr}] ${title}`;
                    }

                    let audioUrl = "";
                    const enclosureEls = item.getElementsByTagName("enclosure");
                    if (enclosureEls.length > 0) {
                      audioUrl = enclosureEls[0].getAttribute("url") || enclosureEls[0].getAttribute("link") || "";
                    }
                    
                    if (!audioUrl) {
                      const guidEls = item.getElementsByTagName("guid");
                      if (guidEls.length > 0) {
                        const guidText = guidEls[0].textContent || "";
                        if (guidText.match(/\.(mp3|m4a|wav|ogg)$/i)) {
                          audioUrl = guidText;
                        }
                      }
                    }

                    if (audioUrl) {
                      foundEpisodes.push({
                        id: `ep_${Math.random().toString(36).substr(2, 9)}`,
                        title,
                        artist: podcastTitle,
                        album: podcastTitle,
                        url: audioUrl,
                        coverArt: podcastArt,
                        duration: 0,
                        source: 'stream',
                        streamId: audioUrl,
                        mediaType: 'podcast'
                      });
                    }
                  }
                  if (foundEpisodes.length > 0) {
                    break;
                  }
                }
              }
            }
          } catch(e) {
            console.warn("Proxy failed", proxy);
          }
        }
        setEpisodes(foundEpisodes);
      } catch (e) {
        console.warn("Failed to fetch podcast episodes");
      }
      setLoading(false);
    };

    fetchEpisodes();
  }, [podcastUrl]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(s => Math.min(episodes.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(s => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      if (episodes[selectedIndex]) {
        onSelectEpisode(episodes[selectedIndex]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, [episodes, selectedIndex]);

  return (
    <div className={cn(
      "w-full h-full flex flex-col",
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    )}>
      <div className={cn(
        "px-2 py-1 flex justify-between items-center font-bold text-sm border-b",
        isDarkMode ? "border-gray-800" : "border-gray-300 shadow-sm"
      )}>
        <span className="truncate">{podcastTitle}</span>
        {loading && <span className="text-xs text-blue-500 animate-pulse ml-2 shrink-0">Loading...</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
        {loading && episodes.length === 0 && (
          <div className="flex justify-center items-center h-full text-xs text-gray-500">
            Fetching episodes...
          </div>
        )}
        
        {!loading && episodes.length === 0 && (
          <div className="flex justify-center items-center h-full text-xs text-gray-500">
            No episodes found.
          </div>
        )}
        
        {episodes.map((ep, i) => (
          <div 
            key={ep.id}
            onClick={() => onSelectEpisode(ep)}
            className={cn(
              "px-2 py-1.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis rounded-sm cursor-pointer border-b",
              isDarkMode ? "border-gray-800" : "border-gray-100",
              selectedIndex === i 
                ? (isDarkMode ? "bg-blue-600 text-white font-bold" : "bg-blue-500 text-white font-bold")
                : (isDarkMode ? "text-gray-300" : "text-gray-700")
            )}
          >
            {ep.title}
          </div>
        ))}
      </div>
    </div>
  );
};
