import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import A4Canvas from './components/A4Canvas';
import { THEMES, BACKGROUNDS, DEFAULT_DOC, STOCK_IMAGES } from './constants';
import { FormattedDocument, Theme, Background, DocumentSection, RefineMode } from './types';
import { formatTextWithGemini } from './services/geminiService';
import { X, CheckCircle2, Image as ImageIcon, Upload } from 'lucide-react';
// Fix: Use default import for file-saver to avoid "does not provide an export named 'saveAs'" error
import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import { exportToDocx } from './services/docxService';

const App: React.FC = () => {
  // Set defaults: Theme -> Fresh Green ('fresh'), Background -> Rice Paper ('rice-paper')
  const defaultTheme = THEMES.find(t => t.id === 'fresh') || THEMES[0];
  const defaultBg = BACKGROUNDS.find(b => b.id === 'rice-paper') || BACKGROUNDS[0];

  const [formattedDoc, setFormattedDoc] = useState<FormattedDocument>(DEFAULT_DOC);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [background, setBackground] = useState<Background>(defaultBg);
  const [isFormatting, setIsFormatting] = useState(false);
  const [zoom, setZoom] = useState(0.8); 
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const docToText = (doc: FormattedDocument): string => {
    if (!doc) return "";
    let text = "";
    if (doc.title) text += `Title: ${doc.title}\n`;
    if (doc.subtitle) text += `Subtitle: ${doc.subtitle}\n`;
    if (doc.author) text += `Author: ${doc.author}\n\n`;
    
    if (doc.sections && Array.isArray(doc.sections)) {
        doc.sections.forEach(section => {
            if (!section) return;
            const type = (section.type || '').toLowerCase();
            
            if (type === 'bullet_list' || type === 'numbered_list') {
                if (Array.isArray(section.content)) {
                    section.content.forEach(item => text += `- ${item}\n`);
                }
            } else if (type === 'image') {
                text += `\n[图片]\n`; 
            } else {
                text += `${section.content}\n\n`;
            }
        });
    }
    return text;
  };

  const handleFormat = async (mode: RefineMode = 'format-strict') => {
    if (!formattedDoc) return;
    const textToFormat = docToText(formattedDoc);
    
    // Allow even shorter content for testing
    if (textToFormat.trim().length < 2) {
        setError("内容太少，无法处理");
        return;
    }

    setIsFormatting(true);
    setError(null);
    
    let successMsg = "排版完成！";
    if (mode === 'polish') successMsg = "润色完成！";
    if (mode === 'expand') successMsg = "扩写完成！";
    if (mode === 'shorten') successMsg = "缩写完成！";
    if (mode === 'fix') successMsg = "纠错完成！";

    try {
      const newDoc = await formatTextWithGemini(textToFormat, theme.id, mode);
      if (newDoc) {
        setFormattedDoc(newDoc);
        setNotification(successMsg);
        setTimeout(() => setNotification(null), 2000);
      } else {
         setError("AI 返回了空文档");
      }
    } catch (err) {
      setError("处理失败，请检查网络或稍后重试。");
      console.error(err);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleExportWord = async () => {
    setNotification("正在生成 Word 文档...");
    try {
        await exportToDocx(formattedDoc, theme);
        setNotification("Word 导出成功！");
    } catch (e) {
        console.error(e);
        setError("Word 导出失败");
    } finally {
        setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleExportImage = async () => {
    const element = document.getElementById('printable-root');
    if (!element) {
        setError("未找到可导出的文档内容");
        return;
    }

    setNotification("正在生成高清图片(A4尺寸)...");
    const originalZoom = zoom;
    
    try {
        // Temporarily reset zoom to 1 to capture high-quality image without scaling artifacts
        setZoom(1);
        
        // Allow DOM to update
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(element, {
            scale: 3, // 3x Scale for approx 300DPI Print Quality
            useCORS: true, // Enable cross-origin image loading
            backgroundColor: '#ffffff', // Ensure white background for transparent parts
            logging: false,
            // Ensure we capture the full height even if scrolled
            height: element.scrollHeight,
            windowHeight: element.scrollHeight,
            ignoreElements: (element) => element.classList.contains('no-export')
        });
        
        canvas.toBlob((blob) => {
            if (blob) {
                FileSaver.saveAs(blob, `${formattedDoc.title || 'smartdoc_export'}.png`);
                setNotification("图片导出成功！");
            } else {
                throw new Error("Blob generation failed");
            }
            setTimeout(() => setNotification(null), 2000);
        }, 'image/png');

    } catch (err) {
        console.error(err);
        setError("图片生成失败，请重试");
    } finally {
        // Restore user zoom
        setZoom(originalZoom);
    }
  };

  const handleExportHtml = () => {
      const content = document.getElementById('printable-root')?.innerHTML;
      if (!content) return;

      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${formattedDoc.title || 'SmartDoc'}</title>
          
          <!-- Inject Tailwind CSS for correct styling -->
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@300;400;600;700&family=Zhi+Mang+Xing&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <script>
            tailwind.config = {
                theme: {
                extend: {
                    fontFamily: {
                    sans: ['"Noto Sans SC"', 'Inter', 'system-ui', 'sans-serif'],
                    serif: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', '"Adobe Song Std"', 'serif'],
                    display: ['"Zhi Mang Xing"', 'cursive'],
                    body: ['"Noto Sans SC"', 'sans-serif'],
                    'fangsong': ['"FangSong"', '"STFangsong"', '"Noto Serif SC"', 'serif'],
                    },
                    colors: {
                    paper: '#fdfbf7',
                    }
                },
                },
            }
          </script>

          <style>
            body { 
                padding: 40px; 
                background: #fdfbf7; 
                min-height: 100vh;
            }
            #printable-root { 
                max-width: 210mm; 
                margin: 0 auto; 
                background: white; 
                padding: 0 !important; /* Let inner padding handle it */
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                /* Ensure background image scales correctly */
                background-size: cover;
                transform: none !important;
            }
            /* Hide UI elements in exported HTML */
            .delete-section-btn, .editor-only, .print\\:hidden, .no-export { display: none !important; }
          </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      FileSaver.saveAs(blob, `${formattedDoc.title || 'document'}.html`);
      setNotification("HTML 导出成功！");
      setTimeout(() => setNotification(null), 2000);
  };

  const handleCopy = async () => {
    try {
        const contentNode = document.getElementById('printable-root');
        if (!contentNode) return;
        
        // Use the Clipboard API if available and secure
        if (navigator.clipboard && navigator.clipboard.write) {
             const type = "text/html";
             // Create a simpler HTML structure for clipboard to avoid Tailwind clutter
             const blob = new Blob([contentNode.outerHTML], { type });
             const data = [new ClipboardItem({ [type]: blob })];
             await navigator.clipboard.write(data);
             setNotification("已复制！可直接粘贴到 Word");
        } else {
             // Fallback for older browsers
             const range = document.createRange();
             range.selectNode(contentNode);
             window.getSelection()?.removeAllRanges();
             window.getSelection()?.addRange(range);
             document.execCommand('copy');
             window.getSelection()?.removeAllRanges();
             setNotification("已复制到剪贴板");
        }
        setTimeout(() => setNotification(null), 2000);
    } catch (e) {
        console.error(e);
        setError("复制失败，请尝试导出 HTML");
    }
  };

  const updateDocField = (field: string, value: any) => {
    setFormattedDoc(prev => ({ ...prev, [field]: value }));
  };

  const updateSection = (index: number, content: any) => {
      setFormattedDoc(prev => {
          const newSections = [...prev.sections];
          newSections[index] = { ...newSections[index], content };
          return { ...prev, sections: newSections };
      });
  };

  const deleteSection = (index: number) => {
      setFormattedDoc(prev => {
          const newSections = prev.sections.filter((_, i) => i !== index);
          return { ...prev, sections: newSections };
      });
  };

  const handleInsertImage = (url: string, alt: string) => {
      const newImageSection: DocumentSection = {
          type: 'image',
          content: url,
          alt: alt
      };

      setFormattedDoc(prev => {
          const newSections = [...prev.sections];
          const insertIndex = activeSectionIndex !== null ? activeSectionIndex + 1 : newSections.length;
          newSections.splice(insertIndex, 0, newImageSection);
          return { ...prev, sections: newSections };
      });
      setIsImageModalOpen(false);
      setNotification("图片已插入");
      setTimeout(() => setNotification(null), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              if (e.target?.result) {
                  handleInsertImage(e.target.result as string, file.name);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden font-sans">
      <ControlPanel 
        currentTheme={theme}
        setTheme={setTheme}
        currentBackground={background}
        setBackground={setBackground}
        isFormatting={isFormatting}
        onInsertImage={() => setIsImageModalOpen(true)}
        onReset={() => {
            if (confirm("确定要清空所有内容吗？")) {
                setFormattedDoc({ title: "新文档", sections: [{ type: 'paragraph', content: "在此输入内容..." }] });
            }
        }}
        onFormat={handleFormat}
        onCopy={handleCopy}
        onExportImage={handleExportImage}
        onExportHtml={handleExportHtml}
        onExportWord={handleExportWord}
        zoom={zoom}
        setZoom={setZoom}
      />

      <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-gray-200/50">
        
        {error && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 print:hidden animate-in slide-in-from-top-4">
                <span className="font-medium">⚠️ {error}</span>
                <button onClick={() => setError(null)} className="hover:bg-red-100 rounded-full p-1 transition-colors">×</button>
            </div>
        )}

        {notification && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 print:hidden animate-in slide-in-from-top-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{notification}</span>
            </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start print:block print:p-0 print:overflow-visible custom-scrollbar">
            <A4Canvas 
              document={formattedDoc}
              theme={theme}
              background={background}
              zoom={zoom}
              onUpdateContent={updateDocField}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
              onSectionFocus={setActiveSectionIndex}
            />
        </div>
      </div>

      {isImageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-indigo-600" />插入图片</h2>
                    <button onClick={() => setIsImageModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">上传本地图片</h3>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">点击上传</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">素材库</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {STOCK_IMAGES.map((img) => (
                                <button key={img.id} onClick={() => handleInsertImage(img.url, img.alt)} className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200 hover:border-indigo-500 transition-all">
                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default App;