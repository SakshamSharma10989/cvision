import { NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/analyzewithGemini';
import jobStore from '@/lib/jobStore';

export async function POST(req) {
  const body = await req.json();
  const { resume, jobDescription } = body;

  if (!resume || !jobDescription) {
    return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 });
  }

  const resumeText = typeof resume === 'string' ? resume.trim() : '';
  if (!resumeText) {
    return NextResponse.json({ error: 'Resume text is empty or invalid' }, { status: 400 });
  }

  const jobId = Math.random().toString(36).substring(2, 15);
  jobStore.set(jobId, { status: 'pending', analysis: null, error: null });

  // Process in background
  setTimeout(async () => {
    try {
      const analysis = await analyzeWithGemini(resumeText, jobDescription);
      jobStore.set(jobId, { status: 'completed', analysis, error: null });
    } catch (err) {
      jobStore.set(jobId, {
        status: 'failed',
        analysis: null,
        error: err?.message || 'Analysis failed',
      });
    }
  }, 0);

  return NextResponse.json({ jobId, status: 'pending' });
}
