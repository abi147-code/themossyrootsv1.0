import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateMarketingSlogans = async (
  businessType: string,
  promotionGoal: string
): Promise<string[]> => {
  try {
    const prompt = `
      You are a marketing expert. Create 3 short, punchy, and professional marketing slogans 
      suitable for placing at the bottom of an invoice.
      
      Context:
      - Business Type: ${businessType || 'General Business'}
      - Promotion Goal: ${promotionGoal}
      
      Keep them under 15 words each. Do not include quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slogans: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.slogans || [];
  } catch (error) {
    console.error("Error generating slogans:", error);
    throw new Error("Failed to generate marketing slogans. Please try again.");
  }
};
