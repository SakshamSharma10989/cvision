import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const fileUrl = url.searchParams.get('url');

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing file URL' }, { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    return new NextResponse(blob.stream(), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=resume.pdf',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}
