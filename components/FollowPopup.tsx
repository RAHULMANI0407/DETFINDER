
import React, { useEffect, useState } from 'react';

interface FollowPopupProps {
  onClose: () => void;
  isVisible: boolean;
}

export const FollowPopup: React.FC<FollowPopupProps> = ({ onClose, isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) setShouldRender(true);
  }, [isVisible]);

  const handleAnimationEnd = () => {
    if (!isVisible) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onTransitionEnd={handleAnimationEnd}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Popup Content */}
      <div 
        className={`relative w-full sm:max-w-md bg-white shadow-2xl transition-all duration-250 ease-out 
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 sm:translate-y-0'}
          rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden`}
      >
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          {/* Icon / Brand */}
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-500 rounded-[2rem] flex items-center justify-center text-white text-4xl mb-6 shadow-xl transform -rotate-6">
            <i className="fa-brands fa-instagram"></i>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            Follow @doraemon_ever_tamil
          </h3>
          
          <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-[240px]">
            Watch Doraemon contents and get latest updates instantly!
          </p>

          <div className="flex flex-col w-full gap-3">
            <a 
              href="https://www.instagram.com/doraemon_ever_tamil/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-4 rounded-2xl text-sm font-black shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Follow on Instagram
            </a>
            
            <button 
              onClick={onClose}
              className="w-full py-3 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50 -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-pink-50 rounded-full opacity-50 -z-10"></div>
      </div>
    </div>
  );
};
