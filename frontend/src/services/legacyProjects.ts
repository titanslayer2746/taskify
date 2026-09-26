// Projects used to live only in this browser's localStorage. These helpers
// find any the user made there so they can be moved to their account once.
import type { Project, ProjectInput } from "@/types/project";
import { toDateKey } from "@/lib/habits";
import { projectColor } from "@/components/projects/projectMeta";

const STORAGE_KEY = "habittty_projects";

// The sample projects every browser was seeded with; never worth importing.
const SAMPLE_PROJECTS: Record<string, string> = {
  "1": "Website Redesign",
  "2": "Mobile App Development",
  "3": "Database Migration",
  "4": "API Documentation",
};

const isSample = (p: Partial<Project>) =>
  !!p.id && SAMPLE_PROJECTS[p.id] === p.title;

// Old due dates were full ISO timestamps; the API wants YYYY-MM-DD.
const toDueDate = (value?: string) => {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : toDateKey(date);
};

const nonNegative = (value?: number) =>
  typeof value === "number" && value >= 0 ? value : undefined;

export const readLegacyProjects = (): ProjectInput[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((p: Partial<Project>) => p && typeof p.title === "string" && !isSample(p))
      // Fit old data to the API's limits so nothing is rejected on import.
      .map((p: Partial<Project>) => ({
        title: (p.title as string).trim().slice(0, 100) || "Untitled project",
        description: (p.description ?? "").slice(0, 1000),
        status: p.status ?? "not-started",
        priority: p.priority ?? "medium",
        progress:
          typeof p.progress === "number" ? Math.min(100, Math.max(0, p.progress)) : 0,
        dueDate: toDueDate(p.dueDate),
        tags: (Array.isArray(p.tags) ? p.tags : [])
          .filter((t): t is string => typeof t === "string" && !!t.trim())
          .map((t) => t.trim().slice(0, 30))
          .slice(0, 10),
        estimatedHours: nonNegative(p.estimatedHours),
        actualHours: nonNegative(p.actualHours),
        color: projectColor(p.color),
      }));
  } catch {
    return [];
  }
};

export const clearLegacyProjects = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
};
