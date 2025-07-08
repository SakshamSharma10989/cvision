// app/api/resumes/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import parsePDF from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import cloudinary from 'cloudinary';

// Cloudinary config
cloudinary.v2.config({
  cloud_name: 'dybqyd3vp',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility: timeout after `ms` milliseconds
const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Cloudinary upload timed out')), ms)
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const fileType = file.type;

    const tempPath = path.join(tmpdir(), `${Date.now()}-${fileName}`);
    await writeFile(tempPath, buffer);

    // Upload to Cloudinary with timeout
    const cloudResult = await Promise.race([
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            folder: 'resumes',
            resource_type: 'raw',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      }),
      timeout(10000), // 10 seconds timeout
    ]);

    // Extract text from resume
    let text = '';
    if (fileType === 'application/pdf') {
      const pdfData = await parsePDF(buffer);
      text = pdfData.text || '';
    } else if (
      fileType.includes('word') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ path: tempPath });
      text = value || '';
    } else {
      throw new Error('Unsupported file format');
    }

    await unlink(tempPath); // Clean up temp file

    if (!text.trim()) {
      throw new Error('No text could be extracted from the resume');
    }

    return NextResponse.json(
      {
        text,
        fileUrl: cloudResult.secure_url,
        fileName,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Resume processing error:', err);
    return NextResponse.json(
      { error: 'Failed to process resume.', details: err.message },
      { status: 500 }
    );
  }
}
