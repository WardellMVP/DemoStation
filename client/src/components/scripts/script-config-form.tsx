import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { InfoIcon, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FormEditorField, FormEditorSection } from "@/lib/types";
import { useForm } from "react-hook-form";
import YAML from 'js-yaml';

interface ScriptConfigFormProps {
  yamlConfig: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function ScriptConfigForm({ yamlConfig, onChange, isLoading = false }: ScriptConfigFormProps) {
  const [formSections, setFormSections] = useState<FormEditorSection[]>([]);
  
  const form = useForm({
    defaultValues: {}
  });
  
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
              type: FormEditorField.TEXT,
              value: '192.168.1.0/24'
            },
            {
              name: 'scan_speed',
              label: 'Scan Speed',
              type: FormEditorField.SELECT,
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
              type: FormEditorField.TEXT,
              value: '1-1024'
            },
            {
              name: 'timeout_seconds',
              label: 'Timeout (seconds)',
              type: FormEditorField.NUMBER,
              value: 2
            },
            {
              name: 'max_retries',
              label: 'Max Retries',
              type: FormEditorField.NUMBER,
              value: 3
            }
          ]
        },
        {
          title: 'Detection Options',
          fields: [
            {
              name: 'service_detection',
              label: 'Service Detection',
              type: FormEditorField.BOOLEAN,
              value: true
            },
            {
              name: 'os_detection',
              label: 'OS Detection',
              type: FormEditorField.BOOLEAN,
              value: true
            },
            {
              name: 'vulnerability_check',
              label: 'Vulnerability Check',
              type: FormEditorField.BOOLEAN,
              value: true
            }
          ]
        },
        {
          title: 'Output Settings',
          fields: [
            {
              name: 'output_format',
              label: 'Output Format',
              type: FormEditorField.SELECT,
              value: 'json',
              options: [
                { label: 'JSON', value: 'json' },
                { label: 'CSV', value: 'csv' },
                { label: 'Text', value: 'text' },
                { label: 'HTML', value: 'html' }
              ]
            },
            {
              name: 'verbose',
              label: 'Verbose Output',
              type: FormEditorField.BOOLEAN,
              value: true
            },
            {
              name: 'save_location',
              label: 'Save Location',
              type: FormEditorField.TEXT,
              value: '/reports/'
            }
          ]
        },
        {
          title: 'Notifications',
          fields: [
            {
              name: 'email_enabled',
              label: 'Email Notifications',
              type: FormEditorField.BOOLEAN,
              value: false
            },
            {
              name: 'slack_enabled',
              label: 'Slack Notifications',
              type: FormEditorField.BOOLEAN,
              value: true
            },
            {
              name: 'webhook_url',
              label: 'Webhook URL',
              type: FormEditorField.TEXT,
              value: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
            }
          ]
        }
      ];
      
      setFormSections(sections);
      
      // Set default form values
      const defaultValues: Record<string, any> = {};
      sections.forEach(section => {
        section.fields.forEach(field => {
          defaultValues[field.name] = field.value;
        });
      });
      
      form.reset(defaultValues);
    } catch (error) {
      console.error('Failed to parse YAML', error);
    }
  }, [yamlConfig, form]);
  
  // Update YAML when form values change
  const onSubmit = (values: Record<string, any>) => {
    try {
      // In a real app, we would convert form values back to YAML
      // For this demo, we'll just log the values
      console.log('Form values:', values);
      
      // This is a simple example of converting form values to YAML
      // In a real app, this would be more sophisticated to match the original structure
      const yamlObj = {
        scan_settings: {
          target_network: values.target_network,
          scan_speed: values.scan_speed,
          port_range: values.port_range,
          timeout_seconds: values.timeout_seconds,
          max_retries: values.max_retries
        },
        detection: {
          service_detection: values.service_detection,
          os_detection: values.os_detection,
          vulnerability_check: values.vulnerability_check
        },
        output: {
          format: values.output_format,
          verbose: values.verbose,
          save_location: values.save_location,
          include_timestamp: true
        },
        notifications: {
          email: {
            enabled: values.email_enabled,
            recipients: ["admin@example.com"]
          },
          slack: {
            enabled: values.slack_enabled,
            webhook_url: values.webhook_url
          }
        }
      };
      
      const newYamlConfig = YAML.dump(yamlObj);
      onChange(newYamlConfig);
    } catch (error) {
      console.error('Failed to convert form values to YAML', error);
    }
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {formSections.map((section, index) => (
                    <div key={index}>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {section.title}
                      </h4>
                      <div className="space-y-4">
                        {section.fields.map((field) => (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                              <FormItem>
                                {field.type === FormEditorField.BOOLEAN ? (
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={formField.value}
                                        onCheckedChange={formField.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {field.label}
                                    </FormLabel>
                                  </div>
                                ) : (
                                  <>
                                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {field.label}
                                    </FormLabel>
                                    <FormControl>
                                      {field.type === FormEditorField.SELECT ? (
                                        <Select
                                          onValueChange={formField.onChange}
                                          defaultValue={formField.value}
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
                                          {...formField}
                                          type={field.type === FormEditorField.NUMBER ? 'number' : 'text'}
                                          className="w-full"
                                        />
                                      )}
                                    </FormControl>
                                  </>
                                )}
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </form>
              </Form>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
