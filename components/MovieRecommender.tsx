
import React, { useState, useEffect } from 'react';
import { ContentItem, ContentType } from '../types';
import { dataset } from '../data/dataset';

interface MovieRecommenderProps {
  onViewDetails: (item: ContentItem) => void;
  onFindScenes: (movieTitle: string) => void;
}

// ------------------------------------------------------------------
// 1. Data Structure Definition
// ------------------------------------------------------------------

type Mood = 'Emotional' | 'Happy' | 'Goosebumps' | 'Thought-provoking';
type StoryType = 'Friendship & bonding' | 'Adventure & action' | 'Sci-fi & gadgets' | 'Life lesson';
type CharacterFocus = 'Nobita' | 'Doraemon' | 'All friends' | 'Any';
type Ending = 'Happy' | 'Emotional' | 'Surprise' | 'Any';
type Era = 'Classic' | 'Modern' | 'Any';

interface MovieLogicItem {
  id: string; // Must match dataset.ts IDs
  title: string;
  year: number;
  mood: Mood;
  storyType: StoryType;
  character: CharacterFocus;
  ending: Ending;
  era: Era;
  dominant: boolean; // Flag for over-popular movies to apply anti-dominance penalty
}

// ------------------------------------------------------------------
// 2. Recommendation Database
// ------------------------------------------------------------------

const recommendationDatabase: MovieLogicItem[] = [
  {
    id: 's-stand-by-me-1',
    title: 'Stand by Me Doraemon',
    year: 2014,
    mood: 'Emotional',
    storyType: 'Friendship & bonding',
    character: 'Nobita',
    ending: 'Happy',
    era: 'Modern',
    dominant: true
  },
  {
    id: 's-stand-by-me-2',
    title: 'Stand by Me Doraemon 2',
    year: 2020,
    mood: 'Emotional',
    storyType: 'Life lesson',
    character: 'Nobita',
    ending: 'Emotional',
    era: 'Modern',
    dominant: true
  },
  {
    id: 'm-steel-troops',
    title: 'Nobita and the New Steel Troops',
    year: 2011,
    mood: 'Goosebumps',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Emotional',
    era: 'Modern',
    dominant: true
  },
  {
    id: 'm-sky-utopia',
    title: "Nobita's Sky Utopia",
    year: 2023,
    mood: 'Thought-provoking',
    storyType: 'Friendship & bonding',
    character: 'All friends',
    ending: 'Happy',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-treasure-island',
    title: "Nobita's Treasure Island",
    year: 2018,
    mood: 'Goosebumps',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Emotional',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-gadget-museum',
    title: "Nobita's Secret Gadget Museum",
    year: 2013,
    mood: 'Happy',
    storyType: 'Sci-fi & gadgets',
    character: 'Doraemon',
    ending: 'Happy',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-earth-symphony',
    title: "Nobita's Earth Symphony",
    year: 2024,
    mood: 'Happy',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Happy',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-underworld',
    title: "Nobita's New Great Adventure into the Underworld",
    year: 2007,
    mood: 'Goosebumps',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Happy',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-birth-japan',
    title: "Nobita and the Birth of Japan",
    year: 2016,
    mood: 'Happy',
    storyType: 'Life lesson',
    character: 'All friends',
    ending: 'Happy',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-moon-exploration',
    title: "Nobita's Chronicle of the Moon Exploration",
    year: 2019,
    mood: 'Thought-provoking',
    storyType: 'Sci-fi & gadgets',
    character: 'All friends',
    ending: 'Surprise',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-little-star-wars',
    title: "Nobita's Little Star Wars 2021",
    year: 2021,
    mood: 'Goosebumps',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Happy',
    era: 'Modern',
    dominant: false
  },
  {
    id: 'm-dinosaur',
    title: "Nobita's Dinosaur",
    year: 2006,
    mood: 'Emotional',
    storyType: 'Friendship & bonding',
    character: 'Nobita',
    ending: 'Emotional',
    era: 'Classic', // Using Classic feel for 2006 or 1980 version logic
    dominant: true
  },
  {
    id: 'm-kingdom-clouds',
    title: "Nobita and the Kingdom of Clouds",
    year: 1992,
    mood: 'Thought-provoking',
    storyType: 'Life lesson',
    character: 'Doraemon',
    ending: 'Surprise',
    era: 'Classic',
    dominant: false
  },
  {
    id: 'm-dorabian-nights',
    title: "Nobita's Dorabian Nights",
    year: 1991,
    mood: 'Goosebumps',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Happy',
    era: 'Classic',
    dominant: false
  },
  {
    id: 'm-steel-troops', // Mapping classic logic to same ID if dataset only has one, or separate if needed
    title: "Nobita and the Steel Troops (Original)", 
    year: 1986,
    mood: 'Emotional',
    storyType: 'Adventure & action',
    character: 'All friends',
    ending: 'Emotional',
    era: 'Classic',
    dominant: false
  },
  {
    id: 'm-wan-nyan',
    title: "Wan Nyan Spacetime Odyssey",
    year: 2004,
    mood: 'Emotional',
    storyType: 'Life lesson',
    character: 'Nobita',
    ending: 'Emotional',
    era: 'Classic',
    dominant: false
  },
  {
    id: 'm-tin-labyrinth',
    title: "Nobita and the Tin Labyrinth",
    year: 1993,
    mood: 'Goosebumps',
    storyType: 'Sci-fi & gadgets',
    character: 'Nobita',
    ending: 'Happy',
    era: 'Classic',
    dominant: false
  }
];

