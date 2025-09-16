import React, { useState, useEffect } from "react";
import { Project, ProjectPriority, ProjectStatus } from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Palette } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

const priorityOptions: {
  value: ProjectPriority;
  label: string;
  color: string;
}[] = [
  {
    value: "low",
    label: "Low",
    color: "bg-gray-700/50 text-gray-300 border border-gray-600",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-blue-700/50 text-blue-300 border border-blue-600",
  },
  {
    value: "high",
    label: "High",
    color: "bg-orange-700/50 text-orange-300 border border-orange-600",
  },
  {
    value: "urgent",
    label: "Urgent",
    color: "bg-red-700/50 text-red-300 border border-red-600",
  },
];

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "archive", label: "Archive" },
];

const colorOptions = [
  "#7fff00",
  "#adff2f",
  "#9acd32",
  "#32cd32",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#feca57",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
];

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  project,
  open,
  onOpenChange,
  onUpdateProject,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "not-started" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    progress: 0,
    dueDate: undefined as Date | undefined,
    tags: [] as string[],
    estimatedHours: undefined as number | undefined,
    actualHours: undefined as number | undefined,
    color: "#7fff00",
  });
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        progress: project.progress,
        dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
        tags: [...project.tags],
        estimatedHours: project.estimatedHours,
        actualHours: project.actualHours,
        color: project.color || "#7fff00",
      });
      setErrors({});
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = "Progress must be between 0 and 100";
    }
    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = "Estimated hours must be positive";
    }
    if (formData.actualHours && formData.actualHours < 0) {
      newErrors.actualHours = "Actual hours must be positive";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update project
    const updates: Partial<Project> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      progress: formData.progress,
      dueDate: formData.dueDate?.toISOString(),
      tags: formData.tags,
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      color: formData.color,
    };

    onUpdateProject(project.id, updates);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="chartreuse-gradient-text text-xl font-bold text-white">
            Edit Project
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your project details and progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white font-medium">
              Project Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter project title"
              className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter project description"
              rows={3}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ProjectPriority) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {priorityOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Label htmlFor="progress" className="text-white font-medium">
              Progress (%)
            </Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  progress: parseInt(e.target.value) || 0,
                }))
              }
              className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                errors.progress ? "border-red-500" : ""
              }`}
            />
            {errors.progress && (
              <p className="text-sm text-red-500">{errors.progress}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-white font-medium">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                    !formData.dueDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate
                    ? format(formData.dueDate, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-gray-700 border-gray-600"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) =>
                    setFormData((prev) => ({ ...prev, dueDate: date }))
                  }
                  initialFocus
                  className="bg-gray-700 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="estimatedHours"
                className="text-white font-medium"
              >
                Estimated Hours
              </Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                value={formData.estimatedHours || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedHours: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                  errors.estimatedHours ? "border-red-500" : ""
                }`}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-red-500">{errors.estimatedHours}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualHours" className="text-white font-medium">
                Actual Hours
              </Label>
              <Input
                id="actualHours"
                type="number"
                min="0"
                value={formData.actualHours || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    actualHours: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                  errors.actualHours ? "border-red-500" : ""
                }`}
              />
              {errors.actualHours && (
                <p className="text-sm text-red-500">{errors.actualHours}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-white font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-0.5 h-5 bg-gradient-to-r from-lime-600/30 to-green-600/30 border border-lime-400/50 text-white font-medium hover:from-lime-500/40 hover:to-green-500/40 hover:border-lime-300/60 hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200 flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer text-white hover:text-lime-200 transition-colors"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-white font-medium">Project Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    formData.color === color
                      ? "border-gray-800 scale-110"
                      : "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="chartreuse-gradient text-black hover:opacity-90"
            >
              Update Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
