'use client';

import { useEffect, useRef, useCallback, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResumeUpload from './ResumeUpload';
import { useAuth } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';


const Body = () => {
  const { resumeData, setResumeData, atsCompleted, setAtsCompleted, showPreview, setShowPreview } = useContext(AppContext);
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const isSettingFile = useRef(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Body.jsx - resumeData:', resumeData, 'atsCompleted:', atsCompleted, 'showPreview:', showPreview);
  }, [resumeData, atsCompleted, showPreview]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isSettingFile.current) return;
    isSettingFile.current = true;

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setResumeData(null);
      setShowPreview(false);
    }

    setTimeout(() => {
      isSettingFile.current = false;
    }, 100);
  }, []);

  const handleFileChange = useCallback((e) => {
    if (isSettingFile.current) return;
    isSettingFile.current = true;

    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResumeData(null);
      setShowPreview(false);
    }

    setTimeout(() => {
      isSettingFile.current = false;
    }, 100);
  }, []);

  const handleClick = () => fileInputRef.current?.click();

  const handleUploadSuccess = (data) => {
    console.log('Upload Success - data:', data);
    if (data) {
      setResumeData(data);
    }
    setSelectedFile(null);
    setIsUploading(false);
  };

const handleLogout = async () => {
  try {
    // Call backend to clear the cookie
    await fetch('/api/logout', { method: 'POST' });

    // Clean up localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');

    // Update auth state
    setIsAuthenticated(false);

    // Redirect to login
    router.push('/login');
  } catch (err) {
    console.error('❌ Logout failed:', err);
    alert('Logout failed. Please try again.');
  }
};


  const handleShowPreview = () => {
    if (resumeData && !atsCompleted) {
      console.log('Showing preview manually');
      setShowPreview(true);
    }
  };

  return (
    <div className="w-full rounded-xl bg-slate-900/80 backdrop-blur-md shadow-lg p-6 sm:p-8 border border-slate-700">

      {!resumeData && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <div
            className={`border-2 border-dashed rounded-lg p-6 bg-slate-800 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              isDragging
                ? 'border-sky-500 bg-slate-700 animate-pulse'
                : 'border-slate-600 hover:border-sky-400 hover:bg-slate-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black to-slate-900 opacity-40 pointer-events-none" />
            <div className="flex flex-col items-center gap-3 relative z-10">
              <svg viewBox="0 0 24 24" className="w-16 h-16">
                <defs>
                  <linearGradient id="darkCloud" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#darkCloud)"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-slate-200 text-lg font-medium">
                {isDragging
                  ? 'Release to Upload Your Resume'
                  : selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : 'Click or Drag & Drop Your Resume Here'}
              </span>
              <span className="text-sm text-slate-400">Supports PDF, DOC, DOCX</span>
            </div>
          </div>
        </>
      )}

      {isAuthenticated && (
        <div className="mt-4">
          <ResumeUpload selectedFile={selectedFile} onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <div className="mt-6 text-center">
       {resumeData && !showPreview && !atsCompleted && (

          <button
            onClick={handleShowPreview}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-all duration-300 shadow-md"
          >
            Show Resume Preview
          </button>
        )}

        <p className="text-slate-400 mb-2 mt-2">
          {isAuthenticated ? 'You are logged in' : 'Not logged in yet'}
        </p>

        {!isAuthenticated ? (
          <Link href="/login" className="inline-block px-6 py-2 text-sky-400 hover:text-sky-300 transition-colors">
            Log In
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="inline-block px-6 py-2 text-rose-400 hover:text-rose-300 transition-colors"
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Body;
