// src/app/api/resumes/upload/route.js

import { writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import parsePDF from 'pdf-parse/lib/pdf-parse.js'; // ✅ This avoids the test runner

import mammoth from 'mammoth';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume'); // input name='resume'

    if (!file) {
      return NextResponse.json({ error: 'No resume file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Extract text based on file type
    let text = '';
    if (file.type === 'application/pdf') {
      const data = await parsePDF(buffer);

      text = data.text || '';
    } else if (file.type.includes('word')) {
      const { value } = await mammoth.extractRawText({ path: filePath });
      text = value || '';
    } else {
      throw new Error('Unsupported file format');
    }

    if (!text.trim()) {
      throw new Error('No text extracted from the file');
    }

    const fileUrl = `/uploads/${fileName}`;

    const resumeData = {
      id: Date.now().toString(),
      text,
      fileName: file.name,
      fileUrl,
      filePath,
    };

    return NextResponse.json(resumeData, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Failed to upload resume.', details: err.message },
      { status: 500 }
    );
  }
}
