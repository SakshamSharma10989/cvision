'use client';

import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AnimatedLoader from './AnimatedLoader';
import { AppContext } from '../context/AppContext';

const defaultJobDescription = `Looking for a skilled software engineer with experience in React, Node.js, MongoDB, and REST APIs. Strong problem-solving and communication skills required. Bachelor's degree in Computer Science, Engineering, or related field preferred.`;

function ATSChecker({ resumeData }) {
  const { setAtsCompleted, setShowPreview } = useContext(AppContext);
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [useCustomJD, setUseCustomJD] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    let interval;
    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/ats/job/${jobId}`);
          const { status, analysis, message, error } = response.data;
          if (status === 'completed') {
            setResult(analysis);
            setLoading(false);
            setJobId(null);
            setError(null);
            setShowLoader(true);
            setAtsCompleted(true);
            setShowPreview(true);
          } else if (status === 'failed') {
            setError(`Analysis failed: ${message || error || 'Unknown error'}`);
            setLoading(false);
            setJobId(null);
          }
        } catch (err) {
          setError(`Failed to retrieve analysis result: ${err.response?.data?.error || err.message}`);
          setLoading(false);
          setJobId(null);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [jobId, loading, setAtsCompleted, setShowPreview]);

  useEffect(() => {
    if (showLoader) {
      const timer = setTimeout(() => setShowLoader(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  const handleAnalyze = async () => {
    if (!resumeData) {
      setError('No resume data available. Please upload a resume first.');
      return;
    }
    const jdToUse = useCustomJD ? jobDesc : defaultJobDescription;
    if (!jdToUse.trim()) {
      setError('Please enter a job description or use the default ATS check.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resumeToSend = typeof resumeData === 'string' ? resumeData : resumeData.text || '';
      if (!resumeToSend.trim()) throw new Error('Resume data is empty or invalid');
      const response = await axios.post(
        '/api/ats/analyze-resume',
        { resume: resumeToSend, jobDescription: jdToUse, resumeId: resumeData._id },
        { timeout: 10000 }
      );
      const { jobId, status, analysis } = response.data;
      if (status === 'pending') setJobId(jobId);
      else {
        setResult(analysis);
        setLoading(false);
        setShowLoader(true);
        setAtsCompleted(true);
        setShowPreview(true);
      }
    } catch (err) {
      setError(`Failed to initiate analysis: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  const exportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ats-analysis.json';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getPercentageForCategory = (category) => {
    if (!result || !result.scores) return 0;
    switch (category) {
      case 'Skills Match': return result.scores.skillsMatch || 0;
      case 'Experience Match': return result.scores.experienceMatch || 0;
      case 'Education Match': return result.scores.educationMatch || 0;
      default: return 0;
    }
  };

  const getScoreColor = (score) => {
    return score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getAverageResumeScore = () => {
    if (!result || !result.scores) return 0;
    const scores = [
      result.scores.skillsMatch || 0,
      result.scores.experienceMatch || 0,
      result.scores.educationMatch || 0,
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-slate-900/60 text-slate-100 rounded-2xl shadow-lg border border-slate-700">
      <h3 className="text-lg sm:text-xl font-semibold text-indigo-400 flex items-center gap-2 mb-4">
        <span>🔍</span> ATS Analysis
      </h3>

      {!result && !loading && (
        <div>
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={useCustomJD}
              onChange={() => setUseCustomJD(!useCustomJD)}
              className="h-5 w-5 accent-indigo-500"
            />
            <span className="text-sm font-medium text-slate-300">Use Custom Job Description</span>
          </label>

          {useCustomJD ? (
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={4}
              className="w-full p-3 mb-4 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste or type a job description..."
            />
          ) : (
            <div className="p-3 mb-4 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <p className="text-sm">Default Job Description:</p>
              <p className="text-sm">{defaultJobDescription}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!resumeData}
            className={`w-full h-10 rounded-md text-sm font-medium flex items-center justify-center transition
              ${resumeData
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'}
            `}
          >
            Run ATS Check
          </button>
        </div>
      )}

      {(loading || showLoader) && (
        <div className="flex justify-center mt-6">
          <AnimatedLoader />
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {result && !showLoader && (
        <div className="mt-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['summary', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition
                  ${activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                `}
              >
                {tab === 'summary' ? 'Summary' : 'Details'}
              </button>
            ))}
          </div>

          {/* Summary */}
          {activeTab === 'summary' ? (
            <div className="text-center">
              <h4 className="text-lg font-semibold text-slate-200 mb-4">Resume Score</h4>
              <div className="relative w-36 h-36 sm:w-[180px] sm:h-[180px] mx-auto">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    strokeDasharray={`${(getAverageResumeScore() / 100) * 314} 314`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                  <text
                    x="60"
                    y="70"
                    textAnchor="middle"
                    fontSize="24"
                    fill="white"
                    fontWeight="bold"
                  >
                    {getAverageResumeScore()}%
                  </text>
                </svg>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {['Skills Match', 'Experience Match', 'Education Match'].map((category) => (
                  <div key={category} className="p-4 bg-slate-800 rounded-lg text-center border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase">{category}</p>
                    <p className={`${getScoreColor(getPercentageForCategory(category))} text-lg font-semibold mt-2`}>
                      {getPercentageForCategory(category)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h4 className="text-lg font-semibold text-indigo-400 mb-4">Detailed Analysis</h4>
              {['Skills Match', 'Experience Match', 'Education Match'].map((category) => {
                const categoryKey = category.toLowerCase().replace(' match', '');
                const strengths = result.strengths?.[categoryKey] || [];
                const weaknesses = result.weaknesses?.[categoryKey] || [];
                const isExpanded = expandedSections[category];
                const percentage = getPercentageForCategory(category);
                const percentageColor = getScoreColor(percentage);

                return (
                  <div key={category} className="mb-3">
                    <button
                      onClick={() => toggleSection(category)}
                      className="w-full text-left flex items-center justify-between gap-3 p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
                    >
                      <span className="text-sm font-medium">{category}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${percentageColor}`}>{percentage}%</span>
                        <span className="text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="mb-2">
                          <h5 className="text-sm font-semibold text-emerald-300">✅ Strengths</h5>
                          {strengths.length > 0 ? (
                            <ul className="list-disc list-outside pl-5 text-slate-300 text-sm">
                              {strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          ) : (
                            <p className="text-slate-500 text-sm">No strengths identified.</p>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-rose-300">⚠️ Weaknesses</h5>
                          {weaknesses.length > 0 ? (
                            <ul className="list-disc list-outside pl-5 text-slate-300 text-sm">
                              {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          ) : (
                            <p className="text-slate-500 text-sm">No weaknesses identified.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={exportJSON}
            className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline"
          >
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}

export default ATSChecker;
