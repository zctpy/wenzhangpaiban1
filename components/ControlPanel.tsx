import React, { useState, useEffect, useRef } from 'react';
import { THEMES, BACKGROUNDS } from '../constants';
import { Theme, Background } from '../types';
import { Wand2, LayoutTemplate, Palette, ChevronDown, ZoomIn, ZoomOut, Image as ImageIcon, RotateCcw, Download, FileCode, Copy, ImageDown } from 'lucide-react';

interface ControlPanelProps {
  currentTheme: Theme;
  setTheme: (t: Theme) => void;
  currentBackground: Background;
  setBackground: (b: Background) => void;
  isFormatting: boolean;
  onInsertImage: () => void;
  onReset: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onExport: () => void;
  onExportImage: () => void;
  onExportHtml: () => void;
  zoom: number;
  setZoom: (z: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentTheme, setTheme,
  currentBackground, setBackground,
  isFormatting, onInsertImage,
  onReset,
  onFormat, onCopy, onExport, onExportImage, onExportHtml,
  zoom, setZoom
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'theme' | 'background' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(0.3, zoom + delta), 1.5);
    setZoom(parseFloat(newZoom.toFixed(1)));
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-6 z-40 print:hidden relative shrink-0" ref={dropdownRef}>
      {/* LEFT: Branding & Style Selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm hidden md:block">
            <Copy className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden lg:block">SmartDoc</h1>
        </div>

        <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>

        <div className="flex items-center gap-2">
            {/* Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'theme' ? null : 'theme')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border
                  ${activeDropdown === 'theme' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-transparent hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                <span className="hidden md:inline">{currentTheme.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'theme' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'theme' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">排版风格</div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between group transition-colors
                        ${currentTheme.id === theme.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span>{theme.name}</span>
                      {currentTheme.id === theme.id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Background Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'background' ? null : 'background')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border
                  ${activeDropdown === 'background' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-transparent hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <Palette className="w-4 h-4" />
                <span className="hidden md:inline">{currentBackground.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'background' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'background' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 grid grid-cols-2 gap-2">
                   {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setBackground(bg);
                        setActiveDropdown(null);
                      }}
                      className={`relative h-16 rounded-lg border transition-all overflow-hidden group
                        ${currentBackground.id === bg.id 
                          ? 'border-indigo-600 ring-1 ring-indigo-600' 
                          : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                       <div className="absolute inset-0" style={bg.style}>
                          <div className={`w-full h-full ${bg.className}`} />
                       </div>
                       <div className="absolute inset-x-0 bottom-0 bg-white/90 text-[10px] text-center py-1 font-medium">
                          {bg.name}
                       </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* RIGHT: Tools & Actions */}
      <div className="flex items-center gap-3">
        
        {/* Group 1: Zoom */}
        <div className="hidden xl:flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-mono w-10 text-center text-gray-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-white rounded-md transition-all text-gray-600"><ZoomIn className="w-4 h-4" /></button>
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

        {/* Group 2: Tools (Reset, Image) */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onReset}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors"
            title="清空画布"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={onInsertImage}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors"
            title="插入图片"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
        
        {/* Group 3: Primary Actions */}
        <div className="flex items-center gap-2">
             <button 
                onClick={onCopy}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 hover:text-green-600 border border-gray-200 rounded-lg font-medium text-sm transition-colors"
                title="一键复制到 Word"
            >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">复制</span>
            </button>

            <button 
                onClick={onFormat}
                disabled={isFormatting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm border
                ${isFormatting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 shadow-indigo-200'
                }`}
            >
                <Wand2 className={`w-4 h-4 ${isFormatting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isFormatting ? '排版中...' : '智能排版'}</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

             <button 
                onClick={onExportHtml}
                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-orange-600 border border-gray-200 rounded-lg transition-colors"
                title="导出网页 HTML"
            >
                <FileCode className="w-4 h-4" />
            </button>

            <button 
                onClick={onExportImage}
                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 border border-gray-200 rounded-lg transition-colors"
                title="导出为图片"
            >
                <ImageDown className="w-4 h-4" />
            </button>

            <button 
                onClick={onExport}
                className="p-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 border border-gray-200 rounded-lg transition-colors"
                title="导出 PDF / 打印"
            >
                <Download className="w-4 h-4" />
            </button>
        </div>

      </div>
    </header>
  );
};

export default ControlPanel;