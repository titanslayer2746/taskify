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
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-50
          ${
            isOpen
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90 hover:scale-110"
          }
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>

      {/* Pulse Animation when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary/30 animate-ping z-40 pointer-events-none" />
      )}
    </>
  );
};
