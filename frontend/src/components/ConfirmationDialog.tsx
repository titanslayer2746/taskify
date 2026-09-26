import React from "react";
import PaperDialog, { PaperButton } from "./paper/PaperDialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <PaperDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={message}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <PaperButton tone="quiet" onClick={onClose}>
          {cancelText}
        </PaperButton>
        <PaperButton
          tone={type === "danger" ? "danger" : "ink"}
          onClick={handleConfirm}
        >
          {confirmText}
        </PaperButton>
      </div>
    </PaperDialog>
  );
};

export default ConfirmationDialog;
