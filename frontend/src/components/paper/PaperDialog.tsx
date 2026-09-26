import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type PaperDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
};

const PaperDialog: React.FC<PaperDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content className={`fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 overflow-y-auto ${size === "lg" ? "max-w-2xl" : "max-w-md"} -translate-y-1/2 rounded-[3px] bg-[#F9F7EF] font-paper text-ink shadow-[0_1px_0_#d3cdb7,0_30px_60px_-20px_rgba(20,45,30,0.45)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`}>
        <div className="relative py-8 pl-14 pr-7 sm:pr-10">
          <div className="pointer-events-none absolute bottom-0 left-8 top-0 w-px bg-clay/40" />
          <DialogPrimitive.Title className="font-display text-3xl italic leading-tight">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-3 leading-relaxed text-ink-soft">
              {description}
            </DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>
          )}
          <div className="mt-7">{children}</div>
        </div>
        <DialogPrimitive.Close className="paper-focus absolute right-4 top-4 p-1 text-ink-faint transition-colors hover:text-ink">
          <X size={18} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export const PaperButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: "ink" | "quiet" | "danger";
  }
> = ({ tone = "ink", className = "", ...props }) => {
  const tones = {
    ink: "bg-ink text-paper hover:bg-clay disabled:hover:bg-ink",
    quiet: "text-ink-soft hover:text-ink hover:bg-ink/5",
    danger: "bg-clay text-paper hover:bg-[#8A4526] disabled:hover:bg-clay",
  };
  return (
    <button
      className={`paper-focus inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-[15px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]} ${className}`}
      {...props}
    />
  );
};

export default PaperDialog;
