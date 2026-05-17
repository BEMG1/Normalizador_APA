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

  const parseLine = (line: string): Paragraph => {
    if (line.startsWith("### ")) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(4), bold: true })],
        heading: HeadingLevel.HEADING_3,
        spacing: { line: 480 },
      });
    }
    if (line.startsWith("## ")) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(3), bold: true })],
        heading: HeadingLevel.HEADING_2,
        spacing: { line: 480 },
      });
    }
    if (line.startsWith("# ")) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(2), bold: true })],
        heading: HeadingLevel.HEADING_1,
        spacing: { line: 480 },
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: line })],
      indent: { firstLine: convertInchesToTwip(0.5) },
      spacing: { line: 480 },
    });
  };

  const paragraphs = text
    .split("\n")
    .filter((p) => p.trim() !== "")
    .map(parseLine);

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
