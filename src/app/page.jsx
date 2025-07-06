'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import JobList from '../components/JobList';
import Body from '../components/Body';
import UserProfile from '../components/UserProfile';
import { createContext, useState } from 'react';

export const AppContext = createContext();

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [resumeData, setResumeData] = useState(null);
  const [atsCompleted, setAtsCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting...');
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null; // Block rendering until ready

  return (
    <AppContext.Provider value={{ resumeData, setResumeData, atsCompleted, setAtsCompleted, showPreview, setShowPreview }}>
      <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white font-sans min-h-screen">
        <UserProfile />
        <div className="flex w-full h-[calc(100vh-56px)]">
          <div className="w-1/2 overflow-y-auto p-6 bg-[#111827]">
            <Body />
          </div>
          <div className="w-1/2 overflow-y-auto p-6 border-l border-gray-800 bg-[#111827]">
            <div className="mt-auto">
              <JobList />
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}
