import { GoogleGenAI, Type } from "@google/genai";

// Use Vite's syntax to get the environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set the VITE_GEMINI_API_KEY environment variable.");
}

// Initialize the client with the key
const ai = new GoogleGenAI({ apiKey: apiKey! });

export const generateSuggestions = async (content: string): Promise<{titles: string[], hashtags: string[]}> => {
  if (!apiKey) {
    // Return mock data if API key is not available
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return {
        titles: [
            "Mock Title 1: The Rise of AI",
            "Mock Title 2: Exploring React",
            "Mock Title 3: Tailwind for Beginners",
        ],
        hashtags: ["Mock", "AI", "React", "WebDev", "JavaScript"]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following blog content, generate 5 creative and engaging blog post titles and 5 relevant hashtags.
      
      Content: "${content.substring(0, 2000)}..."
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of 5 suggested blog post titles.'
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of 5 relevant hashtags (without the # symbol).'
            }
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return { 
        titles: result.titles || [],
        hashtags: result.hashtags || [],
    };

  } catch (error) {
    console.error("Error generating suggestions:", error);
    return { titles: [], hashtags: [] };
  }
};