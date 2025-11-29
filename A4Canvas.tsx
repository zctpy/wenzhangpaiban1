import React, { useEffect, useRef, useState } from 'react';
import { FormattedDocument, Theme, Background, PageSettings, HeaderFooterContentType } from '../types';
import { Quote, Trash2, AlertCircle } from 'lucide-react';

interface SectionWrapperProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, onDelete }) => (
  <div className="relative group/section -ml-8 pl-8 transition-colors hover:bg-gray-50/30 rounded pr-2 break-inside-avoid">
      <button 
          onClick={onDelete}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/section:opacity-100 transition-opacity print:hidden z-30 delete-section-btn"
          title="删除此段落"
      >
          <Trash2 className="w-4 h-4" />
      </button>
      {children}
  </div>
);

interface A4CanvasProps {
  document: FormattedDocument | null;
  theme: Theme;
  background: Background;
  pageSettings: PageSettings;
  zoom: number;
  onUpdateContent: (key: string, value: any, index?: number) => void;
  onUpdateSection: (index: number, content: any) => void;
  onDeleteSection: (index: number) => void;
  onSectionFocus: (index: number) => void;
}

const A4Canvas: React.FC<A4CanvasProps> = ({ 
  document, 
  theme, 
  background, 
  pageSettings,
  zoom, 
  onUpdateContent,
  onUpdateSection,
  onDeleteSection,
  onSectionFocus
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure content height to calculate how many pages we need
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Initial measure
    setContentHeight(contentRef.current.scrollHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // We use the scrollHeight to capture the full content
        // Ensure we handle non-zero heights primarily
        if (entry.target.scrollHeight > 0) {
            setContentHeight(entry.target.scrollHeight);
        }
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [document, theme, zoom]);

  if (!document) return null;

  // Typography: 16pt body text, 1.8 line height
  const bodyClass = `${theme.fontBody} ${theme.secondaryColor} outline-none text-justify text-[16pt] leading-[1.8] tracking-[0.02em]`;
  
  // Standard A4 Dimensions in MM
  const A4_HEIGHT_MM = 297;
  const PIXELS_PER_MM = 3.7795; // Approx at 96 DPI
  const A4_HEIGHT_PX = Math.ceil(A4_HEIGHT_MM * PIXELS_PER_MM); 
  
  // Margins (Standard 25.4mm)
  const margins = { top: '25.4mm', bottom: '25.4mm', left: '25.4mm', right: '25.4mm' };

  // Calculate page count based on content height (min 1 page)
  const pageCount = Math.max(1, Math.ceil((contentHeight || 1) / A4_HEIGHT_PX));
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  // Helper to resolve header/footer content
  const resolveContent = (type: HeaderFooterContentType, custom: string, pageNum: number): string => {
      switch (type) {
          case 'title': return document.title || '';
          case 'date': return new Date().toLocaleDateString();
          case 'page-number': return `${pageNum}`;
          case 'custom': return custom || '';
          default: return '';
      }
  };

  const renderHeaderFooterArea = (type: 'header' | 'footer', pageNum: number) => {
      const config = pageSettings[type];
      if (!config.enabled) return null;
      if (pageSettings.hideOnFirstPage && pageNum === 1) return null;

      // Handle Mirror Margins (swap left/right on even pages)
      const isEven = pageNum % 2 === 0;
      let left = config.left;
      let right = config.right;
      
      if (pageSettings.mirrorMargins && isEven) {
          left = config.right;
          right = config.left;
      }

      const leftContent = resolveContent(left, config.customText, pageNum);
      const centerContent = resolveContent(config.center, config.customText, pageNum);
      const rightContent = resolveContent(right, config.customText, pageNum);

      return (
          <div className={`w-full flex items-center justify-between text-[10pt] ${theme.secondaryColor} ${theme.fontBody} px-[25.4mm] h-[15mm] ${config.showLine ? (type === 'header' ? 'border-b' : 'border-t') : ''} border-gray-300`}>
              <div className="flex-1 text-left">{leftContent}</div>
              <div className="flex-1 text-center">{centerContent}</div>
              <div className="flex-1 text-right">{rightContent}</div>
          </div>
      );
  };

  const getHeadingRender = (level: 'main' | 'sub', content: string, commonProps: any) => {
      const Tag = level === 'main' ? 'h1' : 'h2';
      
      // Base styles
      let className = `${theme.fontHeading} ${theme.primaryColor} font-bold outline-none mb-6 leading-tight break-after-avoid `;
      
      if (level === 'main') {
          // Main Title: 32pt
          className += 'text-[32pt] mt-4 mb-14 ';
      } else {
          // Subtitle/H2: 22pt
          className += 'text-[22pt] mt-12 mb-8 ';
      }

      // Decorative Styles based on theme
      switch (theme.headingStyle) {
          case 'underlined':
              className += `border-b-[3px] pb-3 ${theme.accentColor.replace('bg-', 'border-')}`;
              break;
          case 'left-border':
              className += `border-l-[10px] pl-6 ${theme.accentColor.replace('bg-', 'border-')}`;
              break;
          case 'boxed':
              if (level === 'sub') {
                  className += `inline-block px-6 py-2 rounded text-white ${theme.accentColor} print:bg-blue-600 print:text-white`;
              } else {
                  className += `text-center`;
              }
              break;
          case 'highlight-bottom':
              className += `inline-block border-b-[8px] ${theme.accentColor.replace('bg-', 'border-').replace('text-', '')} pb-1`;
              break;
          case 'centered-line':
              className += `text-center border-b border-gray-300 pb-5`;
              break;
          case 'bracket':
              if (level === 'sub') {
                   return (
                      <Tag className={`text-[22pt] font-bold ${theme.primaryColor} mt-12 mb-8 text-center break-after-avoid`} {...commonProps}>
                          <span className={`text-[18pt] align-middle mr-3 ${theme.accentColor}`}>【</span>
                          {content}
                          <span className={`text-[18pt] align-middle ml-3 ${theme.accentColor}`}>】</span>
                      </Tag>
                   )
              }
              className += 'text-center';
              break;
          case 'creative-blob':
              // Simple style for creative
              break;
          case 'simple':
          default:
              break;
      }

      return <Tag className={className} {...commonProps}>{content}</Tag>;
  };

  return (
    <div className="relative" id="printable-root">
      
      {/* Main Canvas Container */}
      <div 
        className="mx-auto shadow-2xl relative group transition-transform duration-200 ease-out print:shadow-none print:m-0 print:w-full"
        style={{
          width: '210mm',
          minHeight: `${pageCount * A4_HEIGHT_MM}mm`, 
          height: 'auto', // Allow it to grow
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          backgroundColor: 'white',
          backgroundImage: background.style?.backgroundImage,
          ...background.style,
        }}
      >
        {/* Background Layer (for textures) */}
        {background.id !== 'white' && (
             <div 
             className={`absolute inset-0 z-0 pointer-events-none ${background.className}`}
             style={{
                ...background.style,
                height: '100%',
                opacity: 0.5
             }}
           />
        )}

        {/* Page Overlays (Header/Footer/Guides) */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden print:overflow-visible">
            {pages.map((pageNum) => (
                <div 
                    key={`page-overlay-${pageNum}`}
                    className="absolute w-full flex flex-col justify-between"
                    style={{
                        top: `${(pageNum - 1) * A4_HEIGHT_MM}mm`,
                        height: `${A4_HEIGHT_MM}mm`,
                    }}
                >
                    {/* Header Area */}
                    <div className="pt-[10mm] w-full z-50">
                        {renderHeaderFooterArea('header', pageNum)}
                    </div>

                    {/* Footer Area */}
                    <div className="pb-[10mm] w-full z-50">
                         {renderHeaderFooterArea('footer', pageNum)}
                    </div>

                     {/* Visual Page Break (Editor Only) */}
                    {pageNum < pageCount && (
                         <div className="absolute bottom-0 w-full border-b border-dashed border-gray-300 print:hidden opacity-50" />
                    )}
                </div>
            ))}
        </div>

        {/* Content Layer */}
        <div 
            ref={contentRef}
            className="relative z-20 flex flex-col min-h-[50mm]"
            style={{
                paddingTop: margins.top,
                paddingBottom: '30mm',
                paddingLeft: margins.left,
                paddingRight: margins.right,
            }}
        >
          
          <header className={`mb-12 ${theme.headingStyle === 'centered-line' ? 'text-center' : ''} group/header relative hover:bg-gray-50/50 p-2 -m-2 rounded transition-colors break-inside-avoid`}>
            {getHeadingRender('main', document.title || '无标题文档', {
                contentEditable: true,
                suppressContentEditableWarning: true,
                onBlur: (e: any) => onUpdateContent('title', e.currentTarget.innerText)
            })}
            
            {document.subtitle && (
              <p 
                className={`text-[20pt] ${theme.fontBody} text-gray-500 mb-10 italic font-light outline-none`}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateContent('subtitle', e.currentTarget.innerText)}
              >
                {document.subtitle}
              </p>
            )}
            {document.author && (
              <div className={`flex items-center gap-3 ${theme.headingStyle === 'centered-line' ? 'justify-center' : ''} text-[12pt] uppercase tracking-[0.2em] ${theme.fontBody} text-gray-500 font-bold mb-10`}>
                <span className="w-8 h-8 flex items-center justify-center opacity-0 group-hover/header:opacity-100 cursor-move text-gray-300 print:hidden delete-section-btn">⋮⋮</span>
                <span className="w-8 h-[1px] bg-gray-300 inline-block"></span>
                <span 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateContent('author', e.currentTarget.innerText)}
                    className="outline-none"
                >
                    {document.author}
                </span>
                <span className="w-8 h-[1px] bg-gray-300 inline-block"></span>
              </div>
            )}
          </header>

          <main className="flex-grow">
            {document.sections.map((section, idx) => {
              const commonProps = {
                contentEditable: true,
                suppressContentEditableWarning: true,
                onFocus: () => onSectionFocus(idx),
                onBlur: (e: React.FocusEvent<HTMLElement>) => onUpdateSection(idx, e.currentTarget.innerText),
              };

              const sectionType = section.type.toLowerCase();

              if (sectionType === 'heading' || sectionType === 'subheading') {
                return (
                  <SectionWrapper key={idx} onDelete={() => onDeleteSection(idx)}>
                     {getHeadingRender('sub', section.content as string, commonProps)}
                  </SectionWrapper>
                );
              }
              
              if (sectionType === 'paragraph') {
                return (
                  <SectionWrapper key={idx} onDelete={() => onDeleteSection(idx)}>
                    <p className={`${bodyClass} mb-8`} {...commonProps}>
                        {section.content as string}
                    </p>
                  </SectionWrapper>
                );
              }

              if (sectionType === 'bullet_list' || sectionType === 'numbered_list') {
                const items = Array.isArray(section.content) ? section.content : [section.content as string];
                const listTag = sectionType === 'bullet_list' ? 'ul' : 'ol';
                const ListComponent = listTag as any;
                
                return (
                  <SectionWrapper key={idx} onDelete={() => onDeleteSection(idx)}>
                      <ListComponent className={`${bodyClass} ${sectionType === 'bullet_list' ? 'list-disc' : 'list-decimal'} pl-12 mb-10 marker:${theme.primaryColor} marker:font-bold`}>
                        {items.map((item, i) => (
                        <li key={i} className="pl-2 mb-3 break-inside-avoid">
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onFocus={() => onSectionFocus(idx)}
                                onBlur={(e) => {
                                    const newItems = [...items];
                                    newItems[i] = e.currentTarget.innerText;
                                    onUpdateSection(idx, newItems);
                                }}
                                className="outline-none"
                            >
                                {item}
                            </span>
                        </li>
                        ))}
                    </ListComponent>
                  </SectionWrapper>
                );
              }

              if (sectionType === 'quote') {
                return (
                  <SectionWrapper key={idx} onDelete={() => onDeleteSection(idx)}>
                    <div className={`relative my-12 p-10 ${theme.id === 'creative' ? 'bg-teal-50/50 rounded-xl' : 'bg-gray-50/80 border-l-[6px] ' + theme.accentColor.replace('bg-', 'border-').replace('text-', '')} break-inside-avoid`}>
                        <Quote className={`absolute top-6 left-6 w-8 h-8 ${theme.primaryColor} opacity-20`} />
                        <p 
                            className={`${theme.fontHeading} text-[16pt] italic text-gray-700 relative z-10 pl-10 outline-none leading-relaxed`}
                            {...commonProps}
                        >
                        {section.content as string}
                        </p>
                    </div>
                  </SectionWrapper>
                );
              }

              if (sectionType === 'image') {
                return (
                  <SectionWrapper key={idx} onDelete={() => onDeleteSection(idx)}>
                      <div className="my-12 flex flex-col items-center break-inside-avoid">
                          <img 
                            src={section.content as string} 
                            alt={section.alt || "Document Image"}
                            className="max-w-full rounded shadow-sm print:shadow-none"
                            style={{ maxHeight: '700px' }}
                            onClick={() => onSectionFocus(idx)}
                          />
                          {section.alt && <p className="text-[12pt] text-gray-500 mt-4 italic">{section.alt}</p>}
                      </div>
                  </SectionWrapper>
                )
              }

              // Fallback for unknown types
              return (
                  <SectionWrapper key={idx} onDelete={() => onDeleteSection(idx)}>
                      <div className="text-red-400 bg-red-50 p-4 rounded border border-red-200 mb-8 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5"/>
                        <span>Unknown format type: {sectionType}</span>
                      </div>
                  </SectionWrapper>
              );
            })}
          </main>

        </div>
      </div>
      
    </div>
  );
};

export default A4Canvas;