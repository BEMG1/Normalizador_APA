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
import { getYear } from "../components/References/ReferencesManager";
import type { ICitationFormatter } from "./citationFormats/types";
import { apa7Formatter } from "./citationFormats/apa7.tsx";

const margin = convertInchesToTwip(1);

// ─── Rich reference paragraph builder for DOCX ────────────────────────────────
// Builds a Paragraph with hanging indent and proper italic runs.
const buildRichReferenceParagraph = (
  ref: Reference,
  formatter: ICitationFormatter,
  index: number,
): Paragraph => {
  const author = ref.author || "[Autor]";
  const year = getYear(ref.year);
  const title = ref.title || "[Título]";

  // IEEE uses a plain numbered run
  if (formatter.sortMode === "appearance") {
    return new Paragraph({
      children: [new TextRun({ text: `[${index}] ${formatter.formatReference(ref)}` })],
      indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
      spacing: { line: 480 },
    });
  }

  // APA (6 or 7): rebuild with italic runs
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
      const journal = ref.journal || "[Revista]";
      const volume = ref.volume || "[Volumen]";
      const issue = ref.issue ? `(${ref.issue})` : "";
      const pages = ref.pages ? `, ${ref.pages}` : "";
      // Derive DOI text from the plain formatter output to respect APA6/7 difference
      let doi = "";
      if (ref.doi) {
        const plain = formatter.formatReference(ref);
        const doiIdx = plain.lastIndexOf(" doi:");
        const urlIdx = plain.lastIndexOf(" https://doi.org/");
        if (doiIdx !== -1) doi = plain.slice(doiIdx);
        else if (urlIdx !== -1) doi = plain.slice(urlIdx);
      }
      elements = [
        new TextRun({ text: `${author} (${year}). ${title}. ` }),
        new TextRun({ text: `${journal}, `, italics: true }),
        new TextRun({ text: volume, italics: true }),
        new TextRun({ text: issue }),
        new TextRun({ text: `${pages}.${doi}` }),
      ];
      break;
    }

    case "website": {
      const plain = formatter.formatReference(ref);
      // Everything after "title." portion
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 2);
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({ text: afterTitle }),
      ];
      break;
    }

    case "video": {
      const plain = formatter.formatReference(ref);
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 1);
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title} `, italics: true }),
        new TextRun({ text: afterTitle }),
      ];
      break;
    }

    default:
      elements = [new TextRun({ text: formatter.formatReference(ref) })];
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

// ─── Main export function ──────────────────────────────────────────────────────

export const exportToDocx = async (
  text: string,
  references: Reference[],
  suggestedName = "File_Normalizate_APA",
  formatter: ICitationFormatter = apa7Formatter,
) => {
  // ── Sort references according to formatter's sort mode ─────────────────────
  let sortedRefs: Reference[];

  if (formatter.sortMode === "appearance") {
    // IEEE: order references by first appearance in document
    const htmlDoc = new DOMParser().parseFromString(text, "text/html");
    const orderedIds: string[] = [];
    const seen = new Set<string>();
    htmlDoc.querySelectorAll("[data-reference-id]").forEach((el) => {
      const id = el.getAttribute("data-reference-id");
      if (id && !seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    });
    const uncited = references.filter((r) => !seen.has(r.id));
    sortedRefs = [
      ...orderedIds.map((id) => references.find((r) => r.id === id)!).filter(Boolean),
      ...uncited,
    ];
  } else {
    sortedRefs = [...references].sort((a, b) =>
      a.author.localeCompare(b.author, "es"),
    );
  }

  // Build lookup: refId → 1-based position (for IEEE [n] citations)
  const refIndexMap = new Map<string, number>(
    sortedRefs.map((ref, i) => [ref.id, i + 1]),
  );

  // ── HTML parsing helpers ───────────────────────────────────────────────────

  interface ParsedRun {
    text: string;
    bold?: boolean;
    italics?: boolean;
    highlighted?: boolean;
  }

  const parseHtmlNode = (node: Node): ParsedRun[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [{ text: node.textContent || "" }];
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const childrenRuns = Array.from(node.childNodes).flatMap(parseHtmlNode);
      if (childrenRuns.length === 0 && !el.textContent) return [];

      let updatedRuns = childrenRuns;
      if (el.tagName === "STRONG" || el.tagName === "B") {
        updatedRuns = updatedRuns.map((r) => ({ ...r, bold: true }));
      }
      if (el.tagName === "EM" || el.tagName === "I") {
        updatedRuns = updatedRuns.map((r) => ({ ...r, italics: true }));
      }
      if (el.tagName === "MARK" || el.hasAttribute("data-reference-id")) {
        const refId = el.getAttribute("data-reference-id");
        const ref = references.find((r) => r.id === refId);
        updatedRuns = updatedRuns.map((r) => ({ ...r, highlighted: true }));
        if (ref) {
          const idx = refIndexMap.get(ref.id);
          const citationText = formatter.formatInTextCitation(ref, idx);
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

    if (tagName === "H1") {
      return new Paragraph({
        children: childrenNodes.map((r) => new TextRun({ text: r.text, bold: true })),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { line: 480 },
      });
    }
    if (tagName === "H2") {
      return new Paragraph({
        children: childrenNodes.map((r) => new TextRun({ text: r.text, bold: true })),
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { line: 480 },
      });
    }
    if (tagName === "H3") {
      return new Paragraph({
        children: childrenNodes.map((r) =>
          new TextRun({ text: r.text, bold: true, italics: true }),
        ),
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.LEFT,
        spacing: { line: 480 },
      });
    }
    if (tagName === "P") {
      return new Paragraph({
        children: childrenNodes.map((r) =>
          new TextRun({ text: r.text, bold: r.bold, italics: r.italics }),
        ),
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: convertInchesToTwip(0.5) },
        spacing: { line: 480 },
      });
    }
    return new Paragraph({
      children: childrenNodes.map((r) =>
        new TextRun({ text: r.text, bold: r.bold, italics: r.italics }),
      ),
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 480 },
    });
  };

  const htmlDoc = new DOMParser().parseFromString(text, "text/html");
  const paragraphs: Paragraph[] = [];
  htmlDoc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const p = parseHtmlBlock(node as Element);
      if (p) paragraphs.push(p);
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: node.textContent.trim() })],
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: convertInchesToTwip(0.5) },
          spacing: { line: 480 },
        }),
      );
    }
  });

  // ── Build DOCX document ────────────────────────────────────────────────────

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
          run: { bold: true, size: 24, color: "000000" },
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
          run: { bold: true, size: 24, color: "000000" },
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
          run: { bold: true, italics: true, size: 24, color: "000000" },
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
            margin: { top: margin, right: margin, bottom: margin, left: margin },
          },
        },
        children: [...paragraphs],
      },
      {
        properties: {
          type: "nextPage",
          page: {
            margin: { top: margin, right: margin, bottom: margin, left: margin },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: formatter.sectionHeading, bold: true }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          ...(sortedRefs.length > 0
            ? sortedRefs.map((ref, i) =>
                buildRichReferenceParagraph(ref, formatter, i + 1),
              )
            : [new Paragraph({ text: "No hay referencias." })]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = suggestedName.endsWith(".docx")
    ? suggestedName
    : `${suggestedName}.docx`;

  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Documento de Word (.docx)",
            accept: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
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
