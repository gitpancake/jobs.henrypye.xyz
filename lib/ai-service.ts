import Anthropic from '@anthropic-ai/sdk';
import { AIAnalysisResult } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeJobDescription(
  description: string,
  cvContent?: string
): Promise<AIAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const prompt = createAnalysisPrompt(description, cvContent);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Cheap, fast model
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const result = response.content[0];
    if (result.type !== 'text') {
      throw new Error('Unexpected response format from Anthropic');
    }

    return parseAnalysisResponse(result.text);
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw new Error('Failed to analyze job description');
  }
}

function createAnalysisPrompt(description: string, cvContent?: string): string {
  const basePrompt = `
Please analyze this job description and extract structured information. CRITICAL: Only extract information that is explicitly mentioned - never guess or hallucinate data.

Job Description:
"""
${description}
"""

Extract the following information in JSON format. Use null for any field where information is not explicitly provided:

{
  "salaryMin": number | null,
  "salaryMax": number | null, 
  "salaryCurrency": string | null (e.g., "USD", "CAD"),
  "responsibilities": string[] (only clear responsibilities listed),
  "requirements": string[] (only explicit requirements/skills),
  "benefits": string[] (only explicit benefits mentioned),
  "workArrangement": string | null ("remote" | "hybrid" | "onsite")${
    cvContent ? `,
  "suitabilityScore": number (0-100, based on CV match),
  "suitabilityReason": string (brief explanation of score),
  "suggestedNextSteps": string[] (3-5 actionable, specific steps for this application based on job requirements and candidate background)` : `,
  "suggestedNextSteps": string[] (3-5 actionable steps for applying to this role)`
  }
}

IMPORTANT RULES:
- Only extract salary if specific numbers are mentioned (ranges like "$100k-200k" or exact figures)
- Only list responsibilities that are clearly stated as job duties
- Only include requirements that are explicitly mentioned as needed skills/experience
- For work arrangement, only specify if clearly stated (phrases like "remote", "fully distributed", "office-based")
- Be conservative - prefer null over guessing
- For suggestedNextSteps, provide 3-5 specific, actionable steps based on this exact role and company, such as:
  * Research specific company initiatives or recent news
  * Prepare for specific technical areas mentioned in requirements
  * Highlight relevant experience that matches key responsibilities
  * Network with specific types of employees at the company
  * Tailor application materials to address key job requirements
`;

  if (cvContent) {
    return basePrompt + `

For suitability analysis, here is the candidate's CV:
"""
${cvContent}
"""

Score how well this candidate matches the role based on:
- Required skills and experience alignment
- Years of experience vs requirements
- Technical skills match
- Industry/domain relevance

Provide a score from 0-100 and a brief 1-2 sentence explanation.

For suggestedNextSteps, provide personalized, actionable steps based on:
- Specific job requirements and how the candidate should address them
- Skills gaps that need highlighting or bridging
- Company research tasks specific to this organization
- Interview preparation focused on this role's key areas
- Application strategy based on the role level and requirements`;
  }

  return basePrompt;
}

function parseAnalysisResponse(response: string): AIAnalysisResult {
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and clean the response
    return {
      salaryMin: parsed.salaryMin || null,
      salaryMax: parsed.salaryMax || null,
      salaryCurrency: parsed.salaryCurrency || null,
      responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      workArrangement: parsed.workArrangement || null,
      suitabilityScore: parsed.suitabilityScore || null,
      suitabilityReason: parsed.suitabilityReason || null,
      suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : [],
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Failed to parse analysis results');
  }
}

export async function getUserCV(): Promise<string | null> {
  try {
    const { prisma } = await import('./prisma');
    const cv = await prisma.userCV.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    return cv?.content || null;
  } catch (error) {
    console.error('Failed to get CV:', error);
    return null;
  }
}

export async function saveUserCV(content: string): Promise<void> {
  try {
    const { prisma } = await import('./prisma');
    
    // Delete existing CV and create new one (single CV per user)
    await prisma.userCV.deleteMany({});
    await prisma.userCV.create({
      data: { content }
    });
  } catch (error) {
    console.error('Failed to save CV:', error);
    throw new Error('Failed to save CV');
  }
}