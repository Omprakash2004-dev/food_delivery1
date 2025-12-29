import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getAIRecommendation = async (
  query: string,
  availableItems: MenuItem[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI service is unavailable (Missing API Key).";

  const context = availableItems.map(i => `${i.name} (${i.category}): $${i.price} - ${i.description}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a helpful culinary assistant for a food delivery app called CraveWave.
        
        The user asks: "${query}"
        
        Here is the current available menu data:
        ${context}
        
        Please recommend 1-2 specific items from the menu that match the user's request.
        Explain why you picked them. Be brief (max 3 sentences).
        If nothing matches, suggest the closest alternative.
        Do not format as markdown. Plain text only.
      `,
    });
    
    return response.text || "I couldn't find a good match right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble thinking of food right now. Please try again later.";
  }
};
