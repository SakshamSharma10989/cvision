import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'developer';

  try {
    const appId = process.env.NEXT_PUBLIC_ADZUNA_ID;
    const appKey = process.env.NEXT_PUBLIC_ADZUNA_KEY;
    const country = 'in';
    const page = 1;
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&results_per_page=20&content-type=application/json`;
    const response = await axios.get(url);
    return NextResponse.json(response.data.results || []);
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}