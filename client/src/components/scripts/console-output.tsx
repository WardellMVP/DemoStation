import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ConsoleOutput as ConsoleOutputType } from "@/lib/types";
import { motion } from "framer-motion";

interface ConsoleOutputProps {
  onClose: () => void;
  scriptId?: number;
  executionId?: number;
}

export function ConsoleOutput({ onClose, scriptId, executionId }: ConsoleOutputProps) {
  const { toast } = useToast();
  const [output, setOutput] = useState<ConsoleOutputType[]>([]);
  
  // In a real app, we would fetch the console output from the backend
  // based on the scriptId and executionId
  useEffect(() => {
    // Example output for demonstration
    const mockOutput: ConsoleOutputType[] = [
      { id: '1', timestamp: new Date().toISOString(), text: '# Starting Network Scanner v2.1.0', type: 'info' },
      { id: '2', timestamp: new Date().toISOString(), text: '# Target network: 192.168.1.0/24', type: 'info' },
      { id: '3', timestamp: new Date().toISOString(), text: '# Scanning ports 1-1024', type: 'info' },
      { id: '4', timestamp: new Date().toISOString(), text: 'Discovering hosts...', type: 'info' },
      { id: '5', timestamp: new Date().toISOString(), text: '[+] Found 12 active hosts', type: 'success' },
      { id: '6', timestamp: new Date().toISOString(), text: 'Beginning port scan...', type: 'info' },
      { id: '7', timestamp: new Date().toISOString(), text: '[*] 192.168.1.1: Ports 22, 80, 443 open', type: 'warning' },
      { id: '8', timestamp: new Date().toISOString(), text: '[*] 192.168.1.5: Ports 22, 3389 open', type: 'warning' },
      { id: '9', timestamp: new Date().toISOString(), text: 'Performing service detection...', type: 'info' },
      { id: '10', timestamp: new Date().toISOString(), text: 'Checking for vulnerabilities...', type: 'info' },
      { id: '11', timestamp: new Date().toISOString(), text: '[!] WARNING: 192.168.1.5 - Outdated SSH service (v1.0) detected', type: 'error' },
      { id: '12', timestamp: new Date().toISOString(), text: '[+] Scan complete. Report saved to /reports/network_scan_20230414_152233.json', type: 'success' },
      { id: '13', timestamp: new Date().toISOString(), text: '[+] Notification sent to Slack', type: 'success' },
    ];
    
    // Simulate output arriving over time
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < mockOutput.length) {
        setOutput(prev => [...prev, mockOutput[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 500);
    
    return () => {
      clearInterval(interval);
    };
  }, [scriptId, executionId]);
  
  const handleCopy = () => {
    const text = output.map(line => line.text).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Console output has been copied to clipboard",
      });
    });
  };
  
  const handleSave = () => {
    const text = output.map(line => line.text).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `console_output_${new Date().toISOString().replace(/:/g, '-')}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Output saved",
      description: "Console output has been saved as a text file",
    });
  };
  
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 bg-gray-900 text-gray-100 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <h3 className="font-medium text-white">Console Output</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleCopy} className="text-gray-400 hover:text-white">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave} className="text-gray-400 hover:text-white">
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 font-mono text-sm overflow-auto max-h-[300px]">
        {output.map((line) => (
          <div 
            key={line.id} 
            className={cn(
              line.type === 'info' ? 'text-gray-400' : 
              line.type === 'success' ? 'text-green-400' : 
              line.type === 'warning' ? 'text-yellow-400' : 
              'text-red-400'
            )}
          >
            {line.text}
          </div>
        ))}
        
        {output.length === 0 && (
          <div className="text-gray-400">Waiting for output...</div>
        )}
      </div>
    </motion.div>
  );
}
