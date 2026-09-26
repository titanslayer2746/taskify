import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Project } from "@/types/project";
import PaperDialog, { PaperButton } from "@/components/paper/PaperDialog";
import { ProjectForm } from "./ProjectForm";

interface AddProjectDialogProps {
  onAddProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
  trigger?: React.ReactNode;
}

export const AddProjectDialog: React.FC<AddProjectDialogProps> = ({
  onAddProject,
  trigger,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <PaperButton onClick={() => setOpen(true)}>
          <Plus size={16} />
          New project
        </PaperButton>
      )}
      <PaperDialog
        open={open}
        onOpenChange={setOpen}
        title="A new project"
        size="lg"
      >
        {open && (
          <ProjectForm
            submitLabel="Add project"
            onSubmit={(values) => {
              onAddProject(values);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </PaperDialog>
    </>
  );
};
