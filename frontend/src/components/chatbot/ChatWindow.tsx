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
        className="fixed inset-0 bg-ink/30 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div
        role="dialog"
        aria-label="Assistant"
        className={`fixed z-50 flex flex-col bg-[#F9F7EF] font-paper text-ink shadow-[0_1px_0_#d3cdb7,0_30px_60px_-20px_rgba(20,45,30,0.45)]
          md:bottom-24 md:right-6 md:h-[600px] md:w-[400px] md:rounded-[3px]
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
