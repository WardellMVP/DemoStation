import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function YamlEditor({ value, onChange, isLoading = false }: YamlEditorProps) {
  const { toast } = useToast();
  const [internalValue, setInternalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update internal value when prop value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate a save operation
    setTimeout(() => {
      onChange(internalValue);
      setIsSaving(false);
      toast({
        title: "Configuration saved",
        description: "Your YAML configuration has been updated",
      });
    }, 500);
  };
  
  const handleReset = () => {
    setInternalValue(value);
    toast({
      title: "Configuration reset",
      description: "Your changes have been discarded",
    });
  };
  
  // Apply syntax highlighting
  const highlightedYaml = internalValue
    .replace(/(^[a-zA-Z0-9_-]+):/gm, '<span class="yaml-key">$1:</span>')
    .replace(/: ([^#\n]+)/g, ': <span class="yaml-value">$1</span>')
    .replace(/#.+/g, '<span class="yaml-comment">$&</span>')
    .replace(/\n/g, '<br>');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-base font-medium">Configuration (YAML)</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSave} 
              disabled={isLoading || isSaving || internalValue === value}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReset} 
              disabled={isLoading || internalValue === value}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
                className={cn(
                  "font-mono text-sm w-full h-96 p-4 rounded-md resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary",
                  "bg-gray-50 dark:bg-dark text-gray-800 dark:text-gray-200",
                  "absolute top-0 left-0 z-10 opacity-0"
                )}
                spellCheck="false"
              ></textarea>
              <pre 
                className="font-mono text-sm w-full h-96 p-4 rounded-md bg-gray-50 dark:bg-dark overflow-auto"
                style={{ tabSize: 2 }}
                dangerouslySetInnerHTML={{ __html: highlightedYaml }}
              ></pre>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
