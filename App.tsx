
import React, { useState, useMemo, useEffect } from 'react';
import { dataset as initialDataset } from './data/dataset';
import { SearchBox } from './components/SearchBox';
import { ResultCard } from './components/ResultCard';
import { FollowPopup } from './components/FollowPopup';
import { AIAssistant } from './components/AIAssistant';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { DetailModal } from './components/DetailModal';
import { MovieRecommender } from './components/MovieRecommender';
import { ContentType, SearchResult, User, UserRole, ContentItem } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [customDataset, setCustomDataset] = useState<ContentItem[]>([]);
  
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<ContentType | 'All'>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showFollowPopup, setShowFollowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Load persistent user and custom data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('det_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedCustom = localStorage.getItem('det_custom_data');
    if (storedCustom) setCustomDataset(JSON.parse(storedCustom));

    const timer = setTimeout(() => {
      setShowFollowPopup(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const combinedDataset = useMemo(() => [...initialDataset, ...customDataset], [customDataset]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('det_user', JSON.stringify(u));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('det_user');
    setShowAdmin(false);
  };

  const handleAddItem = (item: ContentItem) => {
    const updated = [...customDataset, item];
    setCustomDataset(updated);
    localStorage.setItem('det_custom_data', JSON.stringify(updated));
  };

  const handleSearch = (results: SearchResult, query: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSearchResults(results);
      setCurrentQuery(query);
      setIsTransitioning(false);
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 300);
  };

  // Handler for "Find Scenes" in Recommender
  const handlePreFillSearch = (title: string) => {
      // We trigger a search via the SearchBox essentially by scrolling up and setting state,
      // but SearchBox manages its own input state. 
      // A cleaner way in this architecture is to treat it as a search result directly
      // OR scroll to search and let user type. 
      // Requirement said "Find Scenes". Let's perform a search for that title.
      
      const results = combinedDataset.filter(item => 
          item.title.toLowerCase().includes(title.toLowerCase())
      );
      
      handleSearch({ matches: results, matchTypeMap: {}, relevanceScoreMap: {} }, title);
  };

  const isShowingList = searchResults !== null || activeCategory !== 'All';

  const allFilteredResults = useMemo(() => {
    if (searchResults) {
      let items = [...searchResults.matches];
      if (activeCategory !== 'All') {
        items = items.filter(item => item.type === activeCategory);
      }
      items.sort((a, b) => {
        const typeA = searchResults.matchTypeMap?.[a.id] || '';
        const typeB = searchResults.matchTypeMap?.[b.id] || '';
        const priority: Record<string, number> = { 
          'Title-match': 1, 
          'Story-based': 2, 
          'Event-based': 3, 
          'Scene-based': 4, 
          'Keyword-based': 5 
        };
        const pA = priority[typeA] || 99;
        const pB = priority[typeB] || 99;
        if (pA !== pB) return pA - pB;
        const scoreA = searchResults.relevanceScoreMap?.[a.id] || 0;
        const scoreB = searchResults.relevanceScoreMap?.[b.id] || 0;
        return scoreB - scoreA;
      });
      return items;
    }
    if (activeCategory !== 'All') {
      return combinedDataset.filter(item => item.type === activeCategory);
    }
    return [];
  }, [searchResults, activeCategory, combinedDataset]);

  const { bestMatches, relatedMatches } = useMemo(() => {
    if (!searchResults) return { bestMatches: [], relatedMatches: allFilteredResults };
    const best = allFilteredResults.filter(item => {
      const type = searchResults.matchTypeMap?.[item.id];
      const score = searchResults.relevanceScoreMap?.[item.id] || 0;
      return type === 'Title-match' || score >= 95;
    });
    const related = allFilteredResults.filter(item => {
      const isBest = best.some(b => b.id === item.id);
      return !isBest;
    });
    return { bestMatches: best, relatedMatches: related };
  }, [allFilteredResults, searchResults]);

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
    if (activeCategory === type && !searchResults) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
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
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }, 300);
  };

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.parentElement?.classList.add('ring-4', 'ring-blue-100');
        setTimeout(() => searchInput.parentElement?.classList.remove('ring-4', 'ring-blue-100'), 1500);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] pb-[80px] md:pb-0">
      <FollowPopup isVisible={showFollowPopup} onClose={() => setShowFollowPopup(false)} />
      <AIAssistant />
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      
      {showLogin && <Login onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      {showAdmin && <AdminDashboard onAddItem={handleAddItem} onClose={() => setShowAdmin(false)} />}

      {/* Top Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-[45] shadow-sm">
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

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => handleNavClick('All')} className={`text-xs font-black transition-all px-4 py-1.5 rounded-full border ${activeCategory === 'All' && !searchResults ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}>MOVIE FINDER</button>
            <button onClick={() => handleNavClick(ContentType.MOVIE)} className={`text-xs font-bold transition-colors ${activeCategory === ContentType.MOVIE ? 'text-blue-600 underline underline-offset-4 decoration-2' : 'text-slate-500 hover:text-blue-600'}`}>MOVIES</button>
            <button onClick={() => handleNavClick(ContentType.EPISODE)} className={`text-xs font-bold transition-colors ${activeCategory === ContentType.EPISODE ? 'text-blue-600 underline underline-offset-4 decoration-2' : 'text-slate-500 hover:text-blue-600'}`}>EPISODES</button>
            <button onClick={() => handleNavClick(ContentType.SPECIAL)} className={`text-xs font-bold transition-colors ${activeCategory === ContentType.SPECIAL ? 'text-blue-600 underline underline-offset-4 decoration-2' : 'text-slate-500 hover:text-blue-600'}`}>SPECIALS</button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{user.username}</span>
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">ADMIN ACCESS</span>
                </div>
                <button onClick={() => setShowAdmin(true)} className="p-2.5 bg-slate-900 text-white rounded-xl text-xs hover:bg-slate-800 transition-all shadow-md">
                  <i className="fa-solid fa-plus"></i>
                </button>
                <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs hover:bg-red-100 transition-all">
                  <i className="fa-solid fa-power-off"></i>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
              >
                <i className="fa-solid fa-lock"></i>
                <span>ADMIN</span>
              </button>
            )}
            <a href="https://t.me/doraemon_ever_tamil" target="_blank" className="bg-[#229ED9] text-white p-2.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold hover:bg-[#1e88ba] transition-all shadow-md flex items-center gap-2">
              <i className="fa-brands fa-telegram"></i>
              <span className="hidden sm:inline">JOIN</span>
            </a>
          </div>
        </div>
      </header>
      
      {/* Mobile Top Category Navigation (Visible on small screens) */}
      <nav className="lg:hidden sticky top-[61px] z-40 bg-white/95 backdrop-blur-md border-b border-blue-50 overflow-x-auto">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">
            <button 
              onClick={() => handleNavClick('All')} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                activeCategory === 'All' && !searchResults 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              All Content
            </button>
            <button 
              onClick={() => handleNavClick(ContentType.MOVIE)} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                activeCategory === ContentType.MOVIE 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Movies
            </button>
            <button 
              onClick={() => handleNavClick(ContentType.EPISODE)} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                activeCategory === ContentType.EPISODE 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Episodes
            </button>
            <button 
              onClick={() => handleNavClick(ContentType.SPECIAL)} 
              className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                activeCategory === ContentType.SPECIAL 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Specials
            </button>
        </div>
      </nav>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[55] bg-white/95 backdrop-blur-md border-t border-blue-100 flex items-center justify-around pt-3 pb-6 px-4 md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <button onClick={() => handleNavClick('All')} className={`flex flex-col items-center gap-1.5 transition-all ${activeCategory === 'All' && !searchResults ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeCategory === 'All' && !searchResults ? 'bg-blue-50' : ''}`}><i className="fa-solid fa-house text-xl"></i></div>
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Home</span>
        </button>
        <button onClick={() => handleNavClick(ContentType.MOVIE)} className={`flex flex-col items-center gap-1.5 transition-all ${activeCategory === ContentType.MOVIE ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeCategory === ContentType.MOVIE ? 'bg-blue-50' : ''}`}><i className="fa-solid fa-film text-xl"></i></div>
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Movies</span>
        </button>
        <button onClick={() => handleNavClick(ContentType.EPISODE)} className={`flex flex-col items-center gap-1.5 transition-all ${activeCategory === ContentType.EPISODE ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeCategory === ContentType.EPISODE ? 'bg-blue-50' : ''}`}><i className="fa-solid fa-tv text-xl"></i></div>
          <span className="text-[10px] font-extrabold uppercase tracking-tight">Episodes</span>
        </button>
        <button onClick={scrollToSearch} className="flex flex-col items-center gap-1.5 text-blue-600 group active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center -translate-y-6 shadow-xl shadow-blue-300 ring-4 ring-white">
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight -mt-5">AI Finder</span>
        </button>
      </nav>

      <main className="flex-grow">
        <a href="https://www.instagram.com/doraemon_ever_tamil/" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-bold shadow-md hover:brightness-110 transition-all sticky top-[61px] lg:top-[61px] z-30">
          <i className="fa-brands fa-instagram mr-2 text-lg align-middle"></i>
          Follow @doraemon_ever_tamil on Instagram for more!
        </a>

        {/* Movie Recommender Section - ONLY Show when not showing a search list */}
        {!isShowingList && (
           <MovieRecommender onViewDetails={setSelectedItem} onFindScenes={handlePreFillSearch} />
        )}

        <section className={`bg-gradient-to-b from-blue-50 via-white to-white transition-all duration-500 ease-in-out ${isShowingList ? 'pt-8 pb-10' : 'pt-10 pb-32'}`}>
          <div className="max-w-4xl mx-auto text-center px-4">
            {!isShowingList && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest shadow-sm">Powered by DET</div>
                <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">Find Your Favorite <br /> <span className="text-blue-600">Doraemon</span> Moment.</h2>
                <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">Search episodes, movies, and specials in Tamil. <br className="hidden sm:block" /> Describe the story and our AI finds the link.</p>
              </div>
            )}
            
            <SearchBox onSearch={handleSearch} isLoading={isLoading} setIsLoading={setIsLoading} activeCategory={activeCategory} customDataset={customDataset} />
            
            {searchResults?.didYouMean && (
              <p className="mt-4 text-sm text-blue-500 italic">Did you mean: <button onClick={() => handleSearch({matches: combinedDataset.filter(d => d.title.toLowerCase().includes(searchResults.didYouMean!.toLowerCase())), isLowConfidence: true}, searchResults.didYouMean!)} className="font-bold underline hover:text-blue-700">{searchResults.didYouMean}</button>?</p>
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
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* RELATED RESULTS */}
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
                      onClick={() => setSelectedItem(item)}
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

        {/* Official Disclaimer Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
          <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <i className="fa-solid fa-scale-balanced text-8xl text-blue-900"></i>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
                  <i className="fa-solid fa-circle-info"></i>
                </div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-[0.2em]">Legal Disclaimer</h3>
              </div>
              <div className="space-y-4 max-w-4xl">
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  <strong>DET Finder</strong> is an unofficial, non-commercial fan-powered platform created solely for the Doraemon fan community. This website does not host, store, or upload any video files or copyrighted media on its servers. We provide an indexed search engine that directs users to content links available on external platforms like Telegram.
                </p>
                <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed italic">
                  All characters, names, images, and related media are the exclusive intellectual property of their respective owners, including but not limited to <strong>Fujiko F. Fujio, Shin-Ei Animation, TV Asahi, and ADK</strong>. No copyright infringement is intended. If you are a copyright owner and wish to have content removed, please contact the respective hosting platforms directly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-16 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg"><i className="fa-solid fa-robot"></i></div>
                <h1 className="text-xl font-black tracking-tighter uppercase">DET<span className="text-white/70">FINDER</span></h1>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Your future pocket assistant for everything Doraemon. Find your favorite moments, movies, and episodes in Tamil instantly.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Navigation</h4>
              <button onClick={() => handleNavClick('All')} className="text-slate-400 hover:text-white transition-colors text-sm font-bold">Movie Finder</button>
              <button onClick={() => handleNavClick(ContentType.MOVIE)} className="text-slate-400 hover:text-white transition-colors text-sm font-bold">Movies</button>
              <button onClick={() => handleNavClick(ContentType.EPISODE)} className="text-slate-400 hover:text-white transition-colors text-sm font-bold">Episodes</button>
              <button onClick={scrollToSearch} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-black italic">AI Finder</button>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Connect</h4>
              <a href="https://t.me/doraemon_ever_tamil" target="_blank" className="flex items-center justify-center sm:justify-start gap-3 text-slate-400 hover:text-[#229ED9] transition-colors text-sm font-bold"><i className="fa-brands fa-telegram text-xl"></i> Telegram Channel</a>
              <a href="https://www.instagram.com/doraemon_ever_tamil/" target="_blank" className="flex items-center justify-center sm:justify-start gap-3 text-slate-400 hover:text-pink-400 transition-colors text-sm font-bold"><i className="fa-brands fa-instagram text-xl"></i> Instagram Feed</a>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Crafted for Doraemon Fans in Tamil • Powered by DET</p>
            <p className="text-slate-600 text-[10px] font-medium tracking-wide mb-6">&copy; {new Date().getFullYear()} DET Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
