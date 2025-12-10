import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const truncateText = (text, maxLength = 1800) =>
  text && text.length > maxLength ? text.slice(0, maxLength) + "... [truncated]" : text;

const adjustScores = (scores) => {
  const capped = {
    skillsMatch: Math.min(scores.skillsMatch, 85),
    experienceMatch: Math.min(scores.experienceMatch, 85),
    educationMatch: Math.min(scores.educationMatch, 85),
  };
  capped.overall = Math.round(
    (capped.skillsMatch + capped.experienceMatch + capped.educationMatch) / 3
  );
  return capped;
};

const safeParseJson = (raw) => {
  if (!raw || typeof raw !== "string") throw new Error("Empty response from model");
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model output was not JSON: " + raw.slice(0, 200));
    return JSON.parse(match[0]);
  }
};

export const analyzeATS = async (resumeText, jobDescription) => {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const prompt = `
You are an ATS evaluator. Compare resume and job description.

RULES:
- Score Skills Match, Experience Match, Education Match from 0 to 100.
- Score conservatively: typical resumes are 45–70 unless very aligned.
- Strengths: ONLY skills/experience/education actually visible in the resume.
- Weaknesses: ONLY skills/experience/education explicitly required in the job description but clearly missing from the resume.
- Never list the same thing in both strengths and weaknesses.
- Do NOT hallucinate weaknesses that are not in the job description.
- If unsure, do NOT include it.

Return STRICT JSON in this format:

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

JOB DESCRIPTION:
${truncateText(jobDescription)}

RESUME:
${truncateText(resumeText)}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant", // ✅ current, supported Groq model
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 2000,
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  const parsed = safeParseJson(raw);
  parsed.scores = adjustScores(parsed.scores);
  parsed.usedModel = "Groq Llama 3.1 8B Instant";

  return parsed;
};
