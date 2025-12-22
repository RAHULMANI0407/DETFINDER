import { GoogleGenAI, Type, Chat } from "@google/genai";
import { dataset } from "../data/dataset";
import { SearchResult, ContentType, MatchType } from "../types";
import { getCachedSearch, saveCachedSearch } from "../lib/searchCache";

/* =======================
   API KEY ROTATION
======================= */

const keys = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
].filter(Boolean) as string[];

let idx = 0;
const getKey = () => keys[idx++ % keys.length];

/* =======================
   IN-MEMORY CACHE
======================= */

const memoryCache = new Map<string, SearchResult>();

/* =======================
   HELPERS
======================= */

function normalizeKey(query: string, type?: string) {
  return `${query.toLowerCase().trim()}_${type || "All"}`
    .replace(/\s+/g, "_");
}

function buildResult(matches: any[]): SearchResult {
  return {
    matches,
    reasoningMap: {},
    matchTypeMap: {},
    relevanceScoreMap: {}
  };
}

function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }
  return matrix[b.length][a.length];
}

function getFuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (q === t) return 1;
  if (t.includes(q) || q.includes(t)) return 0.85;
  return Math.max(
    0,
    1 - getLevenshteinDistance(q, t) / Math.max(q.length, t.length)
  );
}

/* =======================
   SEARCH SERVICE
======================= */

export class SearchService {
  static async fuzzySearch(
    query: string,
    contentType?: ContentType | "All"
  ): Promise<SearchResult> {
    if (!query.trim()) return buildResult([]);

    const cacheKey = normalizeKey(query, contentType);

    /* ---------- 1️⃣ MEMORY CACHE ---------- */
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey)!;
    }

    /* ---------- 2️⃣ FIRESTORE CACHE ---------- */
    const firestoreCached = await getCachedSearch(cacheKey);
    if (firestoreCached) {
      memoryCache.set(cacheKey, firestoreCached);
      return firestoreCached;
    }

    /* ---------- 3️⃣ LOCAL SEARCH ---------- */

    const filteredDataset =
      contentType && contentType !== "All"
        ? dataset.filter(d => d.type === contentType)
        : dataset;

    const localMatches = filteredDataset
      .map(item => ({
        item,
        score: Math.max(
          getFuzzyScore(query, item.title),
          Math.max(...item.keywords.map(k => getFuzzyScore(query, k)))
        )
      }))
      .filter(e => e.score > 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(e => e.item);

    // No Gemini keys → return local
    if (keys.length === 0) {
      const localResult = buildResult(localMatches);
      memoryCache.set(cacheKey, localResult);
      await saveCachedSearch(cacheKey, localResult);
      return localResult;
    }

    /* ---------- 4️⃣ GEMINI WITH RETRY ---------- */

    let response: any = null;

    for (let i = 0; i < keys.length; i++) {
      try {
        const ai = new GoogleGenAI({ apiKey: getKey() });

        const prompt = `
You are an intelligent Doraemon content finder.

User query: "${query}"

DATA:
${filteredDataset
  .map(
    d =>
      `ID:${d.id}, Title:${d.title}, Keywords:${d.keywords.join(
        ","
      )}, Desc:${d.description}`
  )
  .join("\n")}

Return JSON ONLY:
{
  "results": [
    {
      "itemId": "string",
      "matchType": "Keyword-based | Title-match | Story-based | Scene-based",
      "relevanceScore": number,
      "reasoning": [string]
    }
  ]
}
`;

        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                results: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      itemId: { type: Type.STRING },
                      matchType: { type: Type.STRING },
                      relevanceScore: { type: Type.INTEGER },
                      reasoning: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: [
                      "itemId",
                      "matchType",
                      "relevanceScore",
                      "reasoning"
                    ]
                  }
                }
              },
              required: ["results"]
            }
          }
        });

        break;
      } catch {
        console.warn("Gemini key failed, trying next key...");
      }
    }

    /* ---------- 5️⃣ PARSE + FALLBACK ---------- */

    if (!response) {
      const fallback = buildResult(localMatches);
      memoryCache.set(cacheKey, fallback);
      await saveCachedSearch(cacheKey, fallback);
      return fallback;
    }

    let results: any[] = [];
    try {
      const parsed = JSON.parse(response.text || "{}");
      results = parsed.results || [];
    } catch {
      results = [];
    }

    const matches = dataset.filter(d =>
      results.some((r: any) => r.itemId === d.id)
    );

    const finalResult =
      matches.length === 0
        ? buildResult(localMatches)
        : {
            matches,
            reasoningMap: Object.fromEntries(
              results.map((r: any) => [r.itemId, r.reasoning])
            ),
            matchTypeMap: Object.fromEntries(
              results.map((r: any) => [r.itemId, r.matchType])
            ),
            relevanceScoreMap: Object.fromEntries(
              results.map((r: any) => [r.itemId, r.relevanceScore])
            )
          };

    memoryCache.set(cacheKey, finalResult);
    await saveCachedSearch(cacheKey, finalResult);

    return finalResult;
  }

  /* =======================
     CHAT
  ======================= */

  static startChat(): Chat {
    if (keys.length === 0) {
      throw new Error("No Gemini API keys available");
    }

    const ai = new GoogleGenAI({ apiKey: getKey() });

    return ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
You are Doraemon-style AI assistant.
Be friendly, concise, fun.
Use emojis 🐱🚪📦
`
      }
    });
  }
}
