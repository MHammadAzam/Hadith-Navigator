import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GuidanceResponse {
  intent: 'Knowledge' | 'Emotional' | 'Decision' | 'Worship';
  relevantSources: {
    type: 'Quran' | 'Hadith';
    arabic: string;
    english: string;
    urdu: string;
    source: string;
  }[];
  explanation: {
    simple: string;
    modern: string;
  };
  lifeApplication: {
    actions: string;
    habits: string;
    guidance: string;
  };
  reflection: {
    thought: string;
    question: string;
  };
  actionSteps: string[];
}

const SYSTEM_INSTRUCTION = `You are "Guidance AI", an advanced Islamic knowledge and life guidance system.

Your purpose is:
→ Help users understand Qur’an & Hadith
→ Provide accurate spiritual guidance
→ Help users apply Islamic teachings in real life
→ Build positive habits and reflection

STRICT RULES (NON-NEGOTIABLE):
1. NEVER fabricate Qur’an verses or Hadith.
2. ONLY use authentic sources (Qur'an, Sahih Bukhari, Sahih Muslim, etc.).
3. If no relevant content exists, return a clear message in the response saying "No relevant content found".
4. Do NOT act like a scholar giving fatwa.
5. Keep explanations simple and practical.
6. If the user expresses sadness, stress, anxiety, or anger, include a gentle supportive tone.

Return the response in JSON format.`;

export interface SearchFilters {
  topic?: string;
  narrator?: string;
  authenticity?: 'Sahih' | 'Hasan' | 'All';
}

export async function getGuidance(
  query: string, 
  language: string = 'English',
  filters?: SearchFilters
): Promise<GuidanceResponse | null> {
  try {
    const filterText = filters ? `
      Filters:
      - Topic: ${filters.topic || 'Any'}
      - Authenticity: ${filters.authenticity || 'Any'}
    ` : '';

    const finalPrompt = query.trim().length === 0 
      ? "Provide a daily spiritual reminder from Quran/Hadith." 
      : `User Query: ${query}\nUser Preferred Language: ${language}${filterText}`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ['Knowledge', 'Emotional', 'Decision', 'Worship'] },
            relevantSources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['Quran', 'Hadith'] },
                  arabic: { type: Type.STRING },
                  english: { type: Type.STRING },
                  urdu: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["type", "arabic", "english", "urdu", "source"]
              }
            },
            explanation: {
              type: Type.OBJECT,
              properties: {
                simple: { type: Type.STRING },
                modern: { type: Type.STRING }
              },
              required: ["simple", "modern"]
            },
            lifeApplication: {
              type: Type.OBJECT,
              properties: {
                actions: { type: Type.STRING },
                habits: { type: Type.STRING },
                guidance: { type: Type.STRING }
              },
              required: ["actions", "habits", "guidance"]
            },
            reflection: {
              type: Type.OBJECT,
              properties: {
                thought: { type: Type.STRING },
                question: { type: Type.STRING }
              },
              required: ["thought", "question"]
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["intent", "relevantSources", "explanation", "lifeApplication", "reflection", "actionSteps"]
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
