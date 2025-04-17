import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlayCircle, Loader2 } from "lucide-react";

interface RunButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRun?: (id?: number) => void;
  id?: number;
}

export function RunButton({ 
  isLoading = false, 
  size = 'md', 
  className,
  onRun,
  id,
  ...props 
}: RunButtonProps) {
  
  const handleClick = () => {
    if (onRun && !isLoading) {
      onRun(id);
    }
  };
  
  const sizeClasses = {
    sm: "h-8 text-xs px-3",
    md: "h-9 text-sm px-4",
    lg: "h-10 px-5"
  };
  
  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={cn(
        "bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-[#000] font-medium",
        "border-0 transition-shadow hover:shadow-[0_0_8px_hsla(135,80%,40%,0.65)]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running...
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4" />
          Run
        </>
      )}
    </Button>
  );
}