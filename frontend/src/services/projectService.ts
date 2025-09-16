import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectStats,
} from "@/types/project";

const STORAGE_KEY = "habittty_projects";

// Default projects for demo
const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete redesign of the company website with modern UI/UX",
    status: "in-progress",
    priority: "high",
    progress: 65,
    dueDate: "2024-02-15",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    tags: ["design", "frontend", "ui/ux"],
    estimatedHours: 40,
    actualHours: 26,
    color: "#7fff00",
  },
  {
    id: "2",
    title: "Mobile App Development",
    description:
      "Build a cross-platform mobile application for iOS and Android",
    status: "not-started",
    priority: "medium",
    progress: 0,
    dueDate: "2024-03-30",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
    tags: ["mobile", "react-native", "development"],
    estimatedHours: 120,
    actualHours: 0,
    color: "#adff2f",
  },
  {
    id: "3",
    title: "Database Migration",
    description: "Migrate from MySQL to PostgreSQL with data integrity checks",
    status: "done",
    priority: "high",
    progress: 100,
    dueDate: "2024-01-20",
    createdAt: "2023-12-15",
    updatedAt: "2024-01-20",
    tags: ["database", "migration", "backend"],
    estimatedHours: 24,
    actualHours: 28,
    color: "#9acd32",
  },
  {
    id: "4",
    title: "API Documentation",
    description: "Create comprehensive API documentation with examples",
    status: "archive",
    priority: "low",
    progress: 100,
    dueDate: "2023-12-31",
    createdAt: "2023-11-01",
    updatedAt: "2023-12-31",
    tags: ["documentation", "api", "technical-writing"],
    estimatedHours: 16,
    actualHours: 18,
    color: "#7fff00",
  },
];

export class ProjectService {
  private static getProjectsFromStorage(): Project[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default projects if no data exists
      this.saveProjectsToStorage(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    } catch (error) {
      console.error("Error loading projects from storage:", error);
      return DEFAULT_PROJECTS;
    }
  }

  private static saveProjectsToStorage(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Error saving projects to storage:", error);
    }
  }

  static getAllProjects(): Project[] {
    return this.getProjectsFromStorage();
  }

  static getProjectById(id: string): Project | undefined {
    const projects = this.getProjectsFromStorage();
    return projects.find((project) => project.id === id);
  }

  static getProjectsByStatus(status: ProjectStatus): Project[] {
    const projects = this.getProjectsFromStorage();
    return projects.filter((project) => project.status === status);
  }

  static createProject(
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Project {
    const projects = this.getProjectsFromStorage();
    const newProject: Project = {
      ...projectData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    this.saveProjectsToStorage(projects);
    return newProject;
  }

  static updateProject(
    id: string,
    updates: Partial<Omit<Project, "id" | "createdAt">>
  ): Project | null {
    const projects = this.getProjectsFromStorage();
    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) {
      return null;
    }

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveProjectsToStorage(projects);
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjectsFromStorage();
    const filteredProjects = projects.filter((project) => project.id !== id);

    if (filteredProjects.length === projects.length) {
      return false; // Project not found
    }

    this.saveProjectsToStorage(filteredProjects);
    return true;
  }

  static updateProjectStatus(
    id: string,
    status: ProjectStatus
  ): Project | null {
    return this.updateProject(id, { status });
  }

  static updateProjectProgress(id: string, progress: number): Project | null {
    return this.updateProject(id, {
      progress: Math.max(0, Math.min(100, progress)),
    });
  }

  static getProjectStats(): ProjectStats {
    const projects = this.getProjectsFromStorage();
    const now = new Date();

    const stats: ProjectStats = {
      total: projects.length,
      notStarted: 0,
      inProgress: 0,
      done: 0,
      archived: 0,
      overdue: 0,
      totalEstimatedHours: 0,
      totalActualHours: 0,
    };

    projects.forEach((project) => {
      // Count by status
      switch (project.status) {
        case "not-started":
          stats.notStarted++;
          break;
        case "in-progress":
          stats.inProgress++;
          break;
        case "done":
          stats.done++;
          break;
        case "archive":
          stats.archived++;
          break;
      }

      // Check for overdue projects
      if (
        project.dueDate &&
        project.status !== "done" &&
        project.status !== "archive"
      ) {
        const dueDate = new Date(project.dueDate);
        if (dueDate < now) {
          stats.overdue++;
        }
      }

      // Sum hours
      if (project.estimatedHours) {
        stats.totalEstimatedHours += project.estimatedHours;
      }
      if (project.actualHours) {
        stats.totalActualHours += project.actualHours;
      }
    });

    return stats;
  }

  static searchProjects(query: string): Project[] {
    const projects = this.getProjectsFromStorage();
    const lowercaseQuery = query.toLowerCase();

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(lowercaseQuery) ||
        project.description.toLowerCase().includes(lowercaseQuery) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  static getProjectsByTag(tag: string): Project[] {
    const projects = this.getProjectsFromStorage();
    return projects.filter((project) =>
      project.tags.some((projectTag) =>
        projectTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static clearAllProjects(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static exportProjects(): string {
    const projects = this.getProjectsFromStorage();
    return JSON.stringify(projects, null, 2);
  }

  static importProjects(jsonData: string): boolean {
    try {
      const projects = JSON.parse(jsonData);
      if (Array.isArray(projects)) {
        this.saveProjectsToStorage(projects);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing projects:", error);
      return false;
    }
  }
}
