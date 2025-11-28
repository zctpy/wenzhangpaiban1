import { CSSProperties } from 'react';

export interface DocumentSection {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullet_list' | 'numbered_list' | 'quote' | 'image';
  content: string | string[];
  alt?: string; // For images
}

export interface FormattedDocument {
  title: string;
  subtitle?: string;
  author?: string;
  sections: DocumentSection[];
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  // Typography classes (Tailwind)
  fontHeading: string;
  fontBody: string;
  // Colors (Tailwind classes)
  primaryColor: string;   // Main text color (usually dark)
  secondaryColor: string; // Secondary text color (lighter)
  accentColor: string;    // Accent color for decorations (borders, backgrounds)
  
  // Explicit HEX colors for DOCX export
  exportColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Visual Styling Logic
  headingStyle: 'simple' | 'underlined' | 'left-border' | 'boxed' | 'highlight-bottom' | 'centered-line' | 'bracket' | 'creative-blob';
}

export interface Background {
  id: string;
  name: string;
  className: string; // Tailwind classes for background
  style?: CSSProperties; // Inline styles for complex gradients/patterns
}