
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { dataset } from "../data/dataset";
import { ContentItem, SearchResult, ContentType, MatchType } from "../types";

const searchCache = new Map<string, SearchResult>();
// The API key is obtained from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Calculates the Levenshtein distance between two strings to handle typos.
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function getFuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (t === q) return 1.0;
  if (t.includes(q) || q.includes(t)) {
    const ratio = Math.min(q.length, t.length) / Math.max(q.length, t.length);
    return 0.8 + (ratio * 0.15);
  }
  const distance = getLevenshteinDistance(q, t);
  const maxLength = Math.max(q.length, t.length);
  const score = 1 - distance / maxLength;
  return Math.max(0, score);
}

export class SearchService {
  /**
   * Performs an AI-powered fuzzy search over the dataset.
   * Prioritizes keyword matches over partial title matches.
   */
  static async fuzzySearch(query: string, contentType?: ContentType | 'All'): Promise<SearchResult> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return { matches: [] };

    const cacheKey = `${trimmedQuery.toLowerCase()}_${contentType || 'All'}`;
    if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)!;

    // 1. Calculate local keyword scores (Higher priority)
    const keywordMatchHints = dataset.map(item => {
      const bestKeywordScore = Math.max(...item.keywords.map(k => getFuzzyScore(trimmedQuery, k)));
      // Boost exact keyword matches
      const isExactKeyword = item.keywords.some(k => k.toLowerCase() === trimmedQuery.toLowerCase());
      return { id: item.id, score: isExactKeyword ? 1.0 : bestKeywordScore, type: 'Keyword-based' };
    });

    // 2. Calculate local title scores
    const titleMatchHints = dataset.map(item => ({ 
      id: item.id, 
      score: getFuzzyScore(trimmedQuery, item.title),
      type: 'Title-match' 
    }));

    // Identify top contenders for AI context and fallback
    const bestLocalMatches = [...keywordMatchHints, ...titleMatchHints]
      .filter(hint => hint.score > 0.6)
      .sort((a, b) => b.score - a.score);

    try {
      const filteredDataset = (contentType && contentType !== 'All') 
        ? dataset.filter(d => d.type === contentType)
        : dataset;

      const prompt = `
        You are an intelligent search assistant for "DET Finder", a Doraemon content portal.
        Your goal is to find items that match the user's intent: "${trimmedQuery}"
        
        PRIORITY RULES:
        1. Exact matches for KEYWORDS are the highest priority. If a user searches for "birds" and a movie has "birds" as a keyword, it's a perfect match.
        2. Plot-based descriptions (Story-based) are secondary but highly relevant.
        3. Partial title matches are tertiary.
        
        DATASET:
        ${filteredDataset.map(d => `- ID: ${d.id}, Title: ${d.title}, Keywords: [${d.keywords.join(', ')}], Desc: ${d.description}`).join('\n')}

        TASK:
        1. Return a list of matched items.
        2. Provide a relevanceScore (0-100). Exact keyword matches MUST be 95-100.
        3. Categorize: 'Title-match', 'Story-based', 'Keyword-based', 'Event-based', or 'Scene-based'.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isVagueQuery: { type: Type.BOOLEAN },
              results: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemId: { type: Type.STRING },
                    matchType: { type: Type.STRING },
                    relevanceScore: { type: Type.INTEGER },
                    reasoning: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["itemId", "matchType", "relevanceScore", "reasoning"]
                }
              },
              didYouMean: { type: Type.STRING }
            },
            required: ["isVagueQuery", "results"]
          }
        }
      });

      const res = JSON.parse(response.text || '{}');
      let results = res.results || [];
      
      // Merge local high-confidence matches (especially keywords) if AI missed them
      bestLocalMatches.forEach(local => {
        if (!results.some((r: any) => r.itemId === local.id)) {
          if (local.score >= 0.9) {
            results.unshift({
              itemId: local.id,
              matchType: local.type as MatchType,
              relevanceScore: Math.round(local.score * 100),
              reasoning: [`Local heuristics detected a very strong ${local.type.toLowerCase()}.`]
            });
          }
        } else {
          // If AI found it, but it was an exact keyword match, ensure the score reflects that
          const existing = results.find((r: any) => r.itemId === local.id);
          if (local.score === 1.0 && local.type === 'Keyword-based') {
            existing.relevanceScore = 100;
            existing.matchType = 'Keyword-based';
          }
        }
      });

      const reasoningMap: Record<string, string[]> = {};
      const matchTypeMap: Record<string, MatchType> = {};
      const relevanceScoreMap: Record<string, number> = {};

      const matches = dataset.filter(item => {
        const r = results.find((res: any) => res.itemId === item.id);
        if (r) {
          reasoningMap[item.id] = r.reasoning;
          matchTypeMap[item.id] = r.matchType as MatchType;
          relevanceScoreMap[item.id] = r.relevanceScore;
          return true;
        }
        return false;
      });

      const searchResult = { matches, reasoningMap, matchTypeMap, relevanceScoreMap, didYouMean: res.didYouMean, isVagueQuery: res.isVagueQuery };
      searchCache.set(cacheKey, searchResult);
      return searchResult;
    } catch (e) {
      console.error("Gemini Search Error:", e);
      // Fallback to local only
      const matches = dataset.filter(item => bestLocalMatches.some(b => b.id === item.id));
      return { matches };
    }
  }

  static getSuggestions(query: string): string[] {
    const normalized = query.toLowerCase();
    return dataset
      .map(item => {
        const titleScore = getFuzzyScore(normalized, item.title);
        const keywordScore = Math.max(...item.keywords.map(k => getFuzzyScore(normalized, k)));
        return { title: item.title, score: Math.max(titleScore, keywordScore) };
      })
      .filter(e => e.score > 0.4)
      .sort((a, b) => b.score - a.score)
      .map(e => e.title)
      .slice(0, 5);
  }

  /**
   * Initializes a conversational Gemini Chat session for the Assistant.
   */
  static startChat(): Chat {
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `
          You are the "Future Pocket Assistant," powered by Google Gemini AI.
          You are a 22nd-century robot helper specifically for Doraemon fans on the DET Finder app.
          
          CORE MISSION:
          - Help users find movies, episodes, and specials.
          - Use a friendly, polite, and enthusiastic tone (like Doraemon).
          - Use emojis often: 🚁, 📦, 🚪, 🐱.
          
          KNOWLEDGE BASE:
          You have full access to these titles:
          ${dataset.map(d => `- ${d.title} (${d.type})`).join('\n')}
          
          RESPONSE STYLE:
          - Concise, playful, and helpful.
          - Mention specific gadgets if relevant.
        `
      }
    });
  }
}
