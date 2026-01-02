
import React, { useState, useEffect } from 'react';
import { ContentItem, ContentType } from '../types';
import { dataset } from '../data/dataset';

interface MovieRecommenderProps {
  onViewDetails: (item: ContentItem) => void;
  onFindScenes: (movieTitle: string) => void;
}

// Attribute Mapping for Recommendation Logic
// This maps specific Movie IDs from the dataset to the quiz attributes
const movieAttributes: Record<string, { mood: string[]; story: string[]; character: string[]; ending: string[] }> = {
  's-stand-by-me-1': {
    mood: ['Emotional', 'Happy'],
    story: ['Friendship & bonding', 'Life lesson'],
    character: ['Nobita', 'Doraemon'],
    ending: ['Emotional', 'Happy']
  },
  's-stand-by-me-2': {
    mood: ['Emotional', 'Thought-provoking'],
    story: ['Family', 'Life lesson'],
    character: ['Nobita'],
    ending: ['Happy', 'Emotional']
  },
  'm-steel-troops': {
    mood: ['Goosebumps', 'Emotional'],
    story: ['Adventure & action', 'Friendship & bonding'],
    character: ['All friends'],
    ending: ['Emotional']
  },
  'm-sky-utopia': {
    mood: ['Thought-provoking', 'Happy'],
    story: ['Sci-fi & gadgets', 'Friendship & bonding'],
    character: ['All friends', 'Doraemon'],
    ending: ['Happy', 'Surprise']
  },
  'm-treasure-island': {
    mood: ['Goosebumps', 'Happy'],
    story: ['Adventure & action'],
    character: ['All friends'],
    ending: ['Happy', 'Emotional']
  },
  'm-gadget-museum': {
    mood: ['Happy'],
    story: ['Sci-fi & gadgets', 'Mystery'],
    character: ['Doraemon', 'Nobita'],
    ending: ['Happy']
  },
  'm-earth-symphony': {
    mood: ['Happy', 'Goosebumps'],
    story: ['Adventure & action', 'Music'],
    character: ['All friends'],
    ending: ['Happy']
  },
  'm-underworld': {
    mood: ['Goosebumps'],
    story: ['Adventure & action', 'Magic'],
    character: ['All friends'],
    ending: ['Happy']
  },
  'm-birth-japan': {
    mood: ['Happy', 'Thought-provoking'],
    story: ['Adventure & action', 'Life lesson'],
    character: ['All friends'],
    ending: ['Happy']
  },
  'm-moon-exploration': {
    mood: ['Thought-provoking', 'Goosebumps'],
    story: ['Sci-fi & gadgets', 'Friendship & bonding'],
    character: ['All friends'],
    ending: ['Surprise', 'Happy']
  }
};

const questions = [
  {
    id: 'mood',
    text: "What's your mood right now?",
    options: [
      { label: 'Emotional 😢', value: 'Emotional', color: 'bg-blue-50 border-blue-200' },
      { label: 'Happy 😄', value: 'Happy', color: 'bg-yellow-50 border-yellow-200' },
      { label: 'Goosebumps 🔥', value: 'Goosebumps', color: 'bg-red-50 border-red-200' },
      { label: 'Thought-provoking 🤔', value: 'Thought-provoking', color: 'bg-purple-50 border-purple-200' }
    ]
  },
  {
    id: 'story',
    text: "What type of story do you want?",
    options: [
      { label: 'Friendship & Bonding 🤝', value: 'Friendship & bonding' },
      { label: 'Adventure & Action ⚔️', value: 'Adventure & action' },
      { label: 'Sci-fi & Gadgets 🤖', value: 'Sci-fi & gadgets' },
      { label: 'Life Lesson 🌱', value: 'Life lesson' }
    ]
  },
  {
    id: 'character',
    text: "Which character should focus on?",
    options: [
      { label: 'Nobita 🤓', value: 'Nobita' },
      { label: 'Doraemon 🐱', value: 'Doraemon' },
      { label: 'All Friends 👨‍👩‍👧‍👦', value: 'All friends' },
      { label: 'Any 🎲', value: 'Any' }
    ]
  },
  {
    id: 'ending',
    text: "How should the ending feel?",
    options: [
      { label: 'Happy 🎉', value: 'Happy' },
      { label: 'Emotional 😭', value: 'Emotional' },
      { label: 'Surprise 🤯', value: 'Surprise' },
      { label: 'Don\'t care 🤷', value: 'Any' }
    ]
  }
];

