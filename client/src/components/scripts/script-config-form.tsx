import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { InfoIcon, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { FormEditorFieldType, FormEditorSection } from "@/lib/types";
import * as YAML from 'js-yaml';

interface ScriptConfigFormProps {
  yamlConfig: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function ScriptConfigForm({ yamlConfig, onChange, isLoading = false }: ScriptConfigFormProps) {
  const [formSections, setFormSections] = useState<FormEditorSection[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  
  // Parse YAML to form fields when yamlConfig changes
  useEffect(() => {
    if (!yamlConfig) return;
    
    try {
      // In a real app, we would parse the YAML and create form fields
      // For this demo, we'll use a hardcoded example matching the design
      const sections: FormEditorSection[] = [
        {
          title: 'Scan Settings',
          fields: [
            {
              name: 'target_network',
              label: 'Target Network',
              type: FormEditorFieldType.TEXT,
              value: '192.168.1.0/24'
            },
            {
              name: 'scan_speed',
              label: 'Scan Speed',
              type: FormEditorFieldType.SELECT,
              value: 'normal',
              options: [
                { label: 'Slow', value: 'slow' },
                { label: 'Normal', value: 'normal' },
                { label: 'Fast', value: 'fast' }
              ]
            },
            {
              name: 'port_range',
              label: 'Port Range',
              type: FormEditorFieldType.TEXT,
              value: '1-1024'
            },
            {
              name: 'timeout_seconds',
              label: 'Timeout (seconds)',
              type: FormEditorFieldType.NUMBER,
              value: 2
            }
          ]
        },
        {
          title: 'Detection Options',
          fields: [
            {
              name: 'service_detection',
              label: 'Service Detection',
              type: FormEditorFieldType.BOOLEAN,
              value: true
            },
            {
              name: 'os_detection',
              label: 'OS Detection',
              type: FormEditorFieldType.BOOLEAN,
              value: true
            }
          ]
        }
      ];
      
      setFormSections(sections);
      
      // Set default form values
      const initialValues: Record<string, any> = {};
      sections.forEach(section => {
        section.fields.forEach(field => {
          initialValues[field.name] = field.value;
        });
      });
      
      setFormValues(initialValues);
    } catch (error) {
      console.error('Failed to parse YAML', error);
    }
  }, [yamlConfig]);
  
  // Handle field value changes
  const handleFieldChange = (name: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update YAML when values change (with timeout to avoid too many updates)
    setTimeout(() => {
      try {
        // Convert form values to YAML
        const yamlObj = {
          scan_settings: {
            target_network: formValues.target_network,
            scan_speed: formValues.scan_speed,
            port_range: formValues.port_range,
            timeout_seconds: formValues.timeout_seconds
          },
          detection: {
            service_detection: formValues.service_detection,
            os_detection: formValues.os_detection
          }
        };
        
        const newYamlConfig = YAML.dump(yamlObj);
        onChange(newYamlConfig);
      } catch (error) {
        console.error('Failed to convert form values to YAML', error);
      }
    }, 300);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-base font-medium">Visual Editor</CardTitle>
          <Button variant="ghost" size="icon">
            <InfoIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {formSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {section.title}
                    </h4>
                    <div className="space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          {field.type === FormEditorFieldType.BOOLEAN ? (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={field.name}
                                checked={formValues[field.name] || false}
                                onCheckedChange={(checked) => 
                                  handleFieldChange(field.name, checked === true)
                                }
                              />
                              <label 
                                htmlFor={field.name}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                {field.label}
                              </label>
                            </div>
                          ) : (
                            <>
                              <label 
                                htmlFor={field.name}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                {field.label}
                              </label>
                              {field.type === FormEditorFieldType.SELECT ? (
                                <Select
                                  value={formValues[field.name] || ''}
                                  onValueChange={(value) => handleFieldChange(field.name, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id={field.name}
                                  type={field.type === FormEditorFieldType.NUMBER ? 'number' : 'text'}
                                  value={formValues[field.name] || ''}
                                  onChange={(e) => handleFieldChange(
                                    field.name, 
                                    field.type === FormEditorFieldType.NUMBER 
                                      ? Number(e.target.value) 
                                      : e.target.value
                                  )}
                                  className="w-full"
                                />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}