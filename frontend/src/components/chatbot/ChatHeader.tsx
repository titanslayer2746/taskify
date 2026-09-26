import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b border-ink px-5 py-4">
      <div>
        <h3 className="font-display text-2xl italic leading-none">Assistant</h3>
        <p className="mt-1 font-ledger text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Drafts entries for you to confirm · Gemini
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Close assistant">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
