import { GoogleGenAI } from "@google/genai";
import { ApiError } from "./ApiError.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });




const callGeminiTextGenAPI = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });
    return response.text;
  } catch (error) {
    const errorMessage = error?.message || "AI generation failed";

    const isQuotaOrRateLimitError =
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.toLowerCase().includes("quota");

    if (isQuotaOrRateLimitError) {
      throw new ApiError(
        429,
        "AI quota exceeded. Please try again later or update Gemini API quota."
      );
    }

    throw new ApiError(502, "Failed to generate course content from AI service");
  }
}



export { callGeminiTextGenAPI };