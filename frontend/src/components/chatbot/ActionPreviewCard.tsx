import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ActionItem } from "./chatbot.types";

interface ActionPreviewCardProps {
  action: ActionItem;
  onToggle: (selected: boolean) => void;
}

export const ActionPreviewCard = ({
  action,
  onToggle,
}: ActionPreviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionTitle = () => {
    switch (action.type) {
      case "create_todos":
        return `Create ${action.count} Todos`;
      case "create_habits":
        return `Create ${action.count} Habits`;
      case "create_meal_plan":
        return "Create Meal Plan";
      case "create_workout_plan":
        return "Create Workout Plan";
      case "create_journal":
        return `Create ${action.count} Journal Entries`;
      default:
        return "Create Items";
    }
  };

  const renderPreview = () => {
    if (Array.isArray(action.preview)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {action.preview.slice(0, 3).map((item: any, idx: number) => (
            <li key={idx} className="text-sm text-muted-foreground">
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
          {action.preview.length > 3 && (
            <li className="text-sm text-muted-foreground italic">
              ... +{action.preview.length - 3} more
            </li>
          )}
        </ul>
      );
    }

    if (typeof action.preview === "object") {
      return (
        <div className="space-y-1 text-sm text-muted-foreground">
          {Object.entries(action.preview).map(([key, value]) => (
            <p key={key}>
              <span className="font-medium capitalize">{key}: </span>
              {String(value)}
            </p>
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm text-muted-foreground">{String(action.preview)}</p>
    );
  };

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Checkbox
            checked={action.selected}
            onCheckedChange={onToggle}
            className="mt-1"
          />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{getActionTitle()}</h4>
            {action.category && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Category: {action.category}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="pl-6 pt-2 border-t">{renderPreview()}</div>
      )}
    </div>
  );
};
