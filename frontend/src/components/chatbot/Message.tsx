import { format } from "date-fns";
import { Bot, User } from "lucide-react";
import { FollowUpQuestions } from "./FollowUpQuestions";
import { ActionPreview } from "./ActionPreview";
import type { Message as MessageType } from "./chatbot.types";

interface MessageProps {
  message: MessageType;
  onAnswerQuestions?: (answers: Record<string, any>) => void;
  onExecutePlan?: (confirmations: Record<string, boolean>) => void;
  isLoading?: boolean;
}

export const Message = ({
  message,
  onAnswerQuestions,
  onExecutePlan,
  isLoading = false,
}: MessageProps) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[80%]`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted text-foreground"
          }`}
        >
          {message.type === "text" && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}

          {(message.type === "questions" ||
            message.type === "follow_up_questions") &&
            message.content.message && (
              <div className="space-y-3">
                <p className="text-sm">{message.content.message}</p>
                {message.content.questions && onAnswerQuestions && (
                  <FollowUpQuestions
                    questions={message.content.questions}
                    onSubmit={onAnswerQuestions}
                    disabled={isLoading}
                  />
                )}
              </div>
            )}

          {message.type === "action_plan" &&
            message.content.actions &&
            onExecutePlan && (
              <div className="space-y-3">
                {message.content.message && (
                  <p className="text-sm">{message.content.message}</p>
                )}
                <ActionPreview
                  plan={{
                    planId: message.content.planId || "",
                    conversationId: "",
                    summary: message.content.summary || "",
                    actions: message.content.actions.map((action: any) => ({
                      ...action,
                      selected: true,
                    })),
                    category: "",
                  }}
                  onExecute={onExecutePlan}
                  disabled={isLoading}
                />
              </div>
            )}
        </div>

        <span
          className={`text-xs text-muted-foreground px-2 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {format(new Date(message.timestamp), "HH:mm")}
        </span>
      </div>
    </div>
  );
};
