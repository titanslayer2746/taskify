import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "./ChatWindow";
import { useChatbotContext } from "@/contexts/ChatbotContext";

export const ChatbotBubble = () => {
  const { isOpen, openChat, closeChat } = useChatbotContext();

  const handleToggle = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <>
      <ChatWindow isOpen={isOpen} onClose={closeChat} />

      {/* Floating Button */}
      <Button
        onClick={handleToggle}
        size="icon"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-[0_12px_24px_-12px_rgba(20,45,30,0.6)] transition-colors duration-200
          ${isOpen ? "bg-ink hover:bg-ink/90" : "bg-ink hover:bg-clay"}
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>

    </>
  );
};
