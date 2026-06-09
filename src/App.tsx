import { useState } from "react";
import AppProviders from "@/context/AppContext";
import Header from "@/components/Layout/Header";
import DocumentEditor from "@/components/documentEditor/DocumentEditor";
import ReferencesManager from "@/components/References/ReferencesManager";
import ExportWarningModal from "@/components/documentEditor/ExportWarningModal";
import CoverPageForm from "@/components/CoverPage/CoverPageForm";
import { FileText, BookOpen, FileImage } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useLanguage } from "@/context/AppContext";
import { useCoverPage } from "@/context/AppContext";

// ─── Tab types ─────────────────────────────────────────────────────────────────

type RightPanelTab = 'references' | 'cover';

// ─── Right panel with tabs ─────────────────────────────────────────────────────

function RightPanel() {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('cover');
  const { coverPage } = useCoverPage();
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex-1 flex flex-col min-h-0">

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-2 pt-2 gap-1">
        <button
          id="tab-cover-page"
          onClick={() => setActiveTab('cover')}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-all duration-150 border-b-2 -mb-px ${
            activeTab === 'cover'
              ? 'border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          aria-selected={activeTab === 'cover'}
          role="tab"
        >
          <FileImage className="h-4 w-4" />
          {t('coverPageTab')}
          {/* Badge when cover page is enabled */}
          {coverPage.enabled && (
            <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold
                             rounded-full bg-blue-500 text-white leading-none">
              ✓
            </span>
          )}
        </button>

        <button
          id="tab-references"
          onClick={() => setActiveTab('references')}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-all duration-150 border-b-2 -mb-px ${
            activeTab === 'references'
              ? 'border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          aria-selected={activeTab === 'references'}
          role="tab"
        >
          <BookOpen className="h-4 w-4" />
          {t('referencesHeading')}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 min-h-0">
        {activeTab === 'references' ? (
          <ReferencesManager />
        ) : (
          <CoverPageForm />
        )}
      </div>
    </div>
  );
}

// ─── App content ───────────────────────────────────────────────────────────────

function AppContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <ExportWarningModal />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

        {/* Left column — Document editor */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('documentTitle')}
              </h2>
            </div>
            <DocumentEditor />
          </div>
        </div>

        {/* Right column — Tabbed panel (References | Cover Page) */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <RightPanel />
        </div>
      </main>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AppProviders>
      <TooltipProvider delayDuration={300}>
        <AppContent />
      </TooltipProvider>
    </AppProviders>
  );
}

export default App;
