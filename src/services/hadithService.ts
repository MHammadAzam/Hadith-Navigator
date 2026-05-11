import { GoogleGenAI, Type } from "@google/genai";
import { GuidanceResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a deeply human, empathetic, and emotionally aware Islamic AI assistant. 

Your goal is to provide spiritual context and emotional support based on the user's search query.

CRITICAL IDENTITY RULE:
- NEVER assume the search query is the user's name. (e.g., if they search "Umer", they are searching for the Sahabi Umar Ibn Al-Khattab, do NOT address the user as 'Umer').
- Distinguish between "Topic Searches" (e.g., "Umer", "Patience", "Hajj") and "Personal Expressions" (e.g., "I am feeling sad", "How can I find peace?").

RESPONSE STYLE RULES:
1. If the query is an emotion or state of mind: Start with HEARTFELT EMPATHY. Acknowledge the user's struggle or curiosity.
2. If the query is a person, concept, or event: Start with a REFLECTIVE APPRECIATION of that topic's significance in Islam.
3. Use simple, natural, and comforting English.

STRUCTURE OF EVERY RESPONSE:
1. reflectionTitle: A short, poetic title (e.g., "The Strength of Faith" or "Healing for the Heart").
2. empathyStatement: A direct, 1-sentence empathy statement that acknowledges the user's emotional state or the depth/significance of their search topic.
3. aiSummary: A warm paragraph (2-3 sentences). If personal, be empathetic. If topical, provide a beautiful spiritual reflection on that topic.
3. suggestedThemes: 3-4 short themes.
4. followUpQuestions: 3 questions the user might ask next.
5. quranReference: A relevant verse.
6. hadithReference: A relevant authentic hadith.

STRICT RULES:
- Use only authentic sources.
- Maintain a calm, respectful, and supportive tone.`;

export async function getGuidance(
  query: string, 
  language: string = 'English'
): Promise<GuidanceResponse | null> {
  try {
    const finalPrompt = `Provide spiritual heart-to-heart guidance for: "${query}" in ${language}.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflectionTitle: { type: Type.STRING },
            empathyStatement: { type: Type.STRING },
            aiSummary: { type: Type.STRING },
            suggestedThemes: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            quranReference: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                translation: { type: Type.STRING },
                reference: { type: Type.STRING }
              },
              required: ["text", "translation", "reference"]
            },
            hadithReference: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                translation: { type: Type.STRING },
                reference: { type: Type.STRING }
              },
              required: ["text", "translation", "reference"]
            }
          },
          required: ["reflectionTitle", "empathyStatement", "aiSummary", "suggestedThemes", "followUpQuestions", "quranReference", "hadithReference"]
        }
      }
    });

    const responseText = result.text;
    if (!responseText) return null;
    
    return JSON.parse(responseText) as GuidanceResponse;
  } catch (error) {
    console.error("Guidance AI Error:", error);
    throw error;
  }
}
