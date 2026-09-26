import type { ProjectPriority, ProjectStatus } from "@/types/project";

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "archive", label: "Archive" },
];

export const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// Inks that sit well on the paper background.
export const PROJECT_COLORS = [
  { value: "#1F3326", name: "Forest" },
  { value: "#B8643C", name: "Terracotta" },
  { value: "#4A6C8C", name: "Slate blue" },
  { value: "#C29A3B", name: "Ochre" },
  { value: "#7A4E6E", name: "Plum" },
  { value: "#7C8B4F", name: "Moss" },
  { value: "#86907F", name: "Pencil" },
];

// Older projects may carry colours from the previous palette; show them in ink.
export const projectColor = (color?: string) =>
  PROJECT_COLORS.some((c) => c.value === color)
    ? (color as string)
    : PROJECT_COLORS[0].value;
