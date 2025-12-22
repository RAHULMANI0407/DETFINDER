import { GoogleGenAI, Type } from "@google/genai";
import { dataset } from "../data/dataset";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const keys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

let index = 0;
const getKey = () => keys[index++ % keys.length];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) return res.status(400).json({ matches: [] });

    const ai = new GoogleGenAI({ apiKey: getKey() });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find Doraemon content matching: "${query}"`,
    });

    res.status(200).json({
      text: response.text,
    });
  } catch (e: any) {
    console.error("API error:", e);
    res.status(500).json({ error: "Gemini failed" });
  }
}
