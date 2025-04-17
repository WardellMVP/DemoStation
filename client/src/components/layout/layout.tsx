import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-gray-100">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-14">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main 
          className={cn(
            "flex-1 overflow-auto p-6 bg-[#0d0d0d] fade-in",
            isSidebarOpen ? "md:ml-64" : ""
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
