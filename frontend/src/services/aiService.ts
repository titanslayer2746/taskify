import axios from "axios";
import type {
  ChatResponse,
  Conversation,
  ExecutionProgress,
} from "@/components/chatbot/chatbot.types";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:4000";

console.log("[AI Service] CHATBOT_URL:", CHATBOT_URL);

class AIService {
  private getHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async sendMessage(
    message: string,
    token: string,
    conversationId?: string
  ): Promise<{ success: boolean; data: ChatResponse }> {
    console.log("[AI Service] Sending message:", {
      message,
      conversationId,
      token: token ? "Present" : "Missing",
    });

    try {
      const response = await axios.post(
        `${CHATBOT_URL}/api/chat`,
        {
          message,
          conversationId,
        },
        {
          headers: this.getHeaders(token),
        }
      );
      console.log("[AI Service] Response received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[AI Service] Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async submitAnswers(
    conversationId: string,
    answers: Record<string, any>,
    token: string
  ): Promise<{ success: boolean; data: ChatResponse }> {
    const response = await axios.post(
      `${CHATBOT_URL}/api/chat/answer`,
      {
        conversationId,
        answers,
      },
      {
        headers: this.getHeaders(token),
      }
    );
    return response.data;
  }

  async executePlan(
    planId: string,
    confirmations: Record<string, boolean>,
    token: string,
    onProgress?: (progress: {
      currentStep: string;
      completed: number;
      total: number;
      status: "in_progress" | "completed" | "failed";
      errors?: string[];
    }) => void
  ): Promise<{
    success: boolean;
    data: { results: any[]; errors: any[]; message: string };
  }> {
    // Use EventSource for SSE (Server-Sent Events)
    return new Promise((resolve, reject) => {
      // Since EventSource doesn't support POST with body, we'll use fetch with ReadableStream
      const controller = new AbortController();
      
      fetch(`${CHATBOT_URL}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          confirmations,
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            // For SSE, if there's an error, try to read the stream or fallback to status text
            try {
              const errorText = await response.text();
              try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || "Failed to execute plan");
              } catch {
                throw new Error(errorText || response.statusText || "Failed to execute plan");
              }
            } catch (error) {
              throw error instanceof Error ? error : new Error("Failed to execute plan");
            }
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining data in buffer
              if (buffer.trim()) {
                const lines = buffer.split("\n\n").filter(line => line.trim());
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.substring(6));
                      if (data.type === "complete") {
                        resolve({
                          success: data.data.success,
                          data: data.data,
                        });
                        return;
                      }
                    } catch (parseError) {
                      console.error("Failed to parse final SSE data:", parseError);
                    }
                  }
                }
              }
              // If stream ended without completion message, it's an error
              reject(new Error("Unexpected end of stream"));
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() && line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.substring(6));
                  
                  if (data.type === "progress" && onProgress) {
                    onProgress(data.data);
                  } else if (data.type === "complete") {
                    resolve({
                      success: data.data.success,
                      data: data.data,
                    });
                    return;
                  } else if (data.type === "error") {
                    reject(new Error(data.data.message || "Execution failed"));
                    return;
                  }
                } catch (parseError) {
                  console.error("Failed to parse SSE data:", parseError, "Line:", line);
                }
              }
            }
          }
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            reject(new Error("Request was aborted"));
          } else {
            reject(error);
          }
        });
    });
  }

  async getConversation(
    conversationId: string,
    token: string
  ): Promise<{ success: boolean; data: any }> {
    const response = await axios.get(
      `${CHATBOT_URL}/api/conversations/${conversationId}`,
      {
        headers: this.getHeaders(token),
      }
    );
    return response.data;
  }

  async listConversations(
    token: string
  ): Promise<{ success: boolean; data: Conversation[] }> {
    const response = await axios.get(`${CHATBOT_URL}/api/conversations`, {
      headers: this.getHeaders(token),
    });
    return response.data;
  }

  async healthCheck(): Promise<any> {
    const response = await axios.get(`${CHATBOT_URL}/health`);
    return response.data;
  }
}

export const aiService = new AIService();
