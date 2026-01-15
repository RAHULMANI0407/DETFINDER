import { SearchService } from '../services/geminiService';
import { SearchResult, ContentType, ContentItem } from '../types';
import React, { useState, useEffect, useRef } from 'react';
import { dataset } from '../data/dataset';

// ✅ Firebase imports (added)
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface SearchBoxProps {
  onSearch: (results: SearchResult, query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeCategory?: ContentType | 'All';
  customDataset?: ContentItem[];
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  isLoading,
  setIsLoading,
  activeCategory = 'All',
  customDataset = [],
}) => {
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

  // ✅ Save search to Firebase (added)
  const saveSearchToFirebase = async (searchQuery: string) => {
    try {
      await addDoc(collection(db, "searchHistory"), {
        query: searchQuery.trim(),
        createdAt: serverTimestamp(),
      });
      console.log("✅ Search saved to Firebase:", searchQuery);
    } catch (err) {
      console.error("❌ Firebase save error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      // Use combined dataset for suggestions if needed, but for now standard dataset is fine
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
      // ✅ Save query in Firebase first
      await saveSearchToFirebase(targetQuery);

      // The fuzzySearch currently relies on its own internal dataset import,
      // in a real app we'd pass the dynamic dataset or store it globally.
      // For this prototype, we'll let Gemini handle the search over the primary list.
      const results = await SearchService.fuzzySearch(
        targetQuery,
        activeCategory as ContentType | 'All'
      );

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
    switch (activeCategory) {
      case ContentType.MOVIE:
        return "Search movies (e.g. 'Steel Troops')...";
      case ContentType.EPISODE:
        return "Search episodes (e.g. 'Season 14')...";
      case ContentType.SPECIAL:
        return "Search specials (e.g. 'Stand by Me')...";
      case ContentType.SHORT_FILM:
        return "Search short films...";
      default:
        return "Describe a scene or title...";
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
          className="w-full pr-28 pl-12 py-4 pl-12 text-base sm:text-lg bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 focus:outline-none shadow-xl transition-all text-black"
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

      {/* Doraemon Searching Animation */}
      {isLoading && (
        <div className="mt-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="relative w-40 h-40">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-blue-500 rounded-full border-4 border-white shadow-xl overflow-hidden"
              style={{ animation: 'headTilt 2s infinite ease-in-out' }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-18 bg-white rounded-t-[50%]">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <div className="w-1.5 h-3 bg-black rounded-full"></div>
                  <div className="w-1.5 h-3 bg-black rounded-full"></div>
                </div>
                <div className="absolute top-7 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
              <div className="absolute bottom-0 w-full h-3 bg-red-600"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-800 translate-y-1 z-10 animate-bounce"></div>
            </div>
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-12 bg-white rounded-b-full border-2 border-blue-100 z-20 overflow-visible"
              style={{ animation: 'pocketPulse 0.5s infinite alternate ease-in-out' }}
            >
              <div
                className="absolute -top-2 left-2 w-8 h-8 bg-white rounded-full border border-slate-100 shadow-md"
                style={{ animation: 'circularRummage 0.6s infinite linear' }}
              ></div>
              <div
                className="absolute -top-1 right-2 w-8 h-8 bg-white rounded-full border border-slate-100 shadow-md"
                style={{ animation: 'circularRummage 0.6s infinite linear reverse' }}
              ></div>
            </div>
          </div>
          <div className="text-center mt-2">
            <div className="text-blue-600 text-xs font-black tracking-[0.3em] uppercase animate-pulse">
              Searching 4D Pocket...
            </div>
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes headTilt {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-52%) rotate(-5deg); }
          75% { transform: translateX(-48%) rotate(5deg); }
        }
        @keyframes pocketPulse {
          from { transform: translateX(-50%) scale(1); }
          to { transform: translateX(-50%) scale(1.1); }
        }
        @keyframes circularRummage {
          0% { transform: translate(0, 0); }
          50% { transform: translate(0, -5px); }
          100% { transform: translate(0, 0); }
        }
      `,
        }}
      />
    </div>
  );
};
