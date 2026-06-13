import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Reference } from './referenceUtils';
import { getYear } from './referenceUtils';
import type { ICitationFormatter } from './citationFormats/types';
import type { CoverPage } from '../interfaces/ICoverPage';
import { es, en } from '../i18n';
import React from 'react';

const tText = (key: keyof typeof es, lang?: string): string =>
  ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

// APA 7 uses 12pt Times New Roman, 1-inch margins, double-spaced
// In @react-pdf/renderer, units are in points (pt). 1in = 72pt.
const MARGIN = 72;    // 1 inch
const FONT_SIZE = 12;
const LINE_HEIGHT = 2;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  // Page number in top right
  pageNumber: {
    position: 'absolute',
    top: 36, // 0.5 inch from top
    right: MARGIN,
    fontSize: FONT_SIZE,
    fontFamily: 'Times-Roman',
    color: '#000000',
  },
  // Cover page styles
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitle: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    color: '#000000',
  },
  coverText: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  // Document body
  docTitle: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  h1: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  h2: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    marginTop: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  h3: {
    fontFamily: 'Times-BoldItalic',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    marginTop: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  paragraph: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'justify',
    marginBottom: 0,
    lineHeight: LINE_HEIGHT,
    textIndent: 36, // 0.5 inch first-line indent
    color: '#000000',
  },
  // Reference page
  referencesHeading: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  referenceItem: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    // Hanging indent: paddingLeft + negative textIndent to simulate
    paddingLeft: 36,
    textIndent: -36,
    color: '#000000',
  },
  referenceItemIEEE: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    paddingLeft: 36,
    textIndent: -36,
    color: '#000000',
  },
});

// ─── Helpers para parsear nodos HTML ──────────────────────────────────────────

interface ParsedRun {
  text: string;
  bold?: boolean;
  italics?: boolean;
}

const parseHtmlNodeForPdf = (
  node: Node,
  references: Reference[],
  formatter: ICitationFormatter,
  refIndexMap: Map<string, number>,
  lang?: string,
): ParsedRun[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const txt = node.textContent || '';
    if (!txt) return [];
    return [{ text: txt }];
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const childRuns = Array.from(node.childNodes).flatMap((child) =>
      parseHtmlNodeForPdf(child, references, formatter, refIndexMap, lang)
    );
    if (childRuns.length === 0 && !el.textContent) return [];

    let runs = childRuns;
    if (el.tagName === 'STRONG' || el.tagName === 'B') {
      runs = runs.map((r) => ({ ...r, bold: true }));
    }
    if (el.tagName === 'EM' || el.tagName === 'I') {
      runs = runs.map((r) => ({ ...r, italics: true }));
    }
    if (el.tagName === 'MARK' || el.hasAttribute('data-reference-id')) {
      const refId = el.getAttribute('data-reference-id');
      const ref = references.find((r) => r.id === refId);
      if (ref) {
        const idx = refIndexMap.get(ref.id);
        const citationText = formatter.formatInTextCitation(ref, idx, lang);
        if (citationText) {
          runs.push({ text: citationText });
        }
      }
    }
    return runs;
  }
  return [];
};

// Renders inline runs with mixed bold/italic into nested Text elements
const renderInlineRuns = (runs: ParsedRun[]): React.ReactNode => {
  return runs.map((run, i) => {
    let family = 'Times-Roman';
    if (run.bold && run.italics) family = 'Times-BoldItalic';
    else if (run.bold) family = 'Times-Bold';
    else if (run.italics) family = 'Times-Italic';
    return (
      <Text key={i} style={{ fontFamily: family, color: '#000000' }}>
        {run.text}
      </Text>
    );
  });
};

// ─── Build APA reference text with italic spans ───────────────────────────────

const buildReferenceRuns = (
  ref: Reference,
  formatter: ICitationFormatter,
  index: number,
  lang?: string,
): ParsedRun[] => {
  const author = ref.author || tText('unknownAuthor', lang);
  const year = getYear(ref.year, lang);
  const title = ref.title || tText('unknownTitle', lang);

  if (formatter.sortMode === 'appearance') {
    return [{ text: `[${index}] ${formatter.formatReference(ref, lang)}` }];
  }

  switch (ref.type) {
    case 'book':
      return [
        { text: `${author} (${year}). ` },
        { text: `${title}. `, italics: true },
        { text: `${ref.publisher || `[${tText('publisher', lang)}]`}.` },
      ];

    case 'article': {
      const journal = ref.journal || `[${tText('journalName', lang)}]`;
      const volume = ref.volume || `[${tText('volume', lang)}]`;
      const issue = ref.issue ? `(${ref.issue})` : '';
      const pages = ref.pages ? `, ${ref.pages}` : '';
      let doi = '';
      if (ref.doi) {
        const plain = formatter.formatReference(ref, lang);
        const doiIdx = plain.lastIndexOf(' doi:');
        const urlIdx = plain.lastIndexOf(' https://doi.org/');
        if (doiIdx !== -1) doi = plain.slice(doiIdx);
        else if (urlIdx !== -1) doi = plain.slice(urlIdx);
      }
      return [
        { text: `${author} (${year}). ${title}. ` },
        { text: `${journal}, `, italics: true },
        { text: `${volume}`, italics: true },
        { text: `${issue}${pages}.${doi}` },
      ];
    }

    case 'website': {
      const plain = formatter.formatReference(ref, lang);
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 2);
      return [
        { text: `${author} (${year}). ` },
        { text: `${title}. `, italics: true },
        { text: afterTitle },
      ];
    }

    case 'video': {
      const plain = formatter.formatReference(ref, lang);
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 1);
      return [
        { text: `${author} (${year}). ` },
        { text: `${title} `, italics: true },
        { text: afterTitle },
      ];
    }

    default:
      return [{ text: formatter.formatReference(ref, lang) }];
  }
};

