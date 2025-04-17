import { AlertCircle, ArrowLeft } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center py-20 fade-in">
      <GlowCard className="w-full max-w-md mx-4 py-8 px-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-[rgba(255,90,90,0.1)] text-red-500 p-3 rounded-[4px] border border-[rgba(255,90,90,0.2)] mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">404 Page Not Found</h1>
          
          <div className="w-16 h-1 bg-[rgba(60,180,80,0.3)] rounded-full my-4"></div>
          
          <p className="text-gray-400 mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          
          <Link href="/">
            <Button className="bg-[hsl(135,80%,45%)] hover:bg-[hsl(135,80%,40%)] text-black font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </GlowCard>
    </div>
  );
}