export const MovieRecommender: React.FC<MovieRecommenderProps> = ({ onViewDetails, onFindScenes }) => {
  const [step, setStep] = useState(0); // 0 = Intro, 1-4 = Questions, 5 = Result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ContentItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load last result from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('det_last_recommendation');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Optional: Could restore state here if we wanted persistent results across reloads
      // For now, we start fresh to encourage interaction, but logic is ready.
    }
  }, []);

  const handleStart = () => {
    advanceStep(1);
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (step < questions.length) {
      advanceStep(step + 1);
    } else {
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
    
    // Scoring Logic
    const scores: Record<string, number> = {};
    
    // Default score for all movies to prevent empty results
    const candidateMovies = dataset.filter(m => m.type === ContentType.MOVIE || m.type === ContentType.SPECIAL);
    
    candidateMovies.forEach(movie => {
      scores[movie.id] = 0;
      const attrs = movieAttributes[movie.id];
      
      if (attrs) {
        // Match Mood
        if (attrs.mood.includes(finalAnswers['mood'])) scores[movie.id] += 3;
        // Match Story
        if (attrs.story.includes(finalAnswers['story'])) scores[movie.id] += 2;
        // Match Character (Weighted less if 'Any')
        if (finalAnswers['character'] !== 'Any' && attrs.character.includes(finalAnswers['character'])) scores[movie.id] += 2;
        // Match Ending
        if (finalAnswers['ending'] !== 'Any' && attrs.ending.includes(finalAnswers['ending'])) scores[movie.id] += 1;
      } else {
        // Fallback for movies not in the manual attribute map: fuzzy match text in description
        const desc = movie.description.toLowerCase();
        if (desc.includes(finalAnswers['mood'].toLowerCase())) scores[movie.id] += 1;
        if (desc.includes(finalAnswers['story'].split(' ')[0].toLowerCase())) scores[movie.id] += 1;
      }
    });

    // Find highest score
    const sortedIds = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const topId = sortedIds[0];
    const topMovie = candidateMovies.find(m => m.id === topId);

    setTimeout(() => {
      if (topMovie) {
        setResult(topMovie);
        localStorage.setItem('det_last_recommendation', JSON.stringify(topMovie));
        setStep(questions.length + 1);
      } else {
        // Fallback to Stand By Me if something fails
        const fallback = candidateMovies.find(m => m.id === 's-stand-by-me-1');
        setResult(fallback || null);
        setStep(questions.length + 1);
      }
      setIsAnimating(false);
    }, 800); // Slight delay for "Thinking" effect
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
  };

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
                        Answer 4 simple questions and let AI pick your perfect movie!
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

  // Result View
  if (step > questions.length && result) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className={`bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-1 shadow-xl transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-white rounded-[1.8rem] p-6 sm:p-8 overflow-hidden relative">
                {/* Confetti BG effect */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 shrink-0">
                         <div className="relative aspect-video md:aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-sm uppercase">Top Pick</div>
                         </div>
                    </div>
                    
                    <div className="w-full md:w-2/3 text-center md:text-left">
                         <h3 className="text-blue-600 font-black text-sm uppercase tracking-widest mb-2">We Recommend</h3>
                         <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{result.title}</h2>
                         
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 inline-block text-left w-full">
                            <p className="text-slate-600 text-xs sm:text-sm italic">
                                <i className="fa-solid fa-quote-left text-blue-300 mr-2"></i>
                                Suggested because you chose <strong>{answers['mood']}</strong>, wanted a <strong>{answers['story']}</strong> story, and prefer <strong>{answers['ending']}</strong> endings.
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

  // Quiz View
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
