import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormattedDocument, RefineMode } from '../types';

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
            description: "段落内容。如果是列表，请用竖线 '|' 分隔每一项。" 
          }
        },
        required: ["type", "content"]
      }
    }
  },
  required: ["title", "sections"]
};

export const formatTextWithGemini = async (rawText: string, themeId: string, mode: RefineMode = 'format-strict'): Promise<FormattedDocument> => {
  try {
    let systemInstruction = "";

    switch (mode) {
      case 'format-strict':
        systemInstruction = `
          角色：严格的文档排版员。
          任务：将输入的文本整理成结构化的 JSON 数据。
          
          *** 核心原则 (必须严格遵守) ***
          1. **严禁修改原文**：绝对不要修改、增加或删除原文的任何字词、标点符号。保持原文的原汁原味。
          2. **仅做结构化**：你的工作只是识别哪些是标题，哪些是段落，哪些是列表。
          
          排版规则：
          1. **层级识别**：根据上下文识别一级标题(heading)和二级标题(subheading)。
          2. **段落分割**：将文本按自然段落(paragraph)分开。
          3. **列表识别**：仅当原文明显是列表格式（如带序号或项目符号）时，才转换为列表(bullet_list/numbered_list)。
          4. **引用识别**：仅当原文明显是引用或名言时，使用引用块(quote)。
        `;
        break;
      
      case 'polish':
        systemInstruction = `
          角色：专业资深编辑。
          任务：对输入文本进行专业润色，使其更加流畅、优雅、专业。
          
          要求：
          1. 提升文采，优化词汇，修正语病。
          2. 保持原意不变，不要随意发挥。
          3. 输出为结构化的 JSON 格式。
        `;
        break;

      case 'expand':
        systemInstruction = `
          角色：创意写作助手。
          任务：对输入文本进行适当扩写，丰富细节，增加深度。
          
          要求：
          1. 补充背景信息、细节描述或逻辑论证。
          2. 保持文章原有的主题和基调。
          3. 输出为结构化的 JSON 格式。
        `;
        break;

      case 'shorten':
        systemInstruction = `
          角色：摘要专家。
          任务：精简文本，保留核心观点，去除冗余信息。
          
          要求：
          1. 语言简练，逻辑清晰。
          2. 篇幅缩减约 30%-50%。
          3. 输出为结构化的 JSON 格式。
        `;
        break;

      case 'fix':
        systemInstruction = `
          角色：校对专家。
          任务：仅纠正文本中的错别字、标点错误和明显的语法错误。
          
          要求：
          1. 严禁改写句子结构，仅做最小幅度的修正。
          2. 输出为结构化的 JSON 格式。
        `;
        break;
    }

    const prompt = `
      ${systemInstruction}
      
      待处理文本：
      ${rawText}
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
    
    // Robust Post-processing
    const sections = parsed.sections.map((section: any) => {
        const type = (section.type || 'paragraph').toLowerCase();
        let content = section.content;

        if ((type === 'bullet_list' || type === 'numbered_list')) {
           if (typeof content === 'string') {
               if (content.includes('|')) {
                   content = content.split('|').map((s: string) => s.trim());
               } else {
                   content = [content];
               }
           }
        } else {
            if (Array.isArray(content)) content = content.join(' ');
            if (typeof content !== 'string') content = String(content || '');
        }
        
        return { ...section, type, content };
    });

    return { ...parsed, sections };

  } catch (error) {
    console.error("Gemini formatting error:", error);
    throw error;
  }
};