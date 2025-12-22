
import { SearchService } from '../services/geminiService';
import { SearchResult, ContentType } from '../types';
import React, { useState, useEffect, useRef } from 'react';

interface SearchBoxProps {
  onSearch: (results: SearchResult, query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeCategory?: ContentType | 'All';
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, isLoading, setIsLoading, activeCategory = 'All' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      setSuggestions(SearchService.getSuggestions(val));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handlePerformSearch = async (searchQuery: string) => {
    const targetQuery = searchQuery.trim();
    if (!targetQuery) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      const results = await SearchService.fuzzySearch(targetQuery, activeCategory as ContentType | 'All');
      onSearch(results, targetQuery);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const onSuggestionClick = (s: string) => {
    setQuery(s);
    handlePerformSearch(s);
  };

  const getPlaceholder = () => {
    switch(activeCategory) {
      case ContentType.MOVIE: return "Search movies (e.g. 'Steel Troops')...";
      case ContentType.EPISODE: return "Search episodes (e.g. 'Season 14')...";
      case ContentType.SPECIAL: return "Search specials (e.g. 'Stand by Me')...";
      case ContentType.SHORT_FILM: return "Search short films...";
      default: return "Describe a scene or title...";
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handlePerformSearch(query)}
          placeholder={getPlaceholder()}
          className="w-full px-5 py-4 pl-12 text-base sm:text-lg bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 focus:outline-none shadow-xl transition-all text-black"
          autoComplete="off"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <button 
          onClick={() => handlePerformSearch(query)}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm min-w-[100px]"
        >
          {isLoading ? '...' : 'Find'}
        </button>
      </div>

      {/* Doraemon Searching Animation (Hyper-Dynamic Version) */}
      {isLoading && (
        <div className="mt-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="relative w-40 h-40">
            {/* Doraemon's Head - Tilting and shaking */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-blue-500 rounded-full border-4 border-white shadow-xl overflow-hidden" 
                 style={{ animation: 'headTilt 2s infinite ease-in-out' }}>
               {/* White Face area */}
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-18 bg-white rounded-t-[50%]">
                 {/* Expression: Looking down at pocket */}
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <div className="w-1.5 h-3 bg-black rounded-full"></div>
                    <div className="w-1.5 h-3 bg-black rounded-full"></div>
                 </div>
                 {/* Red Nose */}
                 <div className="absolute top-7 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
               </div>
               {/* Red Collar */}
               <div className="absolute bottom-0 w-full h-3 bg-red-600"></div>
               {/* Yellow Bell */}
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-800 translate-y-1 z-10 animate-bounce"></div>
            </div>

            {/* 4D Pocket - Expanding and Glowing */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-12 bg-white rounded-b-full border-2 border-blue-100 shadow-[inset_0_-2px_10px_rgba(37,99,235,0.1)] z-20 overflow-visible" 
                 style={{ animation: 'pocketPulse 0.5s infinite alternate ease-in-out' }}>
               
               {/* Rummaging Hand Effects */}
               <div className="absolute -top-2 left-2 w-8 h-8 bg-white rounded-full border border-slate-100 shadow-md" style={{ animation: 'circularRummage 0.6s infinite linear' }}></div>
               <div className="absolute -top-1 right-2 w-8 h-8 bg-white rounded-full border border-slate-100 shadow-md" style={{ animation: 'circularRummage 0.6s infinite linear reverse' }}></div>
               
               {/* Sparkle Particles from pocket */}
               <div className="absolute top-0 left-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
               <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-75"></div>
               <div className="absolute top-1 left-1/4 w-1 h-1 bg-pink-300 rounded-full animate-bounce delay-150"></div>
            </div>

            {/* Flying Gadgets - Flying on arcs */}
            <div className="absolute" style={{ animation: 'flyArc1 1.5s infinite linear' }}>
              <i className="fa-solid fa-helicopter text-blue-500 text-2xl drop-shadow-md"></i>
            </div>
            <div className="absolute" style={{ animation: 'flyArc2 2s infinite linear' }}>
              <i className="fa-solid fa-door-open text-red-400 text-2xl drop-shadow-md"></i>
            </div>
            <div className="absolute" style={{ animation: 'flyArc3 1.8s infinite linear' }}>
              <i className="fa-solid fa-clock text-indigo-400 text-xl drop-shadow-md"></i>
            </div>
            
            {/* Background Ripple */}
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 -z-10" style={{ animationDuration: '3s' }}></div>
          </div>
          
          <div className="text-center mt-2">
            <div className="flex items-center justify-center gap-2 mb-2">
               <div className="text-blue-600 text-xs font-black tracking-[0.3em] uppercase animate-pulse">
                 Rummaging Pocket
               </div>
            </div>
            <p className="text-slate-400 text-[10px] font-bold italic max-w-xs mx-auto">
              "Hmm... where did I put that gadget?"
            </p>
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-blue-50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => onSuggestionClick(s)}
              className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-black transition-colors border-b border-gray-50 last:border-0 text-sm font-medium text-left flex items-center"
            >
              <i className="fa-solid fa-history mr-3 text-gray-300 text-xs"></i>
              <span className="truncate">{s}</span>
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes headTilt {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-52%) rotate(-5deg); }
          75% { transform: translateX(-48%) rotate(5deg); }
        }
        @keyframes pocketPulse {
          from { transform: translateX(-50%) scale(1); filter: brightness(1); }
          to { transform: translateX(-50%) scale(1.1); filter: brightness(1.05); }
        }
        @keyframes circularRummage {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          25% { transform: translate(5px, -5px) scale(1.1); opacity: 0.8; }
          50% { transform: translate(0, -10px) scale(0.9); opacity: 0.9; }
          75% { transform: translate(-5px, -5px) scale(1.05); opacity: 0.8; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        @keyframes flyArc1 {
          0% { opacity: 0; transform: translate(60px, 80px) rotate(0); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-40px, -60px) rotate(360deg); }
        }
        @keyframes flyArc2 {
          0% { opacity: 0; transform: translate(80px, 100px) scale(0.5); }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(140px, -20px) scale(1.2) rotate(-45deg); }
        }
        @keyframes flyArc3 {
          0% { opacity: 0; transform: translate(60px, 100px); }
          40% { opacity: 1; }
          60% { opacity: 1; }
          100% { opacity: 0; transform: translate(-100px, 20px) rotate(-180deg); }
        }
      `}} />
    </div>
  );
};
