'use client';
import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(null);
  const [atsCompleted, setAtsCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <AppContext.Provider
      value={{ resumeData, setResumeData, atsCompleted, setAtsCompleted, showPreview, setShowPreview }}
    >
      {children}
    </AppContext.Provider>
  );
};
