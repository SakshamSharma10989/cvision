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
You are an expert in ATS resume analysis. Compare the given resume and job description.

### Scoring Rules
- Each category (skills, experience, education) must be scored **0–100**. 
- Use this scale:
  - 90–100: Very strong alignment (resume almost perfectly fits the job description).
  - 70–89: Good alignment (most requirements met, but some gaps).
  - 50–69: Moderate alignment (many gaps, but some relevance).
  - 20–49: Weak alignment (few overlaps).
  - 0–19: Very poor alignment (almost no relevance).
- Do not give fixed or generic values. Base each score strictly on the actual overlap.

### Output Required
1. Scores for:
   - Skills Match
   - Experience Match
   - Education Match
   - Overall (average of the three above, rounded).
2. Strengths (bullet points) for each category.
3. Weaknesses (bullet points) for each category.

**Job Description:**
${truncatedJobDescription}

**Resume:**
${truncatedResumeText}

### Response Format (JSON only, no extra text):
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
