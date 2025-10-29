import { createContext, useContext, ReactNode } from "react";
import { useChatbot } from "@/hooks/useChatbot";

interface ChatbotContextType extends ReturnType<typeof useChatbot> {}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const chatbot = useChatbot();

  return (
    <ChatbotContext.Provider value={chatbot}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbotContext must be used within ChatbotProvider");
  }
  return context;
};




