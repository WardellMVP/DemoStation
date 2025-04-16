import { useEffect, useRef, useState } from "react";
import * as monaco from 'monaco-editor';
import { Loader2 } from "lucide-react";

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

export function MonacoEditor({
  value,
  language,
  onChange,
  height = "400px",
  readOnly = false
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Initialize editor
    const _editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly,
      lineNumbers: 'on',
      folding: true,
      wordWrap: 'on',
      contextmenu: true,
      fontFamily: "'Fira Code', monospace",
      fontSize: 14,
    });
    
    setEditor(_editor);
    setIsLoading(false);
    
    // Add change listener
    if (onChange) {
      const disposable = _editor.onDidChangeModelContent(() => {
        onChange(_editor.getValue());
      });
      
      return () => {
        disposable.dispose();
        _editor.dispose();
      };
    }
    
    return () => {
      _editor.dispose();
    };
  }, [editorRef, language, onChange, readOnly]);
  
  // Update editor value when prop changes
  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [editor, value]);
  
  // Update theme when dark mode changes
  useEffect(() => {
    if (!editor) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [editor]);
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-dark z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
        </div>
      )}
      <div ref={editorRef} style={{ height, width: '100%' }} />
    </div>
  );
}
