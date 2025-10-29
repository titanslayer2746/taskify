import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import { ProgressTracker } from "./ProgressTracker";
import type {
  Message as MessageType,
  ExecutionProgress,
} from "./chatbot.types";

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  executionProgress?: ExecutionProgress | null;
  onAnswerQuestions?: (answers: Record<string, any>) => void;
  onExecutePlan?: (confirmations: Record<string, boolean>) => void;
}

export const MessageList = ({
  messages,
  isLoading = false,
  executionProgress,
  onAnswerQuestions,
  onExecutePlan,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, executionProgress]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground">
          <p className="text-lg font-medium">Welcome to AI Assistant</p>
          <p className="text-sm max-w-md">
            I can help you create todos, habits, meal plans, workout routines,
            and more. Just tell me what you'd like to achieve!
          </p>
        </div>
      )}

      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onAnswerQuestions={onAnswerQuestions}
          onExecutePlan={onExecutePlan}
          isLoading={isLoading}
        />
      ))}

      {isLoading && !executionProgress && (
        <div className="flex">
          <TypingIndicator />
        </div>
      )}

      {executionProgress && <ProgressTracker progress={executionProgress} />}

      <div ref={messagesEndRef} />
    </div>
  );
};
