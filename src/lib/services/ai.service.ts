import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash-exp';

export interface AnalysisResult {
    matchPercentage: number;
    overallAssessment: string;
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    missingSkills: string[];
    bulletPointImprovements: Array<{
        original: string;
        improved: string;
        reason: string;
    }>;
    recommendations: string[];
    resources: Array<{
        title: string;
        type: string;
        description: string;
    }>;
    bottlenecks: string[];
    atsScore: number;
    formatSuggestions: string[];
}

const ANALYSIS_PROMPT = `You are an expert resume analyst and career coach. Analyze the provided resume against the job description and provide a comprehensive analysis.

RESUME:
{resume}

JOB DESCRIPTION:
{jobDescription}

Provide your analysis in the following JSON format ONLY (no markdown, no code blocks, just pure JSON):
{
  "matchPercentage": <number between 0-100>,
  "overallAssessment": "<2-3 sentence comprehensive assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "missingSkills": ["<skill 1>", "<skill 2>", ...],
  "bulletPointImprovements": [
    {
      "original": "<original bullet point from resume>",
      "improved": "<improved version>",
      "reason": "<why this improvement helps>"
    }
  ],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", ...],
  "resources": [
    {
      "title": "<resource name>",
      "type": "<course/book/certification/tool>",
      "description": "<brief description of how it helps>"
    }
  ],
  "bottlenecks": ["<critical issue 1>", "<critical issue 2>", ...],
  "atsScore": <number between 0-100 representing ATS compatibility>,
  "formatSuggestions": ["<format improvement 1>", "<format improvement 2>", ...]
}

Be specific, actionable, and constructive. Focus on how the candidate can improve their resume to better match this specific job.`;

export async function analyzeResume(
    resumeText: string,
    jobDescription: string,
    model: GeminiModel = 'gemini-1.5-flash'
): Promise<AnalysisResult> {
    const geminiModel = genAI.getGenerativeModel({ model });

    const prompt = ANALYSIS_PROMPT
        .replace('{resume}', resumeText)
        .replace('{jobDescription}', jobDescription);

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    try {
        const analysis = JSON.parse(cleanedText) as AnalysisResult;
        return analysis;
    } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        console.error('Raw response:', text);

        // Return a default structure if parsing fails
        return {
            matchPercentage: 0,
            overallAssessment: 'Unable to analyze resume. Please try again.',
            strengths: [],
            weaknesses: ['Analysis could not be completed'],
            missingKeywords: [],
            missingSkills: [],
            bulletPointImprovements: [],
            recommendations: ['Please try again with a clearer resume format'],
            resources: [],
            bottlenecks: ['Technical error during analysis'],
            atsScore: 0,
            formatSuggestions: [],
        };
    }
}

export function getAvailableModels(): Array<{ id: GeminiModel; name: string; description: string }> {
    return [
        {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            description: 'Fast and efficient for quick analysis',
        },
        {
            id: 'gemini-1.5-pro',
            name: 'Gemini 1.5 Pro',
            description: 'Most capable for detailed analysis',
        },
        {
            id: 'gemini-2.0-flash-exp',
            name: 'Gemini 2.0 Flash',
            description: 'Latest experimental model with enhanced capabilities',
        },
    ];
}
