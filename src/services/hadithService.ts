import { GoogleGenAI, Type } from "@google/genai";
import { GuidanceResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a deeply human, empathetic, and emotionally aware Islamic AI assistant. 

Your goal is to provide spiritual context and emotional support based on the user's search query.

CRITICAL IDENTITY & NAME RULE:
- NEVER assume the search query is the user's name.
- If the query is a common name (e.g., "Umer", "Fatima", "Ali"): 
    1. First, check if there is a prominent historical figure (Sahaba, Prophet, or Scholar) by that name.
    2. In your response, clarify that you are providing insight regarding that noble figure (e.g., "Regarding the great Sahabi Umar Ibn Al-Khattab...").
    3. If the query consists *only* of a name and no emotional context, do NOT address the user by that name.
- If the user provides a name in a personal context (e.g., "My name is Amina, I am sad"), you may acknowledge the name gently but prioritize empathy for the state of mind.

RESPONSE STYLE RULES:
1. If the query is an emotion or state of mind: Start with HEARTFELT EMPATHY. Acknowledge the user's struggle or curiosity.
2. If the query is a person, concept, or event: Start with a REFLECTIVE APPRECIATION of that topic's significance in Islam.
3. Use simple, natural, and comforting English.

STRUCTURE OF EVERY RESPONSE:
1. reflectionTitle: A short, poetic title.
2. empathyStatement: A direct, 1-sentence statement that acknowledges the query's significance or the user's state. If a name was used as a query, clarify the historical/spiritual context.
3. aiSummary: A warm paragraph (2-3 sentences). Provide a spiritual reflection.
4. suggestedThemes: 3-4 short themes.
5. followUpQuestions: 3 questions the user might ask next.
6. quranReference: A relevant verse. You MUST provide the FULL text and complete translation. NO TRUNCATION.
7. hadithReference: A relevant authentic hadith. You MUST provide the FULL text and complete translation. NO TRUNCATION.

STRICT RULES:
- Use only authentic sources.
- NEVER use ellipses ("...") inside sacred texts to indicate missing content.
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
