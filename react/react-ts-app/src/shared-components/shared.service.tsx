import React, { createContext, useContext, useState } from 'react';

type ReportData = unknown;

type SharedContextShape = {
  reportData: ReportData | null;
  setReportData: (d: ReportData | null) => void;
};

const SharedContext = createContext<SharedContextShape | undefined>(undefined);

export const SharedProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  return <SharedContext.Provider value={{ reportData, setReportData }}>{children}</SharedContext.Provider>;
};

export function useSharedService() {
  const ctx = useContext(SharedContext);
  if (!ctx) throw new Error('useSharedService must be used within SharedProvider');
  return ctx;
}
