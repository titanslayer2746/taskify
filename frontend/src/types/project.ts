export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number; // 0-100 percentage
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  color?: string; // hex color for project card
}

// What the client sends when creating or updating a project.
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type ProjectStatus = "not-started" | "in-progress" | "done" | "archive";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";
