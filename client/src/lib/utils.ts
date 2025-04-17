import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "recently";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

// Get icon by script category
export function getCategoryIcon(category: string): string {
  const categoryMap: Record<string, string> = {
    'Security': 'shield-check',
    'Analytics': 'bar-chart',
    'Data': 'database-2',
    'Automation': 'robot',
    'Utility': 'file-transfer',
  };
  
  return categoryMap[category] || 'code-s-slash';
}

// Get color by script category
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'Security': 'green',
    'Analytics': 'blue', 
    'Data': 'purple',
    'Automation': 'amber',
    'Utility': 'teal',
  };
  
  return colorMap[category] || 'gray';
}

// Helper to parse YAML configuration
export function tryParseYaml(yamlString: string): object | null {
  try {
    // This would normally use a YAML parser like js-yaml
    // For now we're just returning a mock object
    return { parsed: true };
  } catch (error) {
    console.error('Failed to parse YAML', error);
    return null;
  }
}
