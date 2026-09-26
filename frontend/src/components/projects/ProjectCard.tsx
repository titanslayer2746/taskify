import React from "react";
import { Project } from "@/types/project";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addDays, format, isAfter, isBefore } from "date-fns";
import { paperChip, paperIconButton } from "@/lib/paper";
import { STATUS_OPTIONS, projectColor } from "./projectMeta";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onStatusChange: (projectId: string, status: string) => void;
}

const priorityTone: Record<Project["priority"], string> = {
  low: "text-ink-faint",
  medium: "text-ink-soft",
  high: "text-clay",
  urgent: "text-clay font-medium",
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const open = project.status !== "done" && project.status !== "archive";
  // Due dates are calendar days; read them as local midnight, not UTC.
  const due = project.dueDate
    ? new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(project.dueDate)
          ? `${project.dueDate}T00:00:00`
          : project.dueDate
      )
    : null;
  // Overdue once the whole due day has passed.
  const isOverdue = !!due && open && isAfter(new Date(), addDays(due, 1));
  const isDueSoon = !!due && open && !isOverdue && isBefore(due, addDays(new Date(), 3));

  return (
    <article className="group relative rounded-[3px] bg-[#F9F7EF] shadow-[0_1px_0_#d3cdb7,0_10px_24px_-18px_rgba(20,45,30,0.5)] transition-shadow hover:shadow-[0_1px_0_#d3cdb7,0_16px_30px_-18px_rgba(20,45,30,0.6)]">
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-[3px]"
        style={{ backgroundColor: projectColor(project.color) }}
      />
      <div className="py-4 pl-5 pr-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight">
              <button
                onClick={() => onEdit(project)}
                className="paper-focus text-left hover:text-clay"
              >
                {project.title}
              </button>
            </h3>
            <p
              className={`mt-1 font-ledger text-[10px] uppercase tracking-[0.14em] ${priorityTone[project.priority]}`}
            >
              {project.priority}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${paperIconButton} -mr-1 -mt-1`}
              aria-label={`Actions for ${project.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-paper">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-ledger text-[10px] font-normal uppercase tracking-[0.14em] text-ink-faint">
                Move to
              </DropdownMenuLabel>
              {STATUS_OPTIONS.filter((s) => s.value !== project.status).map(
                (s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => onStatusChange(project.id, s.value)}
                  >
                    {s.label}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(project.id)}
                className="text-clay focus:text-clay"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {project.description}
          </p>
        )}

        {project.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <li key={tag} className={paperChip}>
                {tag}
              </li>
            ))}
            {project.tags.length > 3 && (
              <li className={paperChip}>+{project.tags.length - 3}</li>
            )}
          </ul>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span
            className="h-[3px] flex-1 bg-ink/10"
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress"
          >
            <span
              className="block h-full bg-ink"
              style={{ width: `${project.progress}%` }}
            />
          </span>
          <span className="font-ledger text-[11px] tabular-nums text-ink-soft">
            {project.progress}%
          </span>
          {due && (
            <span
              className={`font-ledger text-[11px] ${
                isOverdue ? "text-clay" : isDueSoon ? "text-ink" : "text-ink-faint"
              }`}
              title={isOverdue ? "Overdue" : isDueSoon ? "Due soon" : "Due"}
            >
              {isOverdue ? "Late · " : ""}
              {format(due, "d MMM")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
