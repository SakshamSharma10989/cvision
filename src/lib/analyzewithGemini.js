import { GoogleGenerativeAI } from '@google/generative-ai';

const truncateText = (text, maxLength = 2000) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '... [truncated]';
};

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Google API key not configured');

  const truncatedResumeText = truncateText(resumeText);
  const truncatedJobDescription = truncateText(jobDescription);

  const prompt = `
You are an expert in resume analysis for ATS systems. I will provide a resume and a job description. Your task is to analyze the resume against the job description and provide:

1. A percentage match score (0-100%) for each of the following categories:
   - Skills Match: Based on technical and non-technical skills relevant to the job.
   - Experience Match: Based on work experience or projects relevant to the job.
   - Education Match: Based on educational background (degrees, institutions, grades) relevant to the job requirements.
2. An overall match score (average of the above).
3. A list of strengths (what the resume does well in matching the job description) for each category.
4. A list of weaknesses (what the resume lacks or could improve to better match the job description) for each category.

**Job Description:**
${truncatedJobDescription}

**Resume:**
${truncatedResumeText}

Please respond in the following JSON format:
{
  "scores": {
    "skillsMatch": number,
    "experienceMatch": number,
    "educationMatch": number,
    "overall": number
  },
  "strengths": {
    "skills": string[],
    "experience": string[],
    "education": string[],
    "overall": string[]
  },
  "weaknesses": {
    "skills": string[],
    "experience": string[],
    "education": string[],
    "overall": string[]
  }
}
Ensure the Education Match score reflects the relevance of the educational background (e.g., degrees, institutions, grades) to the job description, even if not explicitly required.
`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const jsonString = result.response.text().replace(/```json\n|\n```/g, '').trim();
  if (!jsonString) throw new Error('Empty response from Gemini');
  return JSON.parse(jsonString);
};
