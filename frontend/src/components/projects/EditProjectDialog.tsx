import React from "react";
import { Project } from "@/types/project";
import PaperDialog from "@/components/paper/PaperDialog";
import { ProjectForm } from "./ProjectForm";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  project,
  open,
  onOpenChange,
  onUpdateProject,
}) => (
  <PaperDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Edit project"
    size="lg"
  >
    {project && (
      <ProjectForm
        key={project.id}
        initial={project}
        submitLabel="Save changes"
        onSubmit={(values) => {
          onUpdateProject(project.id, values);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    )}
  </PaperDialog>
);
