import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, UnderlineType, BorderStyle } from 'docx';
// Fix: Use default import for file-saver
import FileSaver from 'file-saver';
import { FormattedDocument, Theme } from '../types';

export const exportToDocx = async (doc: FormattedDocument, theme: Theme) => {
  const children: any[] = [];

  // 1. Title (Increased size)
  if (doc.title) {
    children.push(
      new Paragraph({
        text: doc.title,
        heading: HeadingLevel.HEADING_1,
        alignment: theme.headingStyle === 'centered-line' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 600, before: 400 },
        run: {
          size: 64, // 32pt * 2
          bold: true,
          color: theme.exportColors.primary,
          font: "SimSun" 
        }
      })
    );
  }

  // 2. Subtitle
  if (doc.subtitle) {
    children.push(
      new Paragraph({
        text: doc.subtitle,
        alignment: theme.headingStyle === 'centered-line' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 400 },
        run: {
          size: 40, // 20pt * 2
          italics: true,
          color: theme.exportColors.secondary,
          font: "FangSong"
        }
      })
    );
  }

  // 3. Author
  if (doc.author) {
    children.push(
      new Paragraph({
        text: doc.author,
        alignment: theme.headingStyle === 'centered-line' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 600 },
        run: {
          size: 28, // 14pt * 2
          color: "666666",
          font: "SimHei"
        }
      })
    );
  }

  // Helper to fetch images
  const urlToArrayBuffer = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await blob.arrayBuffer();
    } catch (e) {
      console.error("Image fetch failed", e);
      return null;
    }
  };

  // 4. Sections
  for (const section of doc.sections) {
    const type = section.type.toLowerCase();
    
    if (type === 'heading') {
      let border = undefined;
      if (theme.headingStyle === 'underlined') {
        border = { bottom: { color: theme.exportColors.accent, space: 1, value: BorderStyle.SINGLE, size: 6 } };
      }
      
      children.push(
        new Paragraph({
          text: section.content as string,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.LEFT,
          spacing: { before: 400, after: 300 },
          border: border,
          run: {
            size: 44, // 22pt * 2
            bold: true,
            color: theme.exportColors.primary,
            font: "SimHei"
          }
        })
      );
    } else if (type === 'subheading') {
       children.push(
        new Paragraph({
          text: section.content as string,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 200 },
          run: {
            size: 36, // 18pt * 2
            bold: true,
            color: theme.exportColors.primary,
            font: "SimHei"
          }
        })
      );
    } else if (type === 'paragraph') {
      children.push(
        new Paragraph({
          text: section.content as string,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360, after: 300 }, // 1.5 line height, extra after space
          run: {
            size: 32, // 16pt * 2 (Standard per request)
            color: theme.exportColors.secondary,
            font: theme.id === 'official' ? "FangSong" : "SimSun"
          }
        })
      );
    } else if (type === 'bullet_list' || type === 'numbered_list') {
      const items = Array.isArray(section.content) ? section.content : [section.content as string];
      items.forEach((item) => {
        children.push(
          new Paragraph({
            text: item,
            bullet: {
              level: 0
            },
            spacing: { line: 360, after: 150 },
             run: {
              size: 32, // 16pt * 2
              color: theme.exportColors.secondary,
              font: "SimSun"
            }
          })
        );
      });
    } else if (type === 'quote') {
       children.push(
        new Paragraph({
          text: section.content as string,
          indent: { left: 720 }, // 0.5 inch
          spacing: { before: 300, after: 300 },
          run: {
            italics: true,
            size: 32,
            color: theme.exportColors.accent,
            font: "KaiTi"
          }
        })
      );
    } else if (type === 'image') {
        const buffer = await urlToArrayBuffer(section.content as string);
        if (buffer) {
            children.push(
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: buffer,
                            transformation: {
                                width: 500,
                                height: 300, 
                            },
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 }
                })
            );
        }
    }
  }

  const docx = new Document({
    sections: [
      {
        properties: {
             page: {
                margin: {
                    top: 1440, // 1 inch
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                },
            },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(docx);
  FileSaver.saveAs(blob, `${doc.title || 'SmartDoc'}.docx`);
};