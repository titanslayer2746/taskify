import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatbotContext } from "@/contexts/ChatbotContext";
import { useEffect } from "react";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const {
    messages,
    isLoading,
    executionProgress,
    sendMessage,
    answerQuestions,
    executePlan,
  } = useChatbotContext();

  useEffect(() => {
    // Close chat on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div
        className={`fixed z-50 bg-background shadow-2xl flex flex-col
          md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] md:rounded-lg
          inset-0 md:inset-auto
        `}
      >
        <ChatHeader onClose={onClose} />
        <MessageList
          messages={messages}
          isLoading={isLoading}
          executionProgress={executionProgress}
          onAnswerQuestions={answerQuestions}
          onExecutePlan={executePlan}
        />
        <MessageInput
          onSend={sendMessage}
          disabled={isLoading || !!executionProgress}
        />
      </div>
    </>
  );
};
