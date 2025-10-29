import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import type { FollowUpQuestion } from "./chatbot.types";

interface FollowUpQuestionsProps {
  questions: FollowUpQuestion[];
  onSubmit: (answers: Record<string, any>) => void;
  disabled?: boolean;
}

export const FollowUpQuestions = ({
  questions,
  onSubmit,
  disabled = false,
}: FollowUpQuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const isValid = () => {
    return questions.every((q) => {
      if (!q.required) return true;
      return answers[q.id] !== undefined && answers[q.id] !== "";
    });
  };

  return (
    <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label className="text-sm font-medium">
            {question.text}
            {question.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>

          {question.type === "text" && (
            <Input
              type="text"
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) =>
                setAnswers({ ...answers, [question.id]: e.target.value })
              }
              disabled={disabled}
            />
          )}

          {question.type === "number" && (
            <Input
              type="number"
              min={question.min}
              max={question.max}
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) =>
                setAnswers({ ...answers, [question.id]: e.target.value })
              }
              disabled={disabled}
            />
          )}

          {question.type === "select" && question.options && (
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) =>
                setAnswers({ ...answers, [question.id]: value })
              }
              disabled={disabled}
            >
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${option}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${option}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === "multi_select" && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={(answers[question.id] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const current = answers[question.id] || [];
                      const updated = checked
                        ? [...current, option]
                        : current.filter((v: string) => v !== option);
                      setAnswers({ ...answers, [question.id]: updated });
                    }}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`${question.id}-${option}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {question.type === "slider" && (
            <div className="space-y-2">
              <Slider
                min={question.min || 0}
                max={question.max || 100}
                step={1}
                value={[answers[question.id] || question.min || 0]}
                onValueChange={(value) =>
                  setAnswers({ ...answers, [question.id]: value[0] })
                }
                disabled={disabled}
              />
              <p className="text-sm text-muted-foreground text-center">
                {answers[question.id] || question.min || 0}
              </p>
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValid()}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
};
