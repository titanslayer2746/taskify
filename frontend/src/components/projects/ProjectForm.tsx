import React, { useState } from "react";
import { X } from "lucide-react";
import {
  Project,
  ProjectInput,
  ProjectPriority,
  ProjectStatus,
} from "@/types/project";
import { PaperButton } from "@/components/paper/PaperDialog";
import { toDateKey } from "@/lib/habits";
import {
  paperChip,
  paperErrorText,
  paperInput,
  paperLabel,
  paperSelect,
  paperTextarea,
} from "@/lib/paper";
import {
  PROJECT_COLORS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  projectColor,
} from "./projectMeta";

type ProjectFormProps = {
  initial?: Project | null;
  submitLabel: string;
  onSubmit: (values: ProjectInput) => void;
  onCancel: () => void;
};

const emptyForm = {
  title: "",
  description: "",
  status: "not-started" as ProjectStatus,
  priority: "medium" as ProjectPriority,
  progress: 0,
  dueDate: "",
  tags: [] as string[],
  estimatedHours: undefined as number | undefined,
  actualHours: undefined as number | undefined,
  color: PROJECT_COLORS[0].value,
};

const fromProject = (project: Project) => ({
  title: project.title,
  description: project.description,
  status: project.status,
  priority: project.priority,
  progress: project.progress,
  dueDate: !project.dueDate
    ? ""
    : /^\d{4}-\d{2}-\d{2}$/.test(project.dueDate)
    ? project.dueDate
    : toDateKey(new Date(project.dueDate)),
  tags: [...project.tags],
  estimatedHours: project.estimatedHours,
  actualHours: project.actualHours,
  color: projectColor(project.color),
});

// Shared by the add and edit dialogs.
export const ProjectForm: React.FC<ProjectFormProps> = ({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState(() =>
    initial ? fromProject(initial) : emptyForm
  );
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Give the project a name";
    if (formData.progress < 0 || formData.progress > 100)
      newErrors.progress = "Progress is between 0 and 100";
    if (formData.estimatedHours && formData.estimatedHours < 0)
      newErrors.estimatedHours = "Hours can't be negative";
    if (formData.actualHours && formData.actualHours < 0)
      newErrors.actualHours = "Hours can't be negative";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      progress: formData.progress,
      dueDate: formData.dueDate || undefined,
      tags: formData.tags,
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      color: formData.color,
    });
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) set("tags", [...formData.tags, tag]);
    setNewTag("");
  };

  const hoursInput = (key: "estimatedHours" | "actualHours", label: string) => (
    <div>
      <label htmlFor={`project-${key}`} className={paperLabel}>
        {label}
      </label>
      <input
        id={`project-${key}`}
        type="number"
        min="0"
        value={formData[key] ?? ""}
        onChange={(e) =>
          set(key, e.target.value ? parseInt(e.target.value) : undefined)
        }
        className={`${paperInput} font-ledger tabular-nums`}
      />
      {errors[key] && <p className={paperErrorText}>{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="project-title" className={paperLabel}>
          Name
        </label>
        <input
          id="project-title"
          value={formData.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="What are you working on?"
          aria-invalid={!!errors.title}
          className={`${paperInput} text-lg ${errors.title ? "border-clay" : ""}`}
          autoFocus
        />
        {errors.title && <p className={paperErrorText}>{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="project-description" className={paperLabel}>
          Notes
        </label>
        <textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Optional"
          rows={3}
          className={`${paperTextarea} mt-2 resize-none`}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="project-status" className={paperLabel}>
            Stage
          </label>
          <select
            id="project-status"
            value={formData.status}
            onChange={(e) => set("status", e.target.value as ProjectStatus)}
            className={paperSelect}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project-priority" className={paperLabel}>
            Priority
          </label>
          <select
            id="project-priority"
            value={formData.priority}
            onChange={(e) => set("priority", e.target.value as ProjectPriority)}
            className={paperSelect}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="project-progress" className={paperLabel}>
              Progress
            </label>
            <span className="font-ledger text-sm tabular-nums">
              {formData.progress}%
            </span>
          </div>
          <input
            id="project-progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={formData.progress}
            onChange={(e) => set("progress", parseInt(e.target.value) || 0)}
            className="mt-3 w-full accent-[#1F3326]"
          />
          {errors.progress && <p className={paperErrorText}>{errors.progress}</p>}
        </div>
        <div>
          <label htmlFor="project-due" className={paperLabel}>
            Due
          </label>
          <input
            id="project-due"
            type="date"
            value={formData.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            className={paperInput}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {hoursInput("estimatedHours", "Estimated hours")}
        {hoursInput("actualHours", "Hours spent")}
      </div>

      <div>
        <label htmlFor="project-tag" className={paperLabel}>
          Tags
        </label>
        <div className="flex items-end gap-2">
          <input
            id="project-tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type a tag and press Enter"
            className={paperInput}
          />
          <PaperButton type="button" tone="quiet" onClick={addTag} className="px-3">
            Add
          </PaperButton>
        </div>
        {formData.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <li key={tag} className={paperChip}>
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    set("tags", formData.tags.filter((t) => t !== tag))
                  }
                  aria-label={`Remove tag ${tag}`}
                  className="paper-focus -mr-1 hover:text-clay"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <fieldset>
        <legend className={paperLabel}>Colour</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {PROJECT_COLORS.map((c) => (
            <label key={c.value} className="cursor-pointer" title={c.name}>
              <input
                type="radio"
                name="project-color"
                value={c.value}
                checked={formData.color === c.value}
                onChange={() => set("color", c.value)}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full ring-offset-2 ring-offset-[#F9F7EF] peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-clay"
                style={{ backgroundColor: c.value }}
              />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <PaperButton type="button" tone="quiet" onClick={onCancel}>
          Cancel
        </PaperButton>
        <PaperButton type="submit">{submitLabel}</PaperButton>
      </div>
    </form>
  );
};
