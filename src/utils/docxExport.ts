import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';
import type { Reference } from '../components/ReferencesManager';

const formatReference = (ref: Reference): Paragraph => {
  const author = ref.author || '[Autor]';
  const year = ref.year || '[Año]';
  const title = ref.title || '[Título]';

  let elements: TextRun[];

  switch (ref.type) {
    case 'book':
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({ text: `${ref.publisher || '[Editorial]'}.` }),
      ];
      break;
    case 'article':
      elements = [
        new TextRun({ text: `${author} (${year}). ${title}. ` }),
        new TextRun({ text: `${ref.journal || '[Revista]'}, `, italics: true }),
        new TextRun({ text: ref.volume ? `${ref.volume}` : '[Volumen]', italics: true }),
        new TextRun({ text: ref.issue ? `(${ref.issue})` : '' }),
        new TextRun({ text: ref.pages ? `, ${ref.pages}.` : '.' }),
      ];
      break;
    case 'website':
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({ text: `${ref.siteName || '[Nombre del Sitio]'}. ${ref.url || '[URL]'}` }),
      ];
      break;
    case 'video':
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title} `, italics: true }),
        new TextRun({ text: `[Video]. ${ref.channel || '[Canal]'}. ${ref.url || '[URL]'}` }),
      ];
      break;
    default:
      elements = [new TextRun({ text: "Referencia incompleta" })];
  }

  return new Paragraph({
    children: elements,
    indent: {
      left: convertInchesToTwip(0.5),
      hanging: convertInchesToTwip(0.5), // APA hanging indent
    },
    spacing: {
      line: 480, // Double spacing
    },
  });
};

export const exportToDocx = async (text: string, references: Reference[]) => {
  // Sort references alphabetically by author
  const sortedRefs = [...references].sort((a, b) => a.author.localeCompare(b.author));

  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim() !== '').map(p => {
    return new Paragraph({
      children: [new TextRun({ text: p })],
      indent: {
        firstLine: convertInchesToTwip(0.5), // APA first line indent
      },
      spacing: {
        line: 480, // Double spacing
      },
    });
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24, // 12pt (half-points)
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          ...paragraphs,
        ],
      },
      {
        properties: {
          type: "nextPage", // Start references on a new page
        },
        children: [
          new Paragraph({
            text: "Referencias",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 240, // Space after heading
            },
            // APA Heading 1: Centered, Bold
            // Note: Heading styles might need more explicit setup in `doc.styles` if they don't inherit correctly,
            // but we can also inline it if needed. For now, relying on default H1 with center alignment.
          }),
          ...(sortedRefs.length > 0 
            ? sortedRefs.map(formatReference)
            : [new Paragraph({ text: "No hay referencias." })]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Documento_APA.docx");
};
