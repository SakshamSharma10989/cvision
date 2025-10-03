import { NextResponse } from 'next/server';
import jobStore from '@/lib/jobStore';

export async function GET(_, contextPromise) {
  const { params } = await contextPromise;
  const jobId = params.jobId;

  if (!jobStore.has(jobId)) {
    return NextResponse.json({ error: 'Job ID not found' }, { status: 404 });
  }

  const result = jobStore.get(jobId);
  return NextResponse.json(result);
}
