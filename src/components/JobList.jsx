'use client';

import { useEffect, useState, useContext } from 'react';
import ResumePreview from './ResumePreview';
import { AppContext } from '../context/AppContext';


export default function JobList() {
  const { resumeData, showPreview, setShowPreview } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [copiedJobs, setCopiedJobs] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/jobs?query=${encodeURIComponent(searchQuery || 'developer')}`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
  };

  const copyDescription = async (jobId, description) => {
    try {
      await navigator.clipboard.writeText(description);
      setCopiedJobs(prev => ({
        ...prev,
        [jobId]: true,
      }));
      setTimeout(() => {
        setCopiedJobs(prev => ({
          ...prev,
          [jobId]: false,
        }));
      }, 2000);
    } catch {
      setError('Failed to copy description. Please try again.');
    }
  };

  const handleBackToJobs = () => {
    setShowPreview(false);
  };

  if (showPreview && resumeData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-850 to-blue-950">
        <div className="flex-1">
          <ResumePreview resumeData={resumeData} />
        </div>
        <button
          onClick={handleBackToJobs}
          className="mt-4 mx-auto px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg transition hover:shadow-lg"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-blue-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-blue-400 text-center mb-1">🧠 Test Your Resume Against Jobs</h2>
        <p className="text-sm text-gray-400 text-center mb-4 italic">
          Select a job description to check how well your resume matches it.
        </p>

        <form onSubmit={handleSearch} className="mb-4 flex justify-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search jobs (e.g., frontend, AI, marketing)"
            className="p-3 w-full max-w-md rounded-l-lg bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-r-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm"
          >
            Search
          </button>
        </form>

        {error && <p className="text-center text-red-400 text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-center text-sm text-gray-400">Loading jobs...</p>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, index) => {
              const jobId = job.id || `job-${index}`;
              const isCopied = copiedJobs[jobId];
              const description = job.description || 'No description available.';

              return (
                <div
                  key={jobId}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-gray-700 shadow-md hover:shadow-lg transition flex flex-col justify-between min-h-[260px]"
                >
                  <p className="text-xs text-cyan-400 font-semibold mb-2">Compare this with your resume</p>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-400">{job.title || 'Untitled Job'}</h3>
                    <p className="text-sm text-gray-300 mt-1">{job.company?.display_name || 'Unknown Company'}</p>
                    <p className="text-xs text-gray-500 mb-4">{job.location?.display_name || 'Remote'}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => copyDescription(jobId, description)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm text-center transition ${
                        isCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {isCopied ? 'Copied!' : 'Use for Resume Check'}
                    </button>
                    {job.redirect_url && (
                      <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 text-sm font-semibold text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 transition"
                      >
                        View Full Job Post
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">
            No jobs found for "{searchQuery}". Try something else.
          </p>
        )}
      </div>
    </div>
  );
}
