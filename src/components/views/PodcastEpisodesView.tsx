import React, { useState, useEffect } from 'react';
import { Song } from '../../types';
import { cn } from '../../lib/utils';

interface PodcastEpisodesViewProps {
  isDarkMode: boolean;
  podcastUrl?: string;
  podcastTitle: string;
  podcastArt?: string;
  podcastId?: string;
  onSelectEpisode: (song: Song) => void;
}

interface Season {
  id: string;
  label: string;
  episodes: Song[];
}

export const PodcastEpisodesView: React.FC<PodcastEpisodesViewProps> = ({ isDarkMode, podcastUrl, podcastTitle, podcastArt, podcastId, onSelectEpisode }) => {
  const [episodes, setEpisodes] = useState<Song[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!podcastUrl) {
      setLoading(false);
      return;
    }

    function getXmlNodeTextByNamespaces(parent: Element, tagNames: string[]) {
      for (let tag of tagNames) {
        let els = parent.getElementsByTagName(tag);
        if (els.length > 0) return els[0].textContent;
        let colonIdx = tag.indexOf(':');
        if (colonIdx !== -1) {
          let localName = tag.substring(colonIdx + 1);
          els = parent.getElementsByTagName(localName);
          if (els.length > 0) return els[0].textContent;
        }
      }
      return "";
    }

    const fetchEpisodes = async () => {
      try {
        let foundEpisodes: (Song & { seasonStr?: string })[] = [];

        // Tier 0: iTunes API by Title (Most reliable)
        if (podcastTitle) {
          try {
            const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(podcastTitle)}&entity=podcast&limit=5`);
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              let podcastIdToUse = searchData.results[0]?.collectionId;
              if (podcastUrl) {
                const exactMatch = searchData.results.find((r: any) => r.feedUrl === podcastUrl);
                if (exactMatch) podcastIdToUse = exactMatch.collectionId;
              }

              if (podcastIdToUse) {
                const res = await fetch(`https://itunes.apple.com/lookup?id=${podcastIdToUse}&entity=podcastEpisode&limit=150&_c=${Date.now()}`);
                if (res.ok) {
                  const data = await res.json();
                  if (data.results && data.results.length > 1) {
                    for (let i = 1; i < data.results.length; i++) {
                      const ep = data.results[i];
                      if (ep.episodeUrl) {
                        let seasonStr = ep.seasonNumber ? `Season ${ep.seasonNumber}` : "";
                        if (!seasonStr) {
                          const regex = /(?:season|s)\s*(\d+)/i;
                          const match = ep.trackName.match(regex);
                          if (match) seasonStr = `Season ${match[1]}`;
                        }
                        const finalTitle = seasonStr && !ep.trackName.includes(seasonStr) ? `[${seasonStr}] ${ep.trackName}` : ep.trackName;
                        
                        foundEpisodes.push({
                          id: `ep_${ep.trackId}`,
                          title: finalTitle,
                          artist: podcastTitle,
                          album: podcastTitle,
                          url: ep.episodeUrl,
                          coverArt: podcastArt,
                          duration: ep.trackTimeMillis ? Math.floor(ep.trackTimeMillis / 1000) : 0,
                          source: 'stream',
                          streamId: ep.episodeUrl,
                          mediaType: 'podcast',
                          seasonStr: seasonStr || 'All Episodes'
                        });
                      }
                    }
                  }
                }
              }
            }
          } catch(e) {
            console.warn("Tier 0 (iTunes) failed", e);
          }
        }

        // Tier 1: rss2json
        if (foundEpisodes.length === 0) {
          try {
            const fallbackRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(podcastUrl)}&count=1000`);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            if (data && data.items && data.items.length > 0) {
              foundEpisodes = data.items.map((item: any, idx: number) => {
                const previewUrl = item.enclosure?.link || item.enclosure?.url || "";
                const title = item.title || "Untitled Episode";
                let seasonStr = "";
                const regex = /(?:season|s)\s*(\d+)/i;
                const match = title.match(regex);
                if (match) {
                  seasonStr = `Season ${match[1]}`;
                }
                return {
                  id: `ep_${idx}_${Math.random().toString(36).substr(2, 5)}`,
                  title: seasonStr ? `[${seasonStr}] ${title}` : title,
                  artist: podcastTitle,
                  album: podcastTitle,
                  url: previewUrl,
                  coverArt: item.thumbnail || podcastArt,
                  duration: 0,
                  source: 'stream',
                  streamId: previewUrl,
                  mediaType: 'podcast',
                  seasonStr: seasonStr || 'All Episodes'
                };
              }).filter((ep: any) => ep.url);
            }
          }
        } catch (err) {
          console.warn("Tier 1 (rss2json) failed", err);
        }
        } // close if

        // Tier 2 & Tier 3: XML Proxies
        if (foundEpisodes.length === 0) {
          const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(podcastUrl)}`,
            `https://corsproxy.io/?url=${encodeURIComponent(podcastUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(podcastUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(podcastUrl)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(podcastUrl)}`
          ];
          
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

                if (xmlText && xmlText.includes("<item")) {
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                  const items = xmlDoc.getElementsByTagName("item");
                  
                  if (items && items.length > 0) {
                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];
                      
                      let title = getXmlNodeTextByNamespaces(item, ["title"]) || "Untitled Episode";
                      
                      let seasonStr = "";
                      const seasonVal = getXmlNodeTextByNamespaces(item, ["itunes:season", "season"]);
                      if (seasonVal) {
                        seasonStr = `Season ${seasonVal}`;
                      } else {
                        const regex = /(?:season|s)\s*(\d+)/i;
                        const match = title.match(regex);
                        if (match) {
                          seasonStr = `Season ${match[1]}`;
                        }
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
                          title: seasonStr ? `[${seasonStr}] ${title}` : title,
                          artist: podcastTitle,
                          album: podcastTitle,
                          url: audioUrl,
                          coverArt: podcastArt,
                          duration: 0,
                          source: 'stream',
                          streamId: audioUrl,
                          mediaType: 'podcast',
                          seasonStr: seasonStr || 'All Episodes'
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
        }
        
        const seasonGroups: Record<string, Song[]> = {};
        foundEpisodes.forEach(ep => {
           const s = ep.seasonStr || 'All Episodes';
           if (!seasonGroups[s]) seasonGroups[s] = [];
           seasonGroups[s].push(ep);
        });

        let parsedSeasons: Season[] = Object.keys(seasonGroups).map(k => ({
           id: k,
           label: k,
           episodes: seasonGroups[k]
        }));
        
        parsedSeasons.sort((a, b) => {
           if (a.id === 'All Episodes') return 1;
           if (b.id === 'All Episodes') return -1;
           const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
           const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
           return numB - numA; 
        });

        if (parsedSeasons.length === 0 && foundEpisodes.length > 0) {
           parsedSeasons = [{ id: 'All Episodes', label: 'All Episodes', episodes: foundEpisodes }];
        }
        
        setSeasons(parsedSeasons);
        if (parsedSeasons.length > 0) {
           setEpisodes(parsedSeasons[0].episodes);
        } else {
           setEpisodes([]);
        }
      } catch (e) {
        console.warn("Failed to fetch podcast episodes");
      }
      setLoading(false);
    };

    fetchEpisodes();
  }, [podcastUrl, podcastTitle, podcastArt]);

  const hasSeasons = seasons.length > 1;
  const listItemsCount = hasSeasons ? episodes.length + 1 : episodes.length;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(s => Math.min(listItemsCount - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(s => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      if (hasSeasons && selectedIndex === 0) {
         const nextSeasonIdx = (selectedSeasonIndex + 1) % seasons.length;
         setSelectedSeasonIndex(nextSeasonIdx);
         setEpisodes(seasons[nextSeasonIdx].episodes);
      } else {
         const epIndex = hasSeasons ? selectedIndex - 1 : selectedIndex;
         if (episodes[epIndex]) {
           onSelectEpisode(episodes[epIndex]);
         }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, [episodes, selectedIndex, listItemsCount, hasSeasons, selectedSeasonIndex, seasons, onSelectEpisode]);

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
        
        {hasSeasons && (
           <div 
             key="season_selector"
             className={cn(
               "px-2 py-1.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis rounded-sm cursor-pointer border-b font-bold flex justify-between",
               isDarkMode ? "border-gray-800" : "border-gray-100",
               selectedIndex === 0 
                 ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                 : (isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800")
             )}
             onClick={() => {
                const nextSeasonIdx = (selectedSeasonIndex + 1) % seasons.length;
                setSelectedSeasonIndex(nextSeasonIdx);
                setEpisodes(seasons[nextSeasonIdx].episodes);
                setSelectedIndex(0);
             }}
           >
             <span>{seasons[selectedSeasonIndex]?.label}</span>
             <span>▼ (Click or Enter to cycle)</span>
           </div>
        )}

        {episodes.map((ep, i) => {
          const actualIndex = hasSeasons ? i + 1 : i;
          return (
            <div 
              key={ep.id}
              onClick={() => {
                setSelectedIndex(actualIndex);
                onSelectEpisode(ep);
              }}
              className={cn(
                "px-2 py-1.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis rounded-sm cursor-pointer border-b flex items-center",
                isDarkMode ? "border-gray-800" : "border-gray-100",
                selectedIndex === actualIndex 
                  ? (isDarkMode ? "bg-blue-600 text-white font-bold" : "bg-blue-500 text-white font-bold")
                  : (isDarkMode ? "text-gray-300" : "text-gray-700")
              )}
            >
              <div className="flex flex-col">
                <span className="truncate w-full">{ep.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