// ------------------------------------------------------------------
// 3. Questions Configuration
// ------------------------------------------------------------------

const questions = [
  {
    id: 'mood',
    text: "What's your mood right now?",
    options: [
      { label: 'Emotional 😢', value: 'Emotional', color: 'bg-blue-50 border-blue-200' },
      { label: 'Happy 😄', value: 'Happy', color: 'bg-yellow-50 border-yellow-200' },
      { label: 'Goosebumps 🔥', value: 'Goosebumps', color: 'bg-red-50 border-red-200' },
      { label: 'Thoughtful 🤔', value: 'Thought-provoking', color: 'bg-purple-50 border-purple-200' }
    ]
  },
  {
    id: 'storyType',
    text: "What type of story do you want?",
    options: [
      { label: 'Friendship 🤝', value: 'Friendship & bonding' },
      { label: 'Action ⚔️', value: 'Adventure & action' },
      { label: 'Sci-Fi 🤖', value: 'Sci-fi & gadgets' },
      { label: 'Life Lesson 🌱', value: 'Life lesson' }
    ]
  },
  {
    id: 'character',
    text: "Who should be the main focus?",
    options: [
      { label: 'Nobita 🤓', value: 'Nobita' },
      { label: 'Doraemon 🐱', value: 'Doraemon' },
      { label: 'Team 👨‍👩‍👧‍👦', value: 'All friends' },
      { label: 'Any 🎲', value: 'Any' }
    ]
  },
  {
    id: 'ending',
    text: "How should it end?",
    options: [
      { label: 'Happy 🎉', value: 'Happy' },
      { label: 'Tearjerker 😭', value: 'Emotional' },
      { label: 'Mind-blowing 🤯', value: 'Surprise' },
      { label: 'Surprise Me 🤷', value: 'Any' }
    ]
  },
  {
    id: 'era',
    text: "Preferred Animation Style?",
    options: [
      { label: 'Modern (Crisp) ✨', value: 'Modern' },
      { label: 'Classic (Nostalgic) 📺', value: 'Classic' },
      { label: 'No Preference 🌀', value: 'Any' }
    ]
  }
];