// ─── Build the React PDF Document ─────────────────────────────────────────────

const buildPdfDocument = (
  text: string,
  references: Reference[],
  formatter: ICitationFormatter,
  lang?: string,
  coverPage?: CoverPage,
): React.ReactElement<any> => {
  const isIEEE = formatter.sortMode === 'appearance';

  // Sort references
  const htmlDoc = new DOMParser().parseFromString(text, 'text/html');
  const orderedIds: string[] = [];
  const seen = new Set<string>();
  htmlDoc.querySelectorAll('[data-reference-id]').forEach((el) => {
    const id = el.getAttribute('data-reference-id');
    if (id && !seen.has(id)) { seen.add(id); orderedIds.push(id); }
  });
  const uncited = references.filter((r) => !seen.has(r.id));
  const sortedRefs = isIEEE
    ? [...orderedIds.map((id) => references.find((r) => r.id === id)!).filter(Boolean), ...uncited]
    : [...references].sort((a, b) => a.author.localeCompare(b.author, 'es'));

  const refIndexMap = new Map<string, number>(sortedRefs.map((r, i) => [r.id, i + 1]));

  // Parse body blocks
  const bodyBlocks: React.ReactElement[] = [];
  htmlDoc.body.childNodes.forEach((node, idx) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toUpperCase();
    const runs = Array.from(el.childNodes).flatMap((child) =>
      parseHtmlNodeForPdf(child, references, formatter, refIndexMap, lang)
    );
    if (runs.length === 0 && !el.textContent?.trim()) return;

    if (tag === 'H1') {
      bodyBlocks.push(<Text key={idx} style={styles.h1}>{renderInlineRuns(runs)}</Text>);
    } else if (tag === 'H2') {
      bodyBlocks.push(<Text key={idx} style={styles.h2}>{renderInlineRuns(runs)}</Text>);
    } else if (tag === 'H3') {
      bodyBlocks.push(<Text key={idx} style={styles.h3}>{renderInlineRuns(runs)}</Text>);
    } else {
      bodyBlocks.push(<Text key={idx} style={styles.paragraph}>{renderInlineRuns(runs)}</Text>);
    }
  });

  // References page
  const refsElements: React.ReactElement[] = sortedRefs.map((ref, i) => {
    const runs = buildReferenceRuns(ref, formatter, i + 1, lang);
    return (
      <Text key={ref.id} style={isIEEE ? styles.referenceItemIEEE : styles.referenceItem}>
        {renderInlineRuns(runs)}
      </Text>
    );
  });

  return (
    <Document>
      {/* ── Cover Page ── */}
      {coverPage?.enabled && (
        <Page size="LETTER" style={[styles.page, styles.coverPage]}>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }: { pageNumber: number }) => String(pageNumber)}
            fixed
          />
          <View style={{ marginTop: 150, alignItems: 'center' }}>
            <Text style={styles.coverTitle}>{coverPage.title}</Text>
            {coverPage.subtitle && <Text style={styles.coverText}>{coverPage.subtitle}</Text>}
            <Text style={{ ...styles.coverText, marginTop: 24 }}>{coverPage.authors}</Text>
            {coverPage.institution && <Text style={styles.coverText}>{coverPage.institution}</Text>}
            {coverPage.faculty && <Text style={styles.coverText}>{coverPage.faculty}</Text>}
            {coverPage.course && <Text style={{ ...styles.coverText, marginTop: 12 }}>{coverPage.course}</Text>}
            {coverPage.teacher && <Text style={styles.coverText}>{coverPage.teacher}</Text>}
            {(coverPage.city || coverPage.date) && (
              <Text style={{ ...styles.coverText, marginTop: 12 }}>
                {coverPage.city && coverPage.date
                  ? `${coverPage.city}, ${coverPage.date}`
                  : coverPage.city || coverPage.date}
              </Text>
            )}
          </View>
        </Page>
      )}

      {/* ── Body Page(s) ── */}
      <Page size="LETTER" style={styles.page}>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }: { pageNumber: number }) => String(pageNumber)}
          fixed
        />
        {/* APA 7: repeat document title at top of first body page */}
        {!isIEEE && coverPage?.enabled && coverPage.title && (
          <Text style={styles.docTitle}>{coverPage.title}</Text>
        )}
        {bodyBlocks}
      </Page>

      {/* ── References Page ── */}
      <Page size="LETTER" style={styles.page} break>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber }: { pageNumber: number }) => String(pageNumber)}
          fixed
        />
        <Text style={styles.referencesHeading}>{formatter.sectionHeading(lang)}</Text>
        {refsElements.length > 0
          ? refsElements
          : <Text style={styles.referenceItem}>{tText('noReferences', lang)}</Text>
        }
      </Page>
    </Document>
  );
};

// ─── Main export function ──────────────────────────────────────────────────────

export const exportToPdf = async (
  text: string,
  references: Reference[],
  suggestedName = 'Document_Citara',
  formatter: ICitationFormatter,
  lang?: string,
  coverPage?: CoverPage,
) => {
  try {
    const docElement = buildPdfDocument(text, references, formatter, lang, coverPage);
    const pdfInstance = pdf(docElement);
    const blob = await pdfInstance.toBlob();

    const filename = suggestedName.endsWith('.pdf') ? suggestedName : `${suggestedName}.pdf`;

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Documento PDF (.pdf)',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('showSaveFilePicker falló, usando fallback:', err);
      }
    }

    // Fallback: trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Error al generar el PDF. Por favor intenta nuevamente.');
  }
};
