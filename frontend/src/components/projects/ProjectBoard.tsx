import React, { useState, useEffect } from "react";
import { Project, ProjectStatus, ProjectColumn } from "@/types/project";
import { ProjectService } from "@/services/projectService";
import { ProjectCard } from "./ProjectCard";
import { AddProjectDialog } from "./AddProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const columns: ProjectColumn[] = [
  {
    id: "not-started",
    title: "Not Started",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    projects: [],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    projects: [],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    projects: [],
  },
  {
    id: "archive",
    title: "Archive",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    projects: [],
  },
];

export const ProjectBoard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects when search or filters change
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.priority === priorityFilter
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  const loadProjects = () => {
    const allProjects = ProjectService.getAllProjects();
    setProjects(allProjects);
  };

  const getProjectsByStatus = (status: ProjectStatus): Project[] => {
    return filteredProjects.filter((project) => project.status === status);
  };

  const handleAddProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    ProjectService.createProject(projectData);
    loadProjects();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = (
    projectId: string,
    updates: Partial<Project>
  ) => {
    ProjectService.updateProject(projectId, updates);
    loadProjects();
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteProjectId(projectId);
  };

  const confirmDeleteProject = () => {
    if (deleteProjectId) {
      ProjectService.deleteProject(deleteProjectId);
      loadProjects();
      setDeleteProjectId(null);
    }
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    ProjectService.updateProjectStatus(projectId, newStatus as ProjectStatus);
    loadProjects();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold chartreuse-gradient-text">
            Project Management
          </h1>
          <p className="text-gray-400">Organize and track your projects</p>
        </div>
        <AddProjectDialog onAddProject={handleAddProject} />
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-gray-600"
                  >
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="not-started"
                    className="text-white hover:bg-gray-600"
                  >
                    Not Started
                  </SelectItem>
                  <SelectItem
                    value="in-progress"
                    className="text-white hover:bg-gray-600"
                  >
                    In Progress
                  </SelectItem>
                  <SelectItem
                    value="done"
                    className="text-white hover:bg-gray-600"
                  >
                    Done
                  </SelectItem>
                  <SelectItem
                    value="archive"
                    className="text-white hover:bg-gray-600"
                  >
                    Archive
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-gray-600"
                  >
                    All Priority
                  </SelectItem>
                  <SelectItem
                    value="low"
                    className="text-white hover:bg-gray-600"
                  >
                    Low
                  </SelectItem>
                  <SelectItem
                    value="medium"
                    className="text-white hover:bg-gray-600"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem
                    value="high"
                    className="text-white hover:bg-gray-600"
                  >
                    High
                  </SelectItem>
                  <SelectItem
                    value="urgent"
                    className="text-white hover:bg-gray-600"
                  >
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[600px]">
        {columns.map((column) => {
          const columnProjects = getProjectsByStatus(column.id);
          const stats = getColumnStats(column.id);

          return (
            <div
              key={column.id}
              className="h-full flex flex-col space-y-4"
              style={{ height: "100%" }}
            >
              {/* Column Header */}
              <Card className="bg-gray-800/50 border-gray-700 chartreuse-shadow flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Badge className={column.color}>{column.title}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      <span>{stats.count}</span>
                    </div>
                  </div>
                  {stats.count > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Avg Progress: {stats.avgProgress}%
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Column Content */}
              <div
                className="flex-1 space-y-3 min-h-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    className="cursor-move"
                  >
                    <ProjectCard
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}

                {/* Empty State */}
                {columnProjects.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg min-h-[400px]">
                    <p className="text-sm">No projects</p>
                    <p className="text-xs">
                      Drag projects here or create new ones
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        onUpdateProject={handleUpdateProject}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
