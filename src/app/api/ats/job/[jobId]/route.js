import { NextResponse } from 'next/server';
import jobStore from '@/lib/jobStore';

export async function GET(request, context) {
  const { jobId } = context.params;

  if (!jobStore.has(jobId)) {
    return NextResponse.json(
      { error: 'Job ID not found' },
      { status: 404 }
    );
  }

  const result = jobStore.get(jobId);
  return NextResponse.json(result);
}
