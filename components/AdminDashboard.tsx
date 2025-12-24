import React, { useState } from "react";
import { ContentItem, ContentType, Language } from "../types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    type: ContentType.MOVIE,
    language: Language.TAMIL,
    imdbRating: "",
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "content_items"), {
        ...formData,
        keywords: keywordInput
          .split(",")
          .map(k => k.trim())
          .filter(Boolean),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("✅ Content added successfully");
      onClose();
    } catch (err) {
      alert("❌ Failed to add content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase">Admin Terminal</h2>
            <p className="text-slate-400 text-[10px] uppercase">Database Control</p>
          </div>
          <button onClick={onClose}>
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* TITLE */}
          <input
            required
            placeholder="Title"
            className="md:col-span-2 input"
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          {/* TYPE */}
          <select
            className="input"
            onChange={e =>
              setFormData({ ...formData, type: e.target.value as ContentType })
            }
          >
            {Object.values(ContentType).map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {/* LANGUAGE */}
          <select
            className="input"
            onChange={e =>
              setFormData({ ...formData, language: e.target.value as Language })
            }
          >
            {Object.values(Language).map(l => (
              <option key={l}>{l}</option>
            ))}
          </select>

          {/* TELEGRAM */}
          <input
            required
            placeholder="Telegram Link"
            className="input"
            onChange={e =>
              setFormData({ ...formData, telegram_link: e.target.value })
            }
          />

          {/* IMAGE */}
          <input
            placeholder="Image URL"
            className="input"
            onChange={e =>
              setFormData({ ...formData, image: e.target.value })
            }
          />

          {/* KEYWORDS */}
          <input
            required
            placeholder="Keywords (comma separated)"
            className="input"
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
          />

          {/* IMDB */}
          <input
            placeholder="IMDB Rating"
            className="input"
            onChange={e =>
              setFormData({ ...formData, imdbRating: e.target.value })
            }
          />

          {/* DESCRIPTION */}
          <textarea
            required
            rows={3}
            placeholder="Description"
            className="md:col-span-2 input resize-none"
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black"
          >
            {loading ? "Saving..." : "Push to Database"}
          </button>
        </form>
      </div>
    </div>
  );
};
