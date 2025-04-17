import React from "react";
import { Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingOverlay({ isOpen, message = "Loading..." }: LoadingOverlayProps) {
  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent
        className="bg-[#111] border border-[#2a2a2a] p-6 max-w-xs mx-auto"
        hideClose={true}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(135,80%,45%)]" />
          <p className="text-base text-gray-300">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}