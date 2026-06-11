import { useState } from "react";
import AppProviders from "@/context/AppContext";
import Header from "@/components/Layout/Header";
import DocumentEditor from "@/components/documentEditor/DocumentEditor";
import DocumentTitle from "@/components/documentEditor/DocumentTitle";
import ReferencesManager from "@/components/References/ReferencesManager";
import ExportWarningModal from "@/components/documentEditor/ExportWarningModal";
import CoverPageForm from "@/components/CoverPage/CoverPageForm";
import { BookOpen, FileImage } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupportWidget } from "@/components/Support/SupportWidget";
import { useLanguage } from "@/context/AppContext";
import { useCoverPage } from "@/context/AppContext";

// ─── Tab types ─────────────────────────────────────────────────────────────────

type RightPanelTab = "references" | "cover";

// ─── Right panel with tabs ─────────────────────────────────────────────────────

function RightPanel() {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("cover");
  const { coverPage } = useCoverPage();
  const { t } = useLanguage();

  return (
    <div className="rounded-lg flex-1 flex flex-col min-h-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

      {/* Tab bar */}
      <div className="flex px-2 pt-2 gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          id="tab-cover-page"
          onClick={() => setActiveTab('cover')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-all duration-150 border-b-2 -mb-px"
          style={{
            borderBottomColor: activeTab === 'cover' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'cover' ? 'var(--accent)' : 'var(--text-2)',
            background: activeTab === 'cover' ? 'var(--accent-soft)' : 'transparent',
            fontFamily: 'var(--ui-font)',
          }}
          aria-selected={activeTab === 'cover'}
          role="tab"
        >
          <FileImage className="h-4 w-4" strokeWidth={1.6} />
          {t('coverPageTab')}
          {coverPage.enabled && (
            <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold rounded-full leading-none"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
              ✓
            </span>
          )}
        </button>

        <button
          id="tab-references"
          onClick={() => setActiveTab("references")}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-all duration-150 border-b-2 -mb-px cursor-pointer ${
            activeTab === "references"
              ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]"
              : "border-transparent text-[var(--text-2)] bg-transparent hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          }`}
          style={{ fontFamily: "var(--ui-font)" }}
          aria-selected={activeTab === "references"}
          role="tab"
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.6} />
          {t("referencesHeading")}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 min-h-0">
        {activeTab === "references" ? <ReferencesManager /> : <CoverPageForm />}
      </div>
    </div>
  );
}

// ─── App content ───────────────────────────────────────────────────────────────

function AppContent() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <ExportWarningModal />
      <Header />
      <SupportWidget />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div
            className="p-6 rounded-lg flex-1 flex flex-col min-h-0"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <DocumentTitle />
            <DocumentEditor />
          </div>
        </div>

        {/* Right column — Tabbed panel (References | Cover Page) */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 anim-fade-in anim-delay-1">
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
