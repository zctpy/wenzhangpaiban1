import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormattedDocument } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "文档主标题" },
    subtitle: { type: Type.STRING, description: "副标题 (可选)" },
    author: { type: Type.STRING, description: "作者/日期 (可选)" },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            enum: ["heading", "subheading", "paragraph", "bullet_list", "numbered_list", "quote"] 
          },
          content: { 
            type: Type.STRING, 
            description: "段落内容。如果是列表，请用竖线 '|' 分隔每一项，例如 '第一项|第二项'。" 
          }
        },
        required: ["type", "content"]
      }
    }
  },
  required: ["title", "sections"]
};

export const formatTextWithGemini = async (rawText: string, themeId: string): Promise<FormattedDocument> => {
  try {
    // Note: themeId is passed but generally we use a standard rigorous formatter 
    // to ensure best content structure regardless of visual theme.
    
    const prompt = `
      角色：专业文档编辑与排版专家。
      任务：将输入的文本整理成一篇结构清晰、标点正确、排版美观的文档。
      
      输入文本：
      ${rawText}

      排版要求：
      1. **纠正标点**：修正文中不规范的标点符号，确保符合中文出版规范（如全角标点）。
      2. **层级梳理**：识别并提取一级标题(heading)、二级标题(subheading)。
      3. **段落重组**：将过长的段落合理拆分，将零散的句子合并为段落(paragraph)。
      4. **列表识别**：如果内容包含步骤、清单或要点，请务必转换为列表(bullet_list 或 numbered_list)。
      5. **重点突出**：如果由名言或重要引用，使用引用块(quote)。
      6. **保持原意**：不要删减核心内容，仅做润色和结构化处理。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);
    
    // Post-process sections
    const sections = parsed.sections.map((section: any) => {
        // Handle Lists (pipe separated)
        if ((section.type === 'bullet_list' || section.type === 'numbered_list') && typeof section.content === 'string') {
           if (section.content.includes('|')) {
             return { ...section, content: section.content.split('|').map((s: string) => s.trim()) };
           }
           // Fallback if model didn't use pipe
           return { ...section, content: [section.content] };
        }
        return section;
    });

    return { ...parsed, sections };

  } catch (error) {
    console.error("Gemini formatting error:", error);
    throw error;
  }
};