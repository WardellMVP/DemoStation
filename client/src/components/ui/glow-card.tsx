import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlowCard({ 
  children, 
  className, 
  hover = true,
  ...props 
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-[#111] border border-[#2a2a2a] rounded-[4px] overflow-hidden",
        hover && "transition-shadow hover:shadow-[0_0_8px_hsla(135,80%,40%,0.65)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}