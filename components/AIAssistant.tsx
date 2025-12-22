
import React, { useState, useEffect, useRef } from 'react';
import { SearchService } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hello! I am your Future Pocket Assistant. How can I help you find a Doraemon adventure today? 🚁' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = SearchService.startChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      if (!chatRef.current) chatRef.current = SearchService.startChat();
      
      const result = await chatRef.current.sendMessageStream({ message: userMessage });
      let fullText = '';
      
      // Temporary message for streaming
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', text: fullText };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: "Oh no! My 4D pocket is jammed. Please try again later! 🛸" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[380px] h-[500px] bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-blue-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">Pocket Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] opacity-80 font-bold uppercase tracking-tighter">Powered by DET • Online from 2124</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {m.text || (isTyping && i === messages.length - 1 ? <span className="animate-pulse">...</span> : '')}
                </div>
              </div>
            ))}
            {isTyping && !messages[messages.length-1].text && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-50">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-blue-300 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 p-2 disabled:opacity-30"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl transition-all hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-slate-900 rotate-45' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-300/50'
        }`}
      >
        {isOpen ? (
          <i className="fa-solid fa-plus"></i>
        ) : (
          <div className="relative">
            <i className="fa-solid fa-bell animate-swing"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
          </div>
        )}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s infinite ease-in-out;
          display: inline-block;
        }
      `}} />
    </div>
  );
};
