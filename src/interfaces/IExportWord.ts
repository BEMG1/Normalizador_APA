import React from "react";

export interface IExportWord {
  showExportWarning: boolean;
  setShowExportWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportClick: () => void;
  handleExportAnyway: () => Promise<void>;
}