export const MovieRecommender: React.FC<MovieRecommenderProps> = ({ onViewDetails, onFindScenes }) => {
  const [step, setStep] = useState(0); // 0=Intro, 1-5=Questions, 6=Loading, 7=Result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ContentItem | null>(null);
  const [reasoning, setReasoning] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [recentHistory, setRecentHistory] = useState<string[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('det_recent_recommendations');
    if (history) {
      try {
        setRecentHistory(JSON.parse(history));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleStart = () => advanceStep(1);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (step < questions.length) {
      advanceStep(step + 1);
    } else {
      // Calculate result after the last question (step 5)
      calculateResult({ ...answers, [questionId]: value });
    }
  };

  const advanceStep = (nextStep: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsAnimating(false);
    }, 300);
  };

  const calculateResult = (finalAnswers: Record<string, string>) => {
    setIsAnimating(true);
    // Move to loading step
    setStep(questions.length + 1);

    setTimeout(() => {
      // -------------------------------------------------------
      // ALGORITHM IMPLEMENTATION
      // -------------------------------------------------------
      
      const scores = recommendationDatabase.map(movie => {
        let score = 0;
        let reasons: string[] = [];

        // 1. Mood (Weight: 3)
        if (movie.mood === finalAnswers.mood) {
          score += 3;
          reasons.push(finalAnswers.mood);
        }

        // 2. Story Type (Weight: 2)
        if (movie.storyType === finalAnswers.storyType) {
          score += 2;
          reasons.push(movie.storyType.split(' ')[0]); // "Adventure" from "Adventure & Action"
        }

        // 3. Character (Weight: 2)
        if (finalAnswers.character !== 'Any') {
          if (movie.character === finalAnswers.character) {
            score += 2;
            reasons.push(`${movie.character}-focused`);
          }
        }

        // 4. Ending (Weight: 1)
        if (finalAnswers.ending !== 'Any') {
          if (movie.ending === finalAnswers.ending) score += 1;
        }

        // 5. Era (Weight: 1)
        if (finalAnswers.era !== 'Any') {
          if (movie.era === finalAnswers.era) {
            score += 1;
          }
        }

        // 6. Anti-Dominance Penalty
        if (movie.dominant) {
          score -= 1;
        }

        // 7. Recent History Penalty
        if (recentHistory.includes(movie.id)) {
          score -= 2;
        }

        return { ...movie, score, reasons };
      });

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Top-Tier Randomization
      // Get the max score
      const maxScore = scores[0].score;
      // Filter candidates that are within 1 point of the max score
      // This ensures we don't always pick the absolute #1 if others are very close
      const topCandidates = scores.filter(s => s.score >= maxScore - 1);

      // Pick random winner from top tier
      const winnerLogic = topCandidates[Math.floor(Math.random() * topCandidates.length)];

      // Construct "Why" string
      const whyString = `Suggested because you chose ${finalAnswers.mood} mood` + 
        (winnerLogic.reasons.length > 1 ? `, wanted ${winnerLogic.reasons[1]} stories` : '') +
        (finalAnswers.character !== 'Any' ? ` focusing on ${finalAnswers.character}` : '') + '.';

      // Map to full dataset item
      // We look for the ID in the main dataset
      let fullMovieItem = dataset.find(item => item.id === winnerLogic.id);
      
      // Fallback if ID mapping fails (should not happen if IDs are synced)
      if (!fullMovieItem) {
        fullMovieItem = dataset.find(item => item.type === ContentType.MOVIE) || dataset[0];
      }

      // Update History
      const newHistory = [winnerLogic.id, ...recentHistory.filter(id => id !== winnerLogic.id)].slice(0, 5);
      localStorage.setItem('det_recent_recommendations', JSON.stringify(newHistory));
      setRecentHistory(newHistory);

      setResult(fullMovieItem);
      setReasoning(whyString);
      setStep(questions.length + 2); // Show Result
      setIsAnimating(false);
    }, 1500); // 1.5s Fake Loading Time
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
  };

  // ------------------------------------------------------------------
  // UI RENDERERS
  // ------------------------------------------------------------------

  // STEP 0: INTRO
  if (step === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-lg border border-blue-100 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <i className="fa-solid fa-wand-magic-sparkles text-8xl text-blue-600"></i>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                    <div className="inline-block px-3 py-1 mb-3 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                        New Feature
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
                        Which Doraemon Movie Should You Watch?
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                        Answer 5 quick questions and let our AI pick your perfect movie!
                    </p>
                </div>
                <button 
                    onClick={handleStart}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
                >
                    Start Quiz <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
      </div>
    );
  }

  // STEP 6: LOADING
  if (step === questions.length + 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="bg-white rounded-[2rem] p-12 shadow-lg border border-blue-100 flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 mb-6">
                 <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                 <i className="fa-solid fa-robot absolute inset-0 flex items-center justify-center text-blue-600 text-2xl animate-pulse"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Analyzing your preferences...</h3>
            <p className="text-slate-500 text-sm">Checking 40+ movies against your mood.</p>
        </div>
      </div>
    );
  }

  // STEP 7: RESULT
  if (step > questions.length + 1 && result) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className={`bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-1 shadow-xl transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-white rounded-[1.8rem] p-6 sm:p-8 overflow-hidden relative">
                {/* Confetti BG effect */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 shrink-0">
                         <div className="relative aspect-video md:aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 bg-slate-200">
                            <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                                {recommendationDatabase.find(r => r.id === result.id)?.year} • Top Pick
                            </div>
                         </div>
                    </div>
                    
                    <div className="w-full md:w-2/3 text-center md:text-left">
                         <h3 className="text-blue-600 font-black text-sm uppercase tracking-widest mb-2">Based on your choices</h3>
                         <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{result.title}</h2>
                         
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 inline-block text-left w-full">
                            <p className="text-slate-600 text-xs sm:text-sm font-medium">
                                <i className="fa-solid fa-quote-left text-blue-300 mr-2"></i>
                                {reasoning}
                            </p>
                         </div>

                         <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                             <button 
                                onClick={() => onViewDetails(result)}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                             >
                                <i className="fa-solid fa-circle-info"></i> View Details
                             </button>
                             <button 
                                onClick={() => onFindScenes(result.title)}
                                className="bg-white text-blue-600 border-2 border-blue-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                             >
                                <i className="fa-solid fa-magnifying-glass"></i> Find Scenes
                             </button>
                             <button 
                                onClick={reset}
                                className="text-slate-400 px-4 py-3 rounded-xl font-bold text-xs hover:text-slate-600 transition-colors"
                             >
                                Restart
                             </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // STEP 1-5: QUESTIONS
  const currentQ = questions[step - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className={`bg-white rounded-[2rem] shadow-lg border border-blue-100 overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'}`}>
        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 w-full">
            <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${((step - 1) / questions.length) * 100}%` }}
            ></div>
        </div>

        <div className="p-6 sm:p-10">
             <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Question {step} of {questions.length}</span>
                <button onClick={reset} className="text-slate-300 hover:text-red-400 transition-colors"><i className="fa-solid fa-xmark"></i></button>
             </div>

             <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-8 text-center">{currentQ.text}</h3>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {currentQ.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(currentQ.id, opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all active:scale-95 flex items-center justify-between group
                            ${(opt as any).color ? (opt as any).color + ' border-transparent' : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50'}
                        `}
                    >
                        <span className="font-bold text-slate-700 group-hover:text-blue-700">{opt.label}</span>
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-400 flex items-center justify-center transition-all">
                             <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"></div>
                        </div>
                    </button>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};
