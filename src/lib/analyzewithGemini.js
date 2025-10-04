import { GoogleGenerativeAI } from '@google/generative-ai';

const truncateText = (text, maxLength = 1500) => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '... [truncated]';
};

// Optional post-processing to scale / cap scores for realism
const adjustScores = (scores) => {
  const cappedScores = {
    skillsMatch: Math.min(scores.skillsMatch, 85),
    experienceMatch: Math.min(scores.experienceMatch, 85),
    educationMatch: Math.min(scores.educationMatch, 85),
  };
  cappedScores.overall = Math.round(
    (cappedScores.skillsMatch + cappedScores.experienceMatch + cappedScores.educationMatch) / 3
  );
  return cappedScores;
};

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Google API key not configured');

  const truncatedResumeText = truncateText(resumeText);
  const truncatedJobDescription = truncateText(jobDescription);

  const prompt = `
You are an expert in ATS resume analysis. Compare the given resume and job description.

### Scoring Rules
- Each category (skills, experience, education) must be scored 0–100.
- Score **conservatively**: mid-level resumes should typically get 40–70 overall.
- Only assign 90+ for very strong matches.
- Base each score strictly on actual overlap; do not inflate.

### Output Required
1. Scores for:
   - Skills Match
   - Experience Match
   - Education Match
   - Overall (average of the three above, rounded)
2. Strengths (bullet points) for each category
3. Weaknesses (bullet points) for each category

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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 3000,
        temperature: 0.5, // slightly flexible for realistic scoring
        responseMimeType: "application/json"
      },
    });

    const jsonString = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!jsonString) {
      console.error("Gemini returned no JSON:", JSON.stringify(result, null, 2));
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(jsonString);

    // Adjust scores to prevent inflated numbers for mid resumes
    parsed.scores = adjustScores(parsed.scores);

    console.log("🔎 Raw Gemini output:", jsonString);
    console.log("✅ Adjusted Analysis Result:", parsed);

    return parsed;

  } catch (err) {
    console.error('Gemini analysis error:', err);
    throw new Error(`Analysis failed: ${err.message}`);
  }
};
