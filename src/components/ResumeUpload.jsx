'use client';

import { useEffect, useState } from 'react';
import ATSChecker from './ATSChecker';

const ResumeUpload = ({ selectedFile, onUploadSuccess }) => {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!selectedFile || isUploading) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, or DOCX file.');
      setResumeData(null);
      onUploadSuccess?.(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const uploadFile = async () => {
      setIsUploading(true);
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('resume', selectedFile);

      try {
        const response = await fetch('/api/resumes/upload', {

          method: 'POST',
          body: formData,
          signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.text || !data.text.trim()) {
          throw new Error('Resume text extraction failed.');
        }

        setResumeData(data);
        onUploadSuccess?.(data);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Upload error:', error);
        setError(`Failed to upload resume: ${error.message}`);
        setResumeData(null);
        onUploadSuccess?.(null);
      } finally {
        // Ensure minimum loading time
        await new Promise((res) => setTimeout(res, 500));
        setLoading(false);
        setIsUploading(false);
      }
    };

    uploadFile();

    return () => controller.abort();
  }, [selectedFile, onUploadSuccess]);

  return (
    <div className={`mt-8 w-full transition-all duration-300 ${resumeData ? 'max-w-6xl' : 'max-w-lg'}`}>
      {loading && (
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-blue-400 text-center">Uploading resume...</p>
        </div>
      )}

      {error && (
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      {resumeData && (
  <div className="mt-8 w-full rounded-lg border border-slate-700 bg-slate-800/80 p-6 shadow-md overflow-auto max-h-[75vh] animate-fade-in">
    <h2 className="text-xl font-semibold text-sky-400 mb-4 text-center">ATS Analysis</h2>
    <ATSChecker resumeData={resumeData.text} />
  </div>
)}

    </div>
  );
};

export default ResumeUpload;
