import React from "react";
import { Project, ProjectPriority } from "@/types/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal, Edit, Trash2, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onStatusChange: (projectId: string, status: string) => void;
}

const priorityColors: Record<ProjectPriority, string> = {
  low: "bg-gray-700/50 text-gray-300 border border-gray-600",
  medium: "bg-blue-700/50 text-blue-300 border border-blue-600",
  high: "bg-orange-700/50 text-orange-300 border border-orange-600",
  urgent: "bg-red-700/50 text-red-300 border border-red-600",
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isOverdue =
    project.dueDate &&
    isAfter(new Date(), new Date(project.dueDate)) &&
    project.status !== "done" &&
    project.status !== "archive";

  const isDueSoon =
    project.dueDate &&
    isBefore(new Date(project.dueDate), addDays(new Date(), 3)) &&
    project.status !== "done" &&
    project.status !== "archive";

  return (
    <Card className="group hover:shadow-2xl hover:shadow-lime-500/40 hover:border-lime-500/50 hover:scale-105 transition-all duration-300 cursor-pointer bg-gray-800/50 border border-gray-700 relative overflow-hidden h-48">
      {/* Glow effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 via-green-500/20 to-lime-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate text-white">
                {project.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs ${priorityColors[project.priority]}`}
                >
                  {project.priority}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(project)}
                  className="hover:bg-lime-900/20 hover:text-lime-400"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(project.id, "archive")}
                  className="text-orange-600 hover:bg-orange-900/20 hover:text-orange-400"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 hover:bg-red-900/20 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
          <div className="flex-1">
            {/* Description */}
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
              {project.description}
            </p>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-0.5 h-5 bg-gradient-to-r from-lime-600/30 to-green-600/30 border border-lime-400/50 text-white font-medium hover:from-lime-500/40 hover:to-green-500/40 hover:border-lime-300/60 hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200"
                  >
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 h-5 bg-gradient-to-r from-lime-600/30 to-green-600/30 border border-lime-400/50 text-white font-medium hover:from-lime-500/40 hover:to-green-500/40 hover:border-lime-300/60 hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200"
                  >
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
            <div className="flex items-center gap-3">
              {project.dueDate && (
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue
                      ? "text-red-600"
                      : isDueSoon
                      ? "text-orange-600"
                      : ""
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(project.dueDate), "MMM dd")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
