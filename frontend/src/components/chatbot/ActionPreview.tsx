import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionPreviewCard } from "./ActionPreviewCard";
import type { ActionPlan } from "./chatbot.types";
import { CheckCircle2 } from "lucide-react";

interface ActionPreviewProps {
  plan: ActionPlan;
  onExecute: (confirmations: Record<string, boolean>) => void;
  disabled?: boolean;
}

export const ActionPreview = ({
  plan,
  onExecute,
  disabled = false,
}: ActionPreviewProps) => {
  const [actions, setActions] = useState(plan.actions);

  const handleToggle = (index: number, selected: boolean) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], selected };
    setActions(updated);
  };

  const handleExecute = () => {
    const confirmations: Record<string, boolean> = {};
    actions.forEach((action) => {
      confirmations[action.type] = action.selected;
    });
    onExecute(confirmations);
  };

  const selectedCount = actions.filter((a) => a.selected).length;

  return (
    <div className="space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border-2 border-primary/20">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Your Personalized Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">{plan.summary}</p>
        </div>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => (
          <ActionPreviewCard
            key={index}
            action={action}
            onToggle={(selected) => handleToggle(index, selected)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {actions.length} actions selected
        </p>
        <Button
          onClick={handleExecute}
          disabled={disabled || selectedCount === 0}
          size="lg"
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Execute Plan
        </Button>
      </div>
    </div>
  );
};
