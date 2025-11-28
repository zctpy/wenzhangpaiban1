import { Theme, Background, FormattedDocument } from './types';

export const THEMES: Theme[] = [
  {
    id: 'modern',
    name: '现代简约',
    description: '通用的无衬线设计，简洁大方。',
    fontHeading: 'font-sans',
    fontBody: 'font-sans',
    primaryColor: 'text-gray-900',
    secondaryColor: 'text-gray-700',
    accentColor: 'bg-gray-800 border-gray-800',
    exportColors: { primary: '#111827', secondary: '#374151', accent: '#1f2937' },
    headingStyle: 'simple'
  },
  {
    id: 'official',
    name: '红头文件',
    description: '经典公文风格，严肃庄重。',
    fontHeading: 'font-serif',
    fontBody: 'font-fangsong',
    primaryColor: 'text-red-600',
    secondaryColor: 'text-black',
    accentColor: 'border-red-600',
    exportColors: { primary: '#dc2626', secondary: '#000000', accent: '#dc2626' },
    headingStyle: 'underlined'
  },
  {
    id: 'fresh',
    name: '清新绿意',
    description: '自然舒适的绿色，适合教育与生活。',
    fontHeading: 'font-sans',
    fontBody: 'font-sans',
    primaryColor: 'text-emerald-800',
    secondaryColor: 'text-emerald-700',
    accentColor: 'border-emerald-500 bg-emerald-50',
    exportColors: { primary: '#065f46', secondary: '#047857', accent: '#10b981' },
    headingStyle: 'left-border'
  },
  {
    id: 'elegant',
    name: '优雅宋体',
    description: '传统文学质感，适合散文与小说。',
    fontHeading: 'font-serif',
    fontBody: 'font-serif',
    primaryColor: 'text-gray-900',
    secondaryColor: 'text-gray-700',
    accentColor: 'border-gray-400',
    exportColors: { primary: '#111827', secondary: '#374151', accent: '#9ca3af' },
    headingStyle: 'centered-line'
  },
  {
    id: 'warm',
    name: '活力橙香',
    description: '温暖活泼，适合活动方案。',
    fontHeading: 'font-sans',
    fontBody: 'font-sans',
    primaryColor: 'text-orange-900',
    secondaryColor: 'text-orange-800',
    accentColor: 'border-orange-500 bg-orange-50',
    exportColors: { primary: '#7c2d12', secondary: '#9a3412', accent: '#f97316' },
    headingStyle: 'highlight-bottom'
  },
  {
    id: 'purple',
    name: '典雅紫韵',
    description: '高贵神秘，适合女性或艺术主题。',
    fontHeading: 'font-serif',
    fontBody: 'font-sans',
    primaryColor: 'text-purple-900',
    secondaryColor: 'text-purple-700',
    accentColor: 'border-purple-600 text-purple-700',
    exportColors: { primary: '#581c87', secondary: '#7e22ce', accent: '#9333ea' },
    headingStyle: 'bracket'
  },
  {
    id: 'retro',
    name: '复古信笺',
    description: '怀旧色调，适合书信与日记。',
    fontHeading: 'font-serif',
    fontBody: 'font-serif',
    primaryColor: 'text-amber-900',
    secondaryColor: 'text-amber-800',
    accentColor: 'border-amber-700',
    exportColors: { primary: '#78350f', secondary: '#92400e', accent: '#b45309' },
    headingStyle: 'underlined'
  },
  {
    id: 'creative',
    name: '文艺手札',
    description: '手写体风格，适合个人笔记。',
    fontHeading: 'font-display',
    fontBody: 'font-sans',
    primaryColor: 'text-teal-800',
    secondaryColor: 'text-teal-700',
    accentColor: 'border-teal-400',
    exportColors: { primary: '#115e59', secondary: '#0f766e', accent: '#2dd4bf' },
    headingStyle: 'creative-blob'
  }
];

export const BACKGROUNDS: Background[] = [
  {
    id: 'white',
    name: '纯白简约',
    className: 'bg-white',
  },
  {
    id: 'warm',
    name: '护眼米黄',
    className: 'bg-[#fdfbf7]',
  },
  {
    id: 'zen-green',
    name: '禅意淡绿',
    className: 'bg-[#f0f7f4]',
    style: {
       backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
    }
  },
  {
    id: 'grid',
    name: '方格信纸',
    className: 'bg-white',
    style: {
      backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    id: 'dots',
    name: '点阵笔记',
    className: 'bg-white',
    style: {
      backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    id: 'rice-paper',
    name: '宣纸纹理',
    className: 'bg-[#fcfaf2]',
    style: {
      backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
      opacity: 0.98
    },
  }
];

export const STOCK_IMAGES = [
  {
    id: 'nature',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    alt: 'Nature Landscape'
  },
  {
    id: 'office',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    alt: 'Minimal Office'
  },
  {
    id: 'meeting',
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    alt: 'Business Meeting'
  },
  {
    id: 'books',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    alt: 'Books Library'
  },
  {
    id: 'minimal',
    url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    alt: 'Minimal Desk'
  }
];

export const DEFAULT_DOC: FormattedDocument = {
  title: "",
  sections: [
    {
      type: "paragraph",
      content: ""
    }
  ]
};