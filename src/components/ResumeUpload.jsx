'use client';

import { useEffect, useState, useContext } from 'react';
import ATSChecker from './ATSChecker';
import { AppContext } from '../context/AppContext';

const ResumeUpload = ({ selectedFile }) => {
  const { setResumeData } = useContext(AppContext); 
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [localPreview, setLocalPreview] = useState(null); 

  useEffect(() => {
    if (!selectedFile) return;

    const controller = new AbortController();

    const uploadResume = async () => {
      setUploading(true);
      setError(null);

      const validTypes = ['application/pdf'];

      if (!validTypes.includes(selectedFile.type)) {
        setError('Unsupported file format. Please upload a PDF or Word document.');
        setUploading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const backendRes = await fetch('/api/resumes/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          credentials: 'include',
        });

        const parsed = await backendRes.json();

        if (!backendRes.ok) {
          throw new Error(parsed.error || 'Failed to process resume');
        }

        const resumePayload = {
          _id: parsed._id,
          text: parsed.text,
          fileName: parsed.filename,
          fileUrl: parsed.fileUrl,
          uploadedAt: parsed.uploadedAt,
        };

        setResumeData(resumePayload); 
        setLocalPreview(resumePayload); 
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Upload error:', err);
          setError(err.message);
        }
      } finally {
        setUploading(false);
      }
    };

    uploadResume();

    return () => controller.abort();
  }, [selectedFile, setResumeData]);

  return (
    <div className="mt-6 space-y-6">
      {uploading && (
        <p className="text-sm text-slate-400 animate-pulse">
          ⏳ Uploading and parsing resume...
        </p>
      )}

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
          ⚠️ {error}
        </div>
      )}

      {/* ✅ Render ATSChecker directly — no extra bg/border wrapper */}
      {localPreview?.text && (
        <ATSChecker resumeData={localPreview} />
      )}
    </div>
  );
};

export default ResumeUpload;
