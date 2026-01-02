
import React from 'react';
import { ContentItem, Language, MatchType } from '../types';

interface ResultCardProps {
  item: ContentItem;
  searchReasoning?: string[];
  matchType?: MatchType;
  onClick?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ item, searchReasoning, matchType, onClick }) => {
  const isTamil = item.language === Language.TAMIL;

  const copyToClipboard = (text: string, url: string) => {
    navigator.clipboard.writeText(`${text} ${url}`);
    alert("Link copied to clipboard!");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    const shareTitle = item.title;
    const shareText = `Check out "${item.title}" on DET Finder!`;
    const shareUrl = item.telegram_link;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareText, shareUrl);
        }
      }
    } else {
      copyToClipboard(shareText, shareUrl);
    }
  };

  const handleTelegramClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  const getMatchTypeStyles = (type: MatchType) => {
    switch (type) {
      case 'Title-match': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Event-based': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Scene-based': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Story-based': return 'bg-green-100 text-green-700 border-green-200';
      case 'Keyword-based': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100 flex flex-col h-full group cursor-pointer relative"
    >
      <div className="relative h-44 overflow-hidden bg-blue-50">
        <img 
          src={item.image || `https://picsum.photos/seed/${item.id}/400/225`} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Doraemon+Finder';
          }}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          {item.season && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-indigo-500/90 backdrop-blur-sm text-white shadow-sm uppercase tracking-wide">
              {item.season}
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg shadow-sm backdrop-blur-sm ${
            isTamil ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
          }`}>
            {item.language}
          </span>
          {item.imdbRating && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-yellow-400 text-black shadow-sm flex items-center gap-1">
              <i className="fa-solid fa-star text-[8px]"></i> {item.imdbRating}
            </span>
          )}
        </div>
        
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="text-white text-xs font-bold border border-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">View Details</span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words leading-tight">
              {item.title}
            </h3>
            {matchType && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getMatchTypeStyles(matchType)} whitespace-nowrap mt-1`}>
                {matchType === 'Title-match' ? 'Direct Match' : matchType}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 mb-4 italic">
          {item.description}
        </p>

        {searchReasoning && searchReasoning.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <h5 className="text-blue-700 text-[10px] font-black uppercase tracking-widest mb-2">
              Why this matches
            </h5>
            <ul className="space-y-1.5">
              {searchReasoning.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-4 h-5 overflow-hidden">
            {item.keywords.slice(0, 3).map((k, i) => (
              <span key={i} className="text-[9px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">
                #{k}
              </span>
            ))}
          </div>

          <div className="flex gap-2 relative z-10">
            <a 
              href={item.telegram_link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleTelegramClick}
              className="flex-grow flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1e88ba] text-white py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <i className="fa-brands fa-telegram"></i>
              Open Telegram
            </a>
            <button 
              onClick={handleShare}
              className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all bg-gray-50"
              title="Share"
            >
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
