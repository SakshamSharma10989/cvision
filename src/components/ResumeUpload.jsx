'use client';

import { useEffect, useState, useContext } from 'react';
import ATSChecker from './ATSChecker';
import { AppContext } from '../context/AppContext';

const ResumeUpload = ({ selectedFile }) => {
  const { setResumeData } = useContext(AppContext); // ✅ use global setter
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [localPreview, setLocalPreview] = useState(null); // used for showing file link

  useEffect(() => {
    if (!selectedFile) return;

    const controller = new AbortController();

    const uploadResume = async () => {
      setUploading(true);
      setError(null);

      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

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
        });

        const parsed = await backendRes.json();

        if (!backendRes.ok) {
          throw new Error(parsed.error || 'Failed to process resume');
        }

        const resumePayload = {
          text: parsed.text,
          fileName: parsed.fileName,
          fileUrl: parsed.fileUrl,
        };

        setResumeData(resumePayload); // ✅ save to context
        setLocalPreview(resumePayload); // only for link rendering
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
        <p className="text-sm text-gray-400 animate-pulse">Uploading and parsing resume...</p>
      )}

      {error && (
        <p className="text-red-500 text-sm font-medium">⚠️ {error}</p>
      )}

     

      {localPreview?.text && <ATSChecker resumeData={localPreview.text} />}
    </div>
  );
};

export default ResumeUpload;