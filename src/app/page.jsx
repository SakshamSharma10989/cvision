'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import JobList from '../components/JobList';
import Body from '../components/Body';
import UserProfile from '../components/UserProfile';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  console.log('🏠 Render: isAuthenticated =', isAuthenticated, '| checked =', checked);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🔐 Not authenticated, redirecting to /login');
      router.replace('/login'); // <-- use replace instead of push
      return;
    }
    console.log('✅ Authenticated, setting checked = true');
    setChecked(true);
  }, [isAuthenticated]);

  if (!isAuthenticated || !checked) {
    console.log('⏳ Returning fallback screen');
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Redirecting...
      </div>
    );
  }

  console.log('🚀 Rendering main UI');
  return (
    <AppProvider>
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
    </AppProvider>
  );
}
