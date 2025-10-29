import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import { aiService } from "@/services/aiService";
import type {
  Message,
  ChatResponse,
  ActionPlan,
  ExecutionProgress,
  FollowUpQuestion,
} from "@/components/chatbot/chatbot.types";
import { useToast } from "./use-toast";

interface ChatbotState {
  isOpen: boolean;
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  currentPlan: ActionPlan | null;
  isExecuting: boolean;
  executionProgress: ExecutionProgress | null;
  currentQuestions: FollowUpQuestion[] | null;
}

export const useChatbot = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    conversationId: null,
    messages: [],
    isLoading: false,
    currentPlan: null,
    isExecuting: false,
    executionProgress: null,
    currentQuestions: null,
  });

  const openChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to use the chatbot",
          variant: "destructive",
        });
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        type: "text",
        content: text,
        timestamp: new Date(),
      };
      addMessage(userMessage);

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await aiService.sendMessage(
          text,
          token,
          state.conversationId || undefined
        );

        if (response.success) {
          const { conversationId, response: aiResponse } = response.data;

          setState((prev) => ({
            ...prev,
            conversationId,
            isLoading: false,
          }));

          // Add AI response
          const aiMessage: Message = {
            id: Date.now().toString() + "_ai",
            role: "assistant",
            type: aiResponse.type,
            content: aiResponse,
            timestamp: new Date(),
          };
          addMessage(aiMessage);

          // Store questions if any
          if (
            aiResponse.type === "follow_up_questions" &&
            aiResponse.questions
          ) {
            setState((prev) => ({
              ...prev,
              currentQuestions: aiResponse.questions || null,
            }));
          }
        }
      } catch (error: any) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to send message",
          variant: "destructive",
        });
      }
    },
    [token, state.conversationId, addMessage, toast]
  );

  const answerQuestions = useCallback(
    async (answers: Record<string, any>) => {
      if (!token || !state.conversationId) return;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await aiService.submitAnswers(
          state.conversationId,
          answers,
          token
        );

        if (response.success) {
          const { response: aiResponse } = response.data;

          setState((prev) => ({
            ...prev,
            isLoading: false,
            currentQuestions: null,
          }));

          // Add AI response with action plan
          const aiMessage: Message = {
            id: Date.now().toString() + "_ai",
            role: "assistant",
            type: aiResponse.type,
            content: aiResponse,
            timestamp: new Date(),
          };
          addMessage(aiMessage);

          // Store action plan
          if (aiResponse.type === "action_plan" && aiResponse.actions) {
            setState((prev) => ({
              ...prev,
              currentPlan: {
                planId: aiResponse.planId || "",
                conversationId: state.conversationId || "",
                summary: aiResponse.summary || "",
                actions:
                  aiResponse.actions?.map((action) => ({
                    ...action,
                    selected: true,
                  })) || [],
                category: "",
              },
            }));
          }
        }
      } catch (error: any) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to submit answers",
          variant: "destructive",
        });
      }
    },
    [token, state.conversationId, addMessage, toast]
  );

  const executePlan = useCallback(
    async (confirmations: Record<string, boolean>) => {
      if (!token || !state.currentPlan) return;

      setState((prev) => ({
        ...prev,
        isExecuting: true,
        executionProgress: {
          currentStep: "Starting execution...",
          completed: 0,
          total: state.currentPlan?.actions.length || 0,
          status: "in_progress",
        },
      }));

      try {
        const response = await aiService.executePlan(
          state.currentPlan.planId,
          confirmations,
          token,
          (progress) => {
            // Update progress in real-time as it's received
            setState((prev) => ({
              ...prev,
              executionProgress: {
                currentStep: progress.currentStep,
                completed: progress.completed,
                total: progress.total,
                status: progress.status,
                errors: progress.errors,
              },
            }));
          }
        );

        if (response.success) {
          setState((prev) => ({
            ...prev,
            isExecuting: false,
            executionProgress: {
              currentStep: "Completed!",
              completed:
                prev.executionProgress?.total ||
                state.currentPlan?.actions.length ||
                0,
              total:
                prev.executionProgress?.total ||
                state.currentPlan?.actions.length ||
                0,
              status: "completed",
            },
          }));

          // Add success message
          const systemMessage: Message = {
            id: Date.now().toString() + "_system",
            role: "system",
            type: "system",
            content: response.data.message,
            timestamp: new Date(),
          };
          addMessage(systemMessage);

          toast({
            title: "Success!",
            description: response.data.message,
          });

          // Clear execution progress after 2 seconds
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              executionProgress: null,
              currentPlan: null,
            }));
          }, 2000);
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          executionProgress: {
            currentStep: "Failed",
            completed: prev.executionProgress?.completed || 0,
            total:
              prev.executionProgress?.total ||
              state.currentPlan?.actions.length ||
              0,
            status: "failed",
            errors: [
              error.message ||
                error.response?.data?.message ||
                "Execution failed",
            ],
          },
        }));

        toast({
          title: "Execution Failed",
          description:
            error.message ||
            error.response?.data?.message ||
            "Failed to execute plan",
          variant: "destructive",
        });
      }
    },
    [token, state.currentPlan, addMessage, toast]
  );

  return {
    ...state,
    openChat,
    closeChat,
    sendMessage,
    answerQuestions,
    executePlan,
  };
};
