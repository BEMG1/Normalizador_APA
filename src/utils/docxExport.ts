import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";
import type { Reference } from "../components/References/ReferencesManager";
import {
  getYear,
  getReferenceText,
} from "../components/References/ReferencesManager";

const margin = convertInchesToTwip(1);

const formatReference = (ref: Reference): Paragraph => {
  const author = ref.author || "[Autor]";
  const year = getYear(ref.year);
  const title = ref.title || "[Título]";

  let elements: TextRun[];

  switch (ref.type) {
    case "book":
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({ text: `${ref.publisher || "[Editorial]"}.` }),
      ];
      break;
    case "article": {
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : "";
      elements = [
        new TextRun({ text: `${author} (${year}). ${title}. ` }),
        new TextRun({ text: `${ref.journal || "[Revista]"}, `, italics: true }),
        new TextRun({
          text: ref.volume ? `${ref.volume}` : "[Volumen]",
          italics: true,
        }),
        new TextRun({ text: ref.issue ? `(${ref.issue})` : "" }),
        new TextRun({ text: ref.pages ? `, ${ref.pages}.${doi}` : `.${doi}` }),
      ];
      break;
    }
    case "website":
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({
          text: `${ref.siteName || "[Nombre del Sitio]"}. ${ref.url || "[URL]"}`,
        }),
      ];
      break;
    case "video":
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title} `, italics: true }),
        new TextRun({
          text: `[Video]. ${ref.channel || "[Canal]"}. ${ref.url || "[URL]"}`,
        }),
      ];
      break;
    default:
      elements = [new TextRun({ text: getReferenceText(ref) })];
  }

  return new Paragraph({
    children: elements,
    indent: {
      left: convertInchesToTwip(0.5),
      hanging: convertInchesToTwip(0.5),
    },
    spacing: { line: 480 },
  });
};

export const exportToDocx = async (
  text: string,
  references: Reference[],
  suggestedName = "File_Normalizate_APA",
) => {
  const sortedRefs = [...references].sort((a, b) =>
    a.author.localeCompare(b.author, "es"),
  );

  interface ParsedRun {
    text: string;
    bold?: boolean;
    italics?: boolean;
    highlighted?: boolean;
  }

  const getInTextCitation = (ref: Reference): string => {
    if (!ref) return "";
    const authorStr = ref.author?.trim() || "Autor desconocido";
    const year = getYear(ref.year);

    const formatSingleAuthor = (name: string): string => {
      const parts = name.split(',');
      if (parts.length > 1) {
        return parts[0].trim();
      }
      return name.trim();
    };

    const authors = authorStr.split(/;| & | and | y /i).map(a => a.trim()).filter(Boolean);
    let formattedAuthors = "";
    if (authors.length === 1) {
      formattedAuthors = formatSingleAuthor(authors[0]);
    } else if (authors.length === 2) {
      formattedAuthors = `${formatSingleAuthor(authors[0])} & ${formatSingleAuthor(authors[1])}`;
    } else if (authors.length >= 3) {
      formattedAuthors = `${formatSingleAuthor(authors[0])} et al.`;
    } else {
      formattedAuthors = authorStr;
    }

    return ` (${formattedAuthors}, ${year})`;
  };

  const parseHtmlNode = (node: Node): ParsedRun[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [{ text: node.textContent || "" }];
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      // Recurse for nested elements (like strong inside mark)
      const childrenRuns = Array.from(node.childNodes).flatMap(parseHtmlNode);
      if (childrenRuns.length === 0 && !el.textContent) return [];

      let updatedRuns = childrenRuns;
      if (el.tagName === 'STRONG' || el.tagName === 'B') {
        updatedRuns = updatedRuns.map(r => ({ ...r, bold: true }));
      }
      if (el.tagName === 'EM' || el.tagName === 'I') {
        updatedRuns = updatedRuns.map(r => ({ ...r, italics: true }));
      }
      if (el.tagName === 'MARK' || el.hasAttribute('data-reference-id')) {
        const refId = el.getAttribute('data-reference-id');
        const ref = references.find(r => r.id === refId);
        updatedRuns = updatedRuns.map(r => ({ ...r, highlighted: true }));
        if (ref) {
          const citationText = getInTextCitation(ref);
          if (citationText) {
            updatedRuns.push({ text: citationText, highlighted: false });
          }
        }
      }
      return updatedRuns;
    }
    return [];
  };

  const parseHtmlBlock = (element: Element): Paragraph | null => {
    const tagName = element.tagName.toUpperCase();
    const childrenNodes = Array.from(element.childNodes).flatMap(parseHtmlNode);
    
    if (childrenNodes.length === 0) return null;

    if (tagName === 'H1') {
      return new Paragraph({
        children: childrenNodes.map(r => new TextRun({
          text: r.text,
          bold: true,          
        })),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { line: 480 },
      });
    }
    if (tagName === 'H2') {
      return new Paragraph({
        children: childrenNodes.map(r => new TextRun({
          text: r.text,
          bold: true,          
        })),
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { line: 480 },
      });
    }
    if (tagName === 'H3') {
      return new Paragraph({
        children: childrenNodes.map(r => new TextRun({
          text: r.text,
          bold: true,
          italics: true,
        })),
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.LEFT,
        spacing: { line: 480 },
      });
    }
    if (tagName === 'P') {
      return new Paragraph({
        children: childrenNodes.map(r => new TextRun({
          text: r.text,
          bold: r.bold,
          italics: r.italics,          
        })),
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: convertInchesToTwip(0.5) },
        spacing: { line: 480 },
      });
    }
    return new Paragraph({
      children: childrenNodes.map(r => new TextRun({
        text: r.text,
        bold: r.bold,
        italics: r.italics,        
      })),
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 480 },
    });
  };

  const htmlDoc = new DOMParser().parseFromString(text, 'text/html');
  const paragraphs: Paragraph[] = [];
  htmlDoc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const p = parseHtmlBlock(node as Element);
      if (p) paragraphs.push(p);
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: node.textContent.trim() })],
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: convertInchesToTwip(0.5) },
        spacing: { line: 480 },
      }));
    }
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24,
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            bold: true,
            size: 24,
            color: "000000",
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240, line: 480 },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            bold: true,
            size: 24,
            color: "000000",
          },
          paragraph: {
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 240, line: 480 },
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            bold: true,
            italics: true,
            size: 24,
            color: "000000",
          },
          paragraph: {
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 240, line: 480 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: margin,
              right: margin,
              bottom: margin,
              left: margin,
            },
          },
        },
        children: [...paragraphs],
      },
      {
        properties: {
          type: "nextPage",
          page: {
            margin: {
              top: margin,
              right: margin,
              bottom: margin,
              left: margin,
            },
          },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Referencias", bold: true })],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          ...(sortedRefs.length > 0
            ? sortedRefs.map(formatReference)
            : [new Paragraph({ text: "No hay referencias." })]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  const filename = suggestedName.endsWith(".docx") ? suggestedName : `${suggestedName}.docx`;

  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Documento de Word (.docx)",
            accept: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("El usuario canceló la exportación.");
        return;
      }
      console.warn("showSaveFilePicker falló, usando fallback saveAs:", err);
    }
  }

  saveAs(blob, filename);
};
