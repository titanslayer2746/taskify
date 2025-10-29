import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ExecutionProgress } from "./chatbot.types";

interface ProgressTrackerProps {
  progress: ExecutionProgress;
}

export const ProgressTracker = ({ progress }: ProgressTrackerProps) => {
  const percentage = (progress.completed / progress.total) * 100;

  const getStatusIcon = () => {
    switch (progress.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="space-y-3 bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <h4 className={`font-semibold ${getStatusColor()}`}>
          {progress.status === "completed"
            ? "Plan Executed Successfully!"
            : progress.status === "failed"
            ? "Execution Failed"
            : "Creating Your Plan..."}
        </h4>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{progress.currentStep}</span>
          <span className="font-medium">
            {progress.completed} / {progress.total}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {Math.round(percentage)}% complete
        </p>
      </div>

      {progress.errors && progress.errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-3 space-y-1">
          <p className="text-sm font-medium text-destructive">Errors:</p>
          {progress.errors.map((error, idx) => (
            <p key={idx} className="text-xs text-destructive/80">
              • {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
