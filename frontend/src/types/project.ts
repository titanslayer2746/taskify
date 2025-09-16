export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number; // 0-100 percentage
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  color?: string; // hex color for project card
}

export type ProjectStatus = "not-started" | "in-progress" | "done" | "archive";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  tags?: string[];
  search?: string;
}

export interface ProjectStats {
  total: number;
  notStarted: number;
  inProgress: number;
  done: number;
  archived: number;
  overdue: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

export interface ProjectColumn {
  id: ProjectStatus;
  title: string;
  color: string;
  projects: Project[];
}
