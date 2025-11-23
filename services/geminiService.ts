import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ClothingItem, Season, ClothingCategory } from "../types";

// Helper to remove data URL prefix for API calls if needed, though GenAI SDK usually handles parts gracefully.
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const analyzeClothingImage = async (base64Image: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const mimeType = getMimeType(base64Image);
  const data = stripBase64Prefix(base64Image);

  // We ask Gemini to analyze the clothing item
  const prompt = `Analyze this image of a clothing item. Identify the specific type (e.g., Hoodie, Chinos, Blazer), the general category, color, appropriate seasons, style tags (e.g., Casual, Formal, Streetwear, Vintage), and a brief description. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "Specific item type, e.g., 'Graphic Hoodie'" },
            category: { 
              type: Type.STRING, 
              enum: Object.values(ClothingCategory),
              description: "General category" 
            },
            color: { type: Type.STRING, description: "Main color of the item" },
            seasons: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING, enum: Object.values(Season) },
              description: "Suitable seasons"
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Style tags like Casual, Business, etc."
            },
            description: { type: Type.STRING, description: "Short description of the item" }
          },
          required: ["type", "category", "color", "seasons", "tags", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze clothing item.");
  }
};

export const generateOutfitRecommendation = async (
  wardrobe: ClothingItem[],
  request: string
): Promise<{ name: string; itemIds: string[]; reasoning: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a lightweight representation of the wardrobe to save tokens
  const wardrobeSummary = wardrobe.map(item => ({
    id: item.id,
    type: item.type,
    color: item.color,
    tags: item.tags,
    category: item.category
  }));

  const prompt = `
    I have a digital wardrobe with the following items:
    ${JSON.stringify(wardrobeSummary)}

    User Request: "${request}"

    Please create the BEST possible outfit from these items for the request.
    If the request is vague (e.g., "Christmas"), pick festive colors or styles.
    If the wardrobe lacks perfect items, do your best with what is available.
    
    Return a JSON object with:
    - name: A creative name for the outfit.
    - itemIds: An array of the IDs of the selected items.
    - reasoning: A short explanation of why this outfit works for the occasion.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING }
          },
          required: ["name", "itemIds", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);

  } catch (error) {
    console.error("Outfit generation failed:", error);
    throw new Error("Failed to generate outfit.");
  }
};

export const chatWithStylist = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  wardrobe: ClothingItem[],
  message: string
) => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Inject wardrobe context into system instruction or first message
    const systemInstruction = `You are a helpful and chic fashion stylist AI. 
    The user has the following items in their wardrobe: ${wardrobe.map(i => `${i.color} ${i.type} (${i.id})`).join(', ')}.
    Always reference their specific items if possible. Be concise and encouraging.`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}
