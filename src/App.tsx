import AppProviders from "@/context/AppContext";
import Header from "@/components/Layout/Header";
import DocumentEditor from "@/components/documentEditor/DocumentEditor";
import ReferencesManager from "@/components/References/ReferencesManager";
import ExportWarningModal from "@/components/documentEditor/ExportWarningModal";
import { FileText, BookOpen } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <ExportWarningModal />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Documento
              </h2>
            </div>
            <DocumentEditor />
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex-1">
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Referencias
              </h2>
            </div>
            <ReferencesManager />
          </div>
        </div>
      </main>
    </div>
  );
}

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
