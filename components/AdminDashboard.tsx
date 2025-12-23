
import React, { useState } from 'react';
import { ContentItem, ContentType, Language } from '../types';

interface AdminDashboardProps {
  onAddItem: (item: ContentItem) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onAddItem, onClose }) => {
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    type: ContentType.MOVIE,
    language: Language.TAMIL,
    keywords: [],
    imdbRating: ''
  });
  const [keywordInput, setKeywordInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ContentItem = {
      ...formData as ContentItem,
      id: `custom-${Date.now()}`,
      keywords: keywordInput.split(',').map(k => k.trim()).filter(k => k !== '')
    };
    onAddItem(newItem);
    onClose();
    alert('Content added successfully!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-2xl my-8 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Admin Terminal</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Database Management</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Title</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              placeholder="e.g. Nobita and the Galaxy Express"
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Content Type</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as ContentType})}
            >
              {Object.values(ContentType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Language</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              value={formData.language}
              onChange={e => setFormData({...formData, language: e.target.value as Language})}
            >
              {Object.values(Language).map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Telegram Link</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              placeholder="https://t.me/..."
              onChange={e => setFormData({...formData, telegram_link: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Image URL</label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              placeholder="https://..."
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Keywords (Comma separated)</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              placeholder="e.g. space, stars, adventure"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">IMDB Rating (Optional)</label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
              placeholder="e.g. 7.5"
              onChange={e => setFormData({...formData, imdbRating: e.target.value})}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none resize-none"
              placeholder="Brief summary of the content..."
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Push to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
