
import React, { useEffect, useState } from 'react';
import { ContentItem, Language } from '../types';

interface DetailModalProps {
  item: ContentItem | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (item) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [item]);

  if (!item) return null;

  const isTamil = item.language === Language.TAMIL;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Image Section */}
        <div className="relative h-64 sm:h-72 bg-slate-100 shrink-0">
          <img 
            src={item.image || `https://picsum.photos/seed/${item.id}/600/400`} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
               <span className={`px-2 py-1 text-[10px] font-bold rounded-lg shadow-sm backdrop-blur-md ${
                  isTamil ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                }`}>
                  {item.language}
                </span>
                <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-blue-600/90 text-white shadow-sm backdrop-blur-md uppercase">
                  {item.type}
                </span>
                {item.imdbRating && (
                  <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-yellow-400/90 text-black shadow-sm backdrop-blur-md flex items-center gap-1">
                    <i className="fa-solid fa-star text-[8px]"></i> {item.imdbRating}
                  </span>
                )}
            </div>
            <h2 className="text-2xl font-black leading-tight shadow-black drop-shadow-md">{item.title}</h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 overflow-y-auto scrollbar-hide">
          <div className="mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Story</h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {item.keywords.map((k, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                  #{k}
                </span>
              ))}
            </div>
          </div>

          <a 
            href={item.telegram_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#229ED9] hover:bg-[#1e88ba] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
          >
            <i className="fa-brands fa-telegram text-lg"></i>
            Watch on Telegram
          </a>
          <p className="text-center text-[10px] text-slate-400 font-medium">
            You will be redirected to the Telegram channel.
          </p>
        </div>
      </div>
    </div>
  );
};
