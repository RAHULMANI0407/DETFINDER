
import React, { useState, useMemo, useEffect } from 'react';
import { dataset } from './data/dataset';
import { SearchBox } from './components/SearchBox';
import { ResultCard } from './components/ResultCard';
import { FollowPopup } from './components/FollowPopup';
import { AIAssistant } from './components/AIAssistant';
import { ContentType, SearchResult } from './types';

const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<ContentType | 'All'>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showFollowPopup, setShowFollowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFollowPopup(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const closeFollowPopup = () => {
    setShowFollowPopup(false);
  };

  const isShowingList = searchResults !== null || activeCategory !== 'All';

  // Core sorting logic: Type priority first, then relevance score
  const allFilteredResults = useMemo(() => {
    if (searchResults) {
      let items = [...searchResults.matches];
      
      // Category filter
      if (activeCategory !== 'All') {
        items = items.filter(item => item.type === activeCategory);
      }

      // Multi-layer sort
      items.sort((a, b) => {
        const typeA = searchResults.matchTypeMap?.[a.id] || '';
        const typeB = searchResults.matchTypeMap?.[b.id] || '';
        
        // Priority weightings: lower is higher priority
        const priority: Record<string, number> = { 
          'Title-match': 1, 
          'Story-based': 2, 
          'Event-based': 3, 
          'Scene-based': 4, 
          'Keyword-based': 5 
        };
        
        const pA = priority[typeA] || 99;
        const pB = priority[typeB] || 99;
        
        // Primary Sort: Match Category
        if (pA !== pB) return pA - pB;
        
        // Secondary Sort: Relevance Score within the same category
        const scoreA = searchResults.relevanceScoreMap?.[a.id] || 0;
        const scoreB = searchResults.relevanceScoreMap?.[b.id] || 0;
        return scoreB - scoreA;
      });
      
      return items;
    }

    if (activeCategory !== 'All') {
      return dataset.filter(item => item.type === activeCategory);
    }
    return [];
  }, [searchResults, activeCategory]);

  // Distinct groups for rendering sections
  const { bestMatches, relatedMatches } = useMemo(() => {
    if (!searchResults) return { bestMatches: [], relatedMatches: allFilteredResults };
    
    // "Best Match" are those that are either Title-matches or have very high relevance (e.g. 95+)
    const best = allFilteredResults.filter(item => {
      const type = searchResults.matchTypeMap?.[item.id];
      const score = searchResults.relevanceScoreMap?.[item.id] || 0;
      return type === 'Title-match' || score >= 95;
    });
    
    // Everything else is "Related"
    const related = allFilteredResults.filter(item => {
      const isBest = best.some(b => b.id === item.id);
      return !isBest;
    });
    
    return { bestMatches: best, relatedMatches: related };
  }, [allFilteredResults, searchResults]);

  const handleSearch = (results: SearchResult, query: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSearchResults(results);
      setCurrentQuery(query);
      setIsTransitioning(false);
      
      // Smooth scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 300);
  };

  const resetSearch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSearchResults(null);
      setCurrentQuery('');
      setActiveCategory('All');
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const handleNavClick = (type: ContentType | 'All') => {
    if (activeCategory === type && !searchResults) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (type === 'All') {
        setSearchResults(null);
        setCurrentQuery('');
        setActiveCategory('All');
      } else {
        setActiveCategory(type);
        setSearchResults(null);
        setCurrentQuery('');
      }
      setIsTransitioning(false);
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <FollowPopup isVisible={showFollowPopup} onClose={closeFollowPopup} />
      <AIAssistant />
      
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={resetSearch}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div className="flex flex-col -gap-1">
              <h1 className="text-lg font-black text-blue-700 tracking-tighter uppercase leading-none">
                DET<span className="text-slate-800">FINDER</span>
              </h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Powered by DET</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <button onClick={() => handleNavClick('All')} className={`text-sm font-bold transition-all px-4 py-1.5 rounded-full border ${activeCategory === 'All' && !searchResults ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}>All Content</button>
            <button onClick={() => handleNavClick(ContentType.MOVIE)} className={`text-sm font-semibold transition-colors ${activeCategory === ContentType.MOVIE ? 'text-blue-600 underline underline-offset-4 decoration-2' : 'text-slate-600 hover:text-blue-600'}`}>Movies</button>
            <button onClick={() => handleNavClick(ContentType.EPISODE)} className={`text-sm font-semibold transition-colors ${activeCategory === ContentType.EPISODE ? 'text-blue-600 underline underline-offset-4 decoration-2' : 'text-slate-600 hover:text-blue-600'}`}>Episodes</button>
            <button onClick={() => handleNavClick(ContentType.SPECIAL)} className={`text-sm font-semibold transition-colors ${activeCategory === ContentType.SPECIAL ? 'text-blue-600 underline underline-offset-4 decoration-2' : 'text-slate-600 hover:text-blue-600'}`}>Specials</button>
          </div>
          <a href="https://t.me/doraemon_ever_tamil" target="_blank" className="bg-[#229ED9] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1e88ba] transition-all shadow-md flex items-center gap-2">
            <i className="fa-brands fa-telegram"></i>
            Join Telegram
          </a>
        </div>
      </header>

      <main className="flex-grow">
        <a href="https://www.instagram.com/doraemon_ever_tamil/" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-bold shadow-md hover:brightness-110 transition-all sticky top-[61px] z-30">
          <i className="fa-brands fa-instagram mr-2 text-lg align-middle"></i>
          Follow @doraemon_ever_tamil on Instagram for more!
        </a>

        <section className={`bg-gradient-to-b from-blue-50 via-white to-white transition-all duration-500 ease-in-out ${isShowingList ? 'pt-8 pb-10' : 'pt-24 pb-32'}`}>
          <div className="max-w-4xl mx-auto text-center px-4">
            {!isShowingList && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest shadow-sm">Powered by DET & Gemini AI</div>
                <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">Find Your Favorite <br /> <span className="text-blue-600">Doraemon</span> Moment.</h2>
                <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">Search episodes, movies, and specials in Tamil. <br className="hidden sm:block" /> Describe the story and our AI finds the link.</p>
              </div>
            )}
            <SearchBox onSearch={handleSearch} isLoading={isLoading} setIsLoading={setIsLoading} activeCategory={activeCategory} />
            {searchResults?.didYouMean && (
              <p className="mt-4 text-sm text-blue-500 italic">Did you mean: <button onClick={() => handleSearch({matches: dataset.filter(d => d.title.toLowerCase().includes(searchResults.didYouMean!.toLowerCase())), isLowConfidence: true}, searchResults.didYouMean!)} className="font-bold underline hover:text-blue-700">{searchResults.didYouMean}</button>?</p>
            )}
          </div>
        </section>

        {isShowingList && (
          <section id="results-section" className={`max-w-7xl mx-auto px-4 sm:px-6 py-10 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
            {currentQuery && (
              <div className="mb-8 p-6 bg-white border border-blue-100 rounded-3xl shadow-sm">
                <p className="text-slate-500 text-xs mb-1 font-bold uppercase tracking-wider">Search query:</p>
                <h3 className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight leading-tight">"{currentQuery}"</h3>
              </div>
            )}

            {/* BEST MATCH: Perfect hits */}
            {bestMatches.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm flex items-center gap-2">
                    <i className="fa-solid fa-crown text-[10px]"></i>
                    Best Match
                  </span>
                  <div className="h-px flex-grow bg-amber-100"></div>
                </div>
                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                  {bestMatches.map(item => (
                    <ResultCard 
                      key={item.id} 
                      item={item} 
                      searchReasoning={searchResults?.reasoningMap?.[item.id]} 
                      matchType={searchResults?.matchTypeMap?.[item.id]} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* RELATED RESULTS: Other search content */}
            {relatedMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                    <i className="fa-solid fa-list-ul text-[10px]"></i>
                    Related Results
                  </span>
                  <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {relatedMatches.map(item => (
                    <ResultCard 
                      key={item.id} 
                      item={item} 
                      searchReasoning={searchResults?.reasoningMap?.[item.id]} 
                      matchType={searchResults?.matchTypeMap?.[item.id]} 
                    />
                  ))}
                </div>
              </div>
            )}

            {allFilteredResults.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
                <div className="text-6xl mb-6">🛸</div>
                <h4 className="text-xl font-black text-slate-800 mb-2">No results found</h4>
                <p className="text-slate-500 text-sm mb-8">Try adjusting your filters or searching for something else!</p>
                <button onClick={resetSearch} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                  Clear Search
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="bg-slate-900 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-robot"></i>
            </div>
            <h1 className="text-sm font-black tracking-tighter uppercase">
              DET<span className="text-white/70">FINDER</span>
            </h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Crafted for Doraemon Fans in Tamil • Powered by DET</p>
          <div className="flex justify-center gap-6 mb-8 text-slate-500">
             <a href="https://t.me/doraemon_ever_tamil" className="hover:text-blue-400 transition-colors"><i className="fa-brands fa-telegram text-xl"></i></a>
             <a href="https://www.instagram.com/doraemon_ever_tamil/" className="hover:text-pink-400 transition-colors"><i className="fa-brands fa-instagram text-xl"></i></a>
          </div>
          <p className="text-slate-500 text-xs font-medium tracking-wide">&copy; {new Date().getFullYear()} DET Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
