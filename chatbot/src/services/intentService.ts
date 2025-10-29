import { geminiAI } from "../config/gemini";
import { INTENT_RECOGNITION_PROMPT } from "../prompts/systemPrompts";
import { Intent } from "../types";

export class IntentService {
  async recognizeIntent(userMessage: string): Promise<Intent> {
    try {
      const prompt = INTENT_RECOGNITION_PROMPT + userMessage;

      const response = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      const fullResponse = response.text?.trim();

      if (!fullResponse) {
        throw new Error("Failed to generate intent");
      }

      // Extract JSON from response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse intent from AI response");
      }

      const intent = JSON.parse(jsonMatch[0]) as Intent;
      return intent;
    } catch (error) {
      console.error("Intent recognition error:", error);
      // Fallback intent
      return {
        goalType: "general",
        requiredInfo: ["details"],
        category: `general-${Date.now()}`,
      };
    }
  }
}

export const intentService = new IntentService();
