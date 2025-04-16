import { useState, useEffect } from "react";
import { YamlEditorState } from "@/lib/types";
import YAML from 'js-yaml';

export function useYamlEditor(initialValue: string = '') {
  const [state, setState] = useState<YamlEditorState>({
    value: initialValue,
    isValid: true,
  });
  
  // Update the YAML value
  const setValue = (value: string) => {
    try {
      // Validate YAML by parsing it
      YAML.load(value);
      setState({
        value,
        isValid: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        setState({
          value,
          isValid: false,
          error: error.message,
        });
      } else {
        setState({
          value,
          isValid: false,
          error: 'Invalid YAML format',
        });
      }
    }
  };
  
  // Reset to initial value
  const reset = () => {
    setValue(initialValue);
  };
  
  // Update state when initial value changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  return {
    ...state,
    setValue,
    reset,
  };
}
