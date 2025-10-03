import React from 'react';

function ResumePreview({ resumeData }) {
  if (!resumeData) return null;

  return resumeData.fileUrl ? (
    <iframe
      src={`/api/preview?url=${encodeURIComponent(resumeData.fileUrl)}#toolbar=0&navpanes=0&scrollbar=0`}
      title="Resume Preview"
      className="w-full h-[90vh] border-none"
      style={{ minHeight: '100%' }}
    />
  ) : resumeData.text ? (
    <div className="w-full h-full overflow-y-auto text-white p-2">
      <pre className="whitespace-pre-wrap break-words">{resumeData.text}</pre>
    </div>
  ) : null;
}

export default ResumePreview;
