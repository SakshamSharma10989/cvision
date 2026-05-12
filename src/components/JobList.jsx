'use client';

import { useContext, useEffect, useState } from 'react';
import ResumePreview from './ResumePreview';
import { AppContext } from '../context/AppContext';

export default function JobList() {
  const { resumeData, showPreview, setShowPreview } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('developer');
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState({});

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?query=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        if (!ignore) setJobs(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setError('Failed to fetch jobs');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchJobs();
    return () => {
      ignore = true;
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue.trim() || 'developer');
  };

  const cleanJobDescription = (description) => {
    if (!description) return '';

    return description
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  const copySummary = async (jobId, title, company, location, jobDescription) => {
    try {
      const summary = `${title} — ${company} — ${location}`;
      await navigator.clipboard.writeText(cleanJobDescription(jobDescription) || summary);
      setCopied((prev) => ({ ...prev, [jobId]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [jobId]: false })), 1400);
    } catch {
      setError('Failed to copy. Please try again.');
    }
  };

  if (showPreview && resumeData) {
    return (
      <div className="h-full flex flex-col bg-slate-900/60 backdrop-blur-sm">
        <div className="flex-1">
          <ResumePreview resumeData={resumeData} />
        </div>
        <button
          onClick={() => setShowPreview(false)}
          className="mt-4 mx-auto mb-6 px-6 py-3 rounded-md 
                     bg-slate-800 hover:bg-slate-700 text-slate-200 
                     border border-slate-700 transition"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="h-full text-slate-100">
      <div className="max-w-5xl mx-auto px-0 sm:px-4 py-4 sm:py-6">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">💼 Test Your Resume Against Jobs</h2>
          <p className="text-sm text-slate-400 italic">Select a job and compare quickly.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search jobs..."
            className="min-w-0 flex-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800 
                       text-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg border border-slate-700 
                       bg-slate-800 hover:bg-slate-700 
                       text-slate-200 text-base font-medium transition"
          >
            Go
          </button>
        </form>

        {error && <p className="text-center text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-center text-slate-400">Loading jobs...</p>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, index) => {
              const jobId = job.id || `job-${index}`;
              const isCopied = !!copied[jobId];

              return (
                <div
                  key={jobId}
                  className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-sm 
                             hover:shadow-[0_0_0_1px_rgba(99,102,241,0.25)] transition flex flex-col min-h-[170px]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                      {(job.company?.display_name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-indigo-400 leading-snug line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-300 line-clamp-1">{job.company?.display_name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{job.location?.display_name}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        copySummary(jobId, job.title, job.company?.display_name, job.location?.display_name, job.description)
                      }
                      className={`h-9 min-w-0 rounded-md px-2 text-xs sm:text-sm font-medium flex items-center justify-center truncate transition
                        ${isCopied
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'}`}
                    >
                      {isCopied ? 'Copied' : 'Copy Desc'}
                    </button>
                    {job.redirect_url && (
                      <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 rounded-md text-sm font-medium flex items-center justify-center 
                                   border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">No jobs found.</p>
        )}
      </div>
    </div>
  );
}
