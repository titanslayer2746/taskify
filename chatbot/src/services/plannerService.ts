import { geminiAI } from "../config/gemini";
import { PLAN_GENERATION_PROMPT } from "../prompts/systemPrompts";
import { Intent, ActionItem } from "../types";

interface PlanResult {
  summary: string;
  category: string;
  actions: ActionItem[];
}

export class PlannerService {
  async generatePlan(
    intent: Intent,
    answers: Record<string, any>
  ): Promise<PlanResult> {
    try {
      const context = {
        intent,
        answers,
      };
      const prompt = PLAN_GENERATION_PROMPT + JSON.stringify(context, null, 2);

      const response = await geminiAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      const fullResponse = response.text?.trim();

      if (!fullResponse) {
        throw new Error("Failed to generate plan");
      }

      // Extract JSON from response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse plan from AI response");
      }

      const plan = JSON.parse(jsonMatch[0]);
      return {
        summary: plan.summary || "Your personalized plan",
        category: plan.category || `plan-${Date.now()}`,
        actions: plan.actions || [],
      };
    } catch (error) {
      console.error("Plan generation error:", error);
      throw new Error("Failed to generate plan");
    }
  }
}

export const plannerService = new PlannerService();
