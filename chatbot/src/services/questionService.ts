import { geminiAI } from "../config/gemini";
import { QUESTION_GENERATION_PROMPT } from "../prompts/systemPrompts";
import { Intent, FollowUpQuestion } from "../types";

export class QuestionService {
  async generateQuestions(intent: Intent): Promise<FollowUpQuestion[]> {
    try {
      const prompt =
        QUESTION_GENERATION_PROMPT + JSON.stringify(intent, null, 2);

      const response = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      const fullResponse = response.text?.trim();

      if (!fullResponse) {
        throw new Error("Failed to generate questions");
      }

      // Extract JSON from response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse questions from AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || [];
    } catch (error) {
      console.error("Question generation error:", error);
      // Fallback questions
      return [
        {
          id: "q1",
          text: "Can you provide more details about your goal?",
          type: "text",
          required: true,
          placeholder: "Tell us more...",
        },
      ];
    }
  }
}

export const questionService = new QuestionService();
