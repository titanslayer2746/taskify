import React, { useState, useEffect } from "react";
import { Project, ProjectInput, ProjectStatus } from "@/types/project";
import { apiService } from "@/services/api";
import { clearLegacyProjects, readLegacyProjects } from "@/services/legacyProjects";
import {
  PaperBanner,
  PaperErrorState,
  PaperLoading,
} from "@/components/paper/PaperPage";
import { ProjectCard } from "./ProjectCard";
import { AddProjectDialog } from "./AddProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Search } from "lucide-react";
import { paperInput, paperSelect } from "@/lib/paper";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./projectMeta";

const columns: { id: ProjectStatus; title: string }[] = STATUS_OPTIONS.map(
  (option) => ({ id: option.value, title: option.label })
);

export const ProjectBoard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Load projects on mount, moving any browser-only projects to the account first.
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter projects when search or filters change
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredProjects(
      projects.filter(
        (project) =>
          (!query ||
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.tags.some((tag) => tag.toLowerCase().includes(query))) &&
          (statusFilter === "all" || project.status === statusFilter) &&
          (priorityFilter === "all" || project.priority === priorityFilter)
      )
    );
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  const errorMessage = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (error as { message?: string })?.message ||
    fallback;

  const migrateLegacyProjects = async () => {
    const legacy = readLegacyProjects();
    if (legacy.length === 0) {
      clearLegacyProjects(); // drops the old sample projects, if any
      return;
    }
    const response = await apiService.importProjects(legacy);
    if (response.success) {
      clearLegacyProjects();
      const count = response.data?.projects.length ?? 0;
      if (count > 0) {
        setNotice(
          `Moved ${count} project${count === 1 ? "" : "s"} from this browser into your account.`
        );
      }
    }
  };

  const loadProjects = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await migrateLegacyProjects().catch((error) =>
        console.error("Project migration failed:", error)
      );
      const response = await apiService.getProjects();
      if (response.success && response.data) {
        setProjects(response.data.projects);
      } else {
        setLoadError(response.message || "Your projects didn't load.");
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setLoadError(errorMessage(error, "Your projects didn't load. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const replaceProject = (updated: Project) =>
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const getProjectsByStatus = (status: ProjectStatus): Project[] =>
    filteredProjects.filter((project) => project.status === status);

  const handleAddProject = async (projectData: ProjectInput) => {
    try {
      const response = await apiService.createProject(projectData);
      if (response.success && response.data) {
        setProjects((prev) => [response.data!.project, ...prev]);
      } else {
        setActionError(response.message || "The project wasn't saved.");
      }
    } catch (error) {
      setActionError(errorMessage(error, "The project wasn't saved. Please try again."));
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<ProjectInput>) => {
    setEditingProject(null);
    try {
      const response = await apiService.updateProject(projectId, updates);
      if (response.success && response.data) {
        replaceProject(response.data.project);
      } else {
        setActionError(response.message || "Your changes weren't saved.");
      }
    } catch (error) {
      setActionError(errorMessage(error, "Your changes weren't saved. Please try again."));
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteProjectId(projectId);
  };

  const confirmDeleteProject = async () => {
    const projectId = deleteProjectId;
    setDeleteProjectId(null);
    if (!projectId) return;
    try {
      const response = await apiService.deleteProject(projectId);
      if (response.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        setActionError(response.message || "The project wasn't deleted.");
      }
    } catch (error) {
      setActionError(errorMessage(error, "The project wasn't deleted. Please try again."));
    }
  };

  // Moving between columns is optimistic so drag and drop feels instant.
  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const previous = projects.find((p) => p.id === projectId);
    if (!previous || previous.status === newStatus) return;
    const status = newStatus as ProjectStatus;
    replaceProject({ ...previous, status });
    try {
      const response = await apiService.updateProject(projectId, { status });
      if (response.success && response.data) {
        replaceProject(response.data.project);
      } else {
        replaceProject(previous);
        setActionError(response.message || "The project couldn't be moved.");
      }
    } catch (error) {
      replaceProject(previous);
      setActionError(errorMessage(error, "The project couldn't be moved. Please try again."));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ProjectStatus) => {
    e.preventDefault();
    if (draggedProject && draggedProject.status !== targetStatus) {
      handleStatusChange(draggedProject.id, targetStatus);
    }
    setDraggedProject(null);
  };

  const getColumnStats = (status: ProjectStatus) => {
    const columnProjects = getProjectsByStatus(status);
    const totalProgress = columnProjects.reduce(
      (sum, project) => sum + project.progress,
      0
    );
    const avgProgress =
      columnProjects.length > 0
        ? Math.round(totalProgress / columnProjects.length)
        : 0;

    return {
      count: columnProjects.length,
      avgProgress,
    };
  };

  return (
    <div className="mt-10">
      {/* Toolbar */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-x-6 gap-y-4">
          <label className="relative min-w-[14rem] flex-1 sm:max-w-xs">
            <span className="sr-only">Search projects</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              placeholder="Search projects or tags"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${paperInput} pl-6`}
            />
          </label>
          <label>
            <span className="sr-only">Stage</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${paperSelect} w-auto`}
            >
              <option value="all">All stages</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`${paperSelect} w-auto`}
            >
              <option value="all">Any priority</option>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <AddProjectDialog onAddProject={handleAddProject} />
      </div>

      {notice && (
        <PaperBanner tone="note" message={notice} onDismiss={() => setNotice(null)} />
      )}
      {actionError && (
        <PaperBanner message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {/* Board */}
      {isLoading ? (
        <PaperLoading label="Opening your projects…" />
      ) : loadError ? (
        <PaperErrorState message={loadError} onRetry={loadProjects} />
      ) : (
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        {columns.map((column) => {
          const columnProjects = getProjectsByStatus(column.id);
          const stats = getColumnStats(column.id);
          const isTarget = dragOverColumn === column.id;

          return (
            <section
              key={column.id}
              aria-label={column.title}
              className="flex flex-col"
            >
              <header className="flex items-baseline justify-between border-b border-ink pb-2">
                <h2 className="font-ledger text-[11px] uppercase tracking-[0.18em] text-ink">
                  {column.title}
                  <span className="ml-2 text-ink-faint">{stats.count}</span>
                </h2>
                {stats.count > 0 && (
                  <span className="font-ledger text-[10px] text-ink-faint">
                    avg {stats.avgProgress}%
                  </span>
                )}
              </header>

              <div
                className={`mt-4 flex min-h-[14rem] flex-1 flex-col gap-3 rounded-[3px] p-1 transition-colors ${
                  isTarget ? "bg-ink/[0.05] outline-dashed outline-1 outline-ink/30" : ""
                }`}
                onDragOver={(e) => {
                  handleDragOver(e);
                  if (dragOverColumn !== column.id) setDragOverColumn(column.id);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverColumn(null);
                  }
                }}
                onDrop={(e) => {
                  handleDrop(e, column.id);
                  setDragOverColumn(null);
                }}
              >
                {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onDragEnd={() => setDragOverColumn(null)}
                    className={`cursor-grab active:cursor-grabbing ${
                      draggedProject?.id === project.id ? "opacity-50" : ""
                    }`}
                  >
                    <ProjectCard
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}

                {columnProjects.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-[3px] border border-dashed border-ink/20 px-4 py-10 text-center">
                    <p className="font-display text-lg italic text-ink-faint">
                      Nothing here yet
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      )}

      <EditProjectDialog
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        onUpdateProject={handleUpdateProject}
      />

      <ConfirmationDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={confirmDeleteProject}
        title="Delete this project?"
        message="It will be removed from the board for good."
        confirmText="Delete"
        cancelText="Keep it"
      />
    </div>
  );
};
