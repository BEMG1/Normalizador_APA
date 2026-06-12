export type Language = 'es' | 'en';

export interface TranslationDictionary {
  // Common
  cancel: string;
  save: string;
  delete: string;
  copy: string;
  warning: string;
  copied: string;

  // Header / UI
  appTitle: string;
  appSubtitle: string;
  themeToggleLight: string;
  themeToggleDark: string;
  languageToggle: string;

  // Formatting Selection
  formatSelectorTitle: string;
  formatSelectorSubtitle: string;
  formatAPA7: string;
  formatAPA7Desc: string;
  formatAPA6: string;
  formatAPA6Desc: string;
  formatIEEE: string;
  formatIEEEDesc: string;

  // References Manager
  addReference: string;
  noReferences: string;
  noReferencesHint: string;
  sortAZ: string;
  sortAZTooltip: string;
  showingExportOrder: string;
  newReference: string;
  incompleteRef: string;
  copyRefTooltip: string;
  deleteRefTooltip: string;

  // Reference Fields
  sourceType: string;
  typeBook: string;
  typeArticle: string;
  typeWebsite: string;
  typeVideo: string;
  
  authors: string;
  authorsHint: string;
  authorsPlaceholder: string;
  year: string;
  yearPlaceholder: string;
  yearErrorFormat: string;
  yearErrorFuture: string;
  title: string;
  titlePlaceholder: string;
  publisher: string;
  publisherPlaceholder: string;
  journalName: string;
  journalPlaceholder: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  doiHint: string;
  url: string;
  siteName: string;
  siteNamePlaceholder: string;
  channelName: string;
  channelPlaceholder: string;

  preview: string;

  // Document Editor
  documentTitle: string;
  documentSubtitle: string;
  exportWord: string;
  exportBtn: string;
  exportDocument: string;
  exportDocxTitle: string;
  exportDocxDesc: string;
  exportPdfTitle: string;
  exportPdfDesc: string;
  copyText: string;
  placeholderText: string;

  // Export Warning Modal
  warningTitle: string;
  warningMessage: string;
  exportAnyway: string;
  reviewReferences: string;

  // Document Editor Tooltips and UI
  associatedSource: string;
  linkedReference: string;
  removeLink: string;
  associateReference: string;
  availableSources: string;
  noReferencesCreated: string;
  addSourcesFromPanel: string;
  noAuthor: string;
  noTitle: string;
  onlyDocxAllowed: string;
  errorReadingWord: string;
  uploadDocx: string;
  loading: string;
  orDragDrop: string;
  clearDocumentPrompt: string;
  clearDocument: string;
  dropDocxHere: string;
  heading1: string;
  heading2: string;
  heading3: string;
  paragraph: string;

  // Cover Page
  coverPageToggle: string;
  coverPageTooltip: string;
  studentName: string;
  institutionalAffiliation: string;
  courseName: string;
  instructorName: string;
  dueDate: string;

  // Cover Page (New Features)
  coverPageTab: string;
  coverDocTitle: string;
  coverDocTitlePlaceholder: string;
  coverSubtitle: string;
  coverSubtitlePlaceholder: string;
  coverAuthors: string;
  coverAuthorsPlaceholder: string;
  coverAuthorsHint: string;
  coverInstitution: string;
  coverInstitutionPlaceholder: string;
  coverFaculty: string;
  coverFacultyPlaceholder: string;
  coverCourse: string;
  coverCoursePlaceholder: string;
  coverTeacher: string;
  coverTeacherPlaceholder: string;
  coverCity: string;
  coverCityPlaceholder: string;
  coverDate: string;
  includeCoverPage: string;
  includeCoverPageDesc: string;
  disableCoverPage: string;
  enableCoverPage: string;
  resetFields: string;
  ieeeCoverNotice: string;
  apa7CoverNotice: string;
  apa6CoverNotice: string;
  fillFieldsToPreview: string;
  apaHint: string;
  selectDate: string;
  clearDate: string;
  prevMonth: string;
  nextMonth: string;
  datePickerLabel: string;
  goToToday: string;
  months: string[];
  daysShort: string[];
  dateLocaleFormat: string;

  // Citations / Formats (Generated texts)
  nd: string; // no date (s.f. / n.d.)
  etAl: string; // et al.
  retrievedFrom: string; // Recuperado de / Retrieved from
  referencesHeading: string; // Referencias / References
  unknownAuthor: string;
  unknownTitle: string;
  incompleteReferenceFallback: string;

  // Support Form
  supportTitle: string;
  supportSpamWarning: string;
  supportError: string;
  supportType: string;
  supportDescription: string;
  supportDescriptionPlaceholder: string;
  supportSending: string;
  supportSend: string;
  supportSuccessTitle: string;
  supportSuccessMsg: string;
  supportReqBug: string;
  supportReqSupport: string;
  supportReqSuggestion: string;
  supportReqFeature: string;
  supportReqGeneral: string;
  supportReqOther: string;
}
