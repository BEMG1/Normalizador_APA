// ─── Cover Page data structure ────────────────────────────────────────────────

/**
 * Holds all metadata needed to render an academic cover page.
 * Optional fields are hidden/shown according to the active citation format.
 */
export interface CoverPage {
  /** Whether to include a cover page in the exported document */
  enabled: boolean;
  /** Main title of the document */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Author name(s), comma-separated for multiple */
  authors: string;
  /** Name of the institution / university */
  institution: string;
  /** Faculty, school or department (APA) */
  faculty?: string;
  /** Course or subject name (APA) */
  course?: string;
  /** Teacher / professor name (APA) */
  teacher?: string;
  /** City where the document is submitted */
  city?: string;
  /** Date as free text, e.g. "Junio 2025" */
  date: string;
  /** Base64 string of the institutional logo */
  logo?: string | null;
}

// ─── Context interface ─────────────────────────────────────────────────────────

export interface ICoverPage {
  coverPage: CoverPage;
  updateField: <K extends keyof CoverPage>(field: K, value: CoverPage[K]) => void;
  resetCoverPage: () => void;
}
