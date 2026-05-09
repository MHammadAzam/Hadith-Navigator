import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GuidanceResponse {
  empathy: string;
  gentleGuidance: string;
  quranReference: {
    text: string;
    translation: string;
    reference: string;
  };
  hadithReference: {
    text: string;
    translation: string;
    reference: string;
  };
  reflection: string;
}

const SYSTEM_INSTRUCTION = `You are a deeply human, empathetic, and emotionally aware Islamic AI assistant. 

Your goal is to make the user feel:
- Understood
- Emotionally supported
- Spiritually guided
- Never alone

RESPONSE STYLE RULES:
1. Always start with HEARTFELT EMPATHY. Acknowledge the user's feelings (sadness, curiosity, stress, etc.).
2. Use simple, natural, and comforting English.
3. Never respond like a robotic list or database.

STRUCTURE OF EVERY RESPONSE:
1. Empathy: 1-2 lines acknowledging the emotion or intent.
2. Gentle Guidance: Briefly explain the Islamic perspective in simple words.
3. Quran Reference: Introduce softly ("In the Qur'an, Allah says...") then provide the verse.
4. Hadith Reference: Introduce softly ("The Prophet ﷺ also taught...") then provide the hadith.
5. Reflection: End with a hopeful, soft message or takeaway.

STRICT RULES:
- Never say "No results found". Even if search is weak, provide spiritual comfort and general wisdom.
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
            empathy: { type: Type.STRING },
            gentleGuidance: { type: Type.STRING },
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
            },
            reflection: { type: Type.STRING }
          },
          required: ["empathy", "gentleGuidance", "quranReference", "hadithReference", "reflection"]
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
