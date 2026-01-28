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
      max_tokens: 2000, // Increased for longer job descriptions
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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        throw new Error('AI analysis timed out. Please try again.');
      }
      
      if (error.message.includes('rate_limit')) {
        throw new Error('AI service rate limit exceeded. Please try again in a moment.');
      }
      
      if (error.message.includes('invalid_api_key')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
      
      if (error.message.includes('quota_exceeded')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      }

      if (error.message.includes('Failed to parse')) {
        throw new Error('AI analysis returned invalid data. Please try again.');
      }
    }
    
    throw new Error('AI service temporarily unavailable. Please try again.');
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
  "workArrangement": string | null ("remote" | "hybrid" | "onsite"),
  "suitabilityScore": number (0-100, ${cvContent ? 'based on CV match' : 'general assessment based on job requirements difficulty'}),
  "suitabilityReason": string (brief explanation of score),
  "suggestedNextSteps": string[] (3-5 actionable, specific steps for this application${cvContent ? ' based on job requirements and candidate background' : ' for applying to this role'})
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
  } else {
    return basePrompt + `

For suitabilityScore, provide a general assessment (0-100) based on:
- How competitive/difficult this role appears to be
- Level of experience required (entry: 70-85, mid: 50-70, senior: 30-50, executive: 10-30)
- Technical complexity of requirements
- Company prestige/competitiveness

For suitabilityReason, explain your scoring rationale in 1-2 sentences focusing on the role's requirements and difficulty level.`;
  }
}

function parseAnalysisResponse(response: string): AIAnalysisResult {
  try {
    // Log the raw response for debugging
    console.log('Raw AI response:', response);

    // Extract JSON from the response (in case there's extra text)
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      throw new Error('No JSON found in response');
    }

    let jsonStr = jsonMatch[0];
    
    // Handle potentially truncated JSON - try to find the last complete field
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error, attempting to fix truncated response:', parseError);
      
      // Try to fix truncated JSON by finding the last complete field and closing the object
      const lastCompleteField = jsonStr.lastIndexOf('",');
      if (lastCompleteField > 0) {
        const fixedJson = jsonStr.substring(0, lastCompleteField + 1) + '\n}';
        console.log('Attempting to parse fixed JSON:', fixedJson);
        try {
          parsed = JSON.parse(fixedJson);
          console.log('Successfully parsed fixed JSON');
        } catch (fixError) {
          console.error('Failed to parse fixed JSON:', fixError);
          throw new Error('Invalid JSON in AI response');
        }
      } else {
        throw new Error('Invalid JSON in AI response');
      }
    }
    
    // Validate required structure
    if (typeof parsed !== 'object' || parsed === null) {
      console.error('Parsed response is not an object:', parsed);
      throw new Error('AI response structure is invalid');
    }
    
    // Validate and clean the response with fallbacks for missing fields
    const result: AIAnalysisResult = {
      salaryMin: typeof parsed.salaryMin === 'number' ? parsed.salaryMin : null,
      salaryMax: typeof parsed.salaryMax === 'number' ? parsed.salaryMax : null,
      salaryCurrency: typeof parsed.salaryCurrency === 'string' ? parsed.salaryCurrency : null,
      responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      workArrangement: typeof parsed.workArrangement === 'string' ? parsed.workArrangement : null,
      suitabilityScore: typeof parsed.suitabilityScore === 'number' ? parsed.suitabilityScore : null,
      suitabilityReason: typeof parsed.suitabilityReason === 'string' ? parsed.suitabilityReason : null,
      suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : [],
    };

    // If critical fields are missing due to truncation, add fallback values
    if (!result.suitabilityScore && (result.requirements.length > 0 || result.responsibilities.length > 0)) {
      result.suitabilityScore = 50; // Default middle score if we have job data but score was truncated
      result.suitabilityReason = 'Analysis was truncated - please re-analyze for complete scoring.';
    }

    if (result.suggestedNextSteps.length === 0 && (result.requirements.length > 0 || result.responsibilities.length > 0)) {
      result.suggestedNextSteps = [
        'Research the company and role requirements',
        'Tailor your resume to highlight relevant experience',
        'Prepare for technical discussions around key requirements'
      ];
    }

    console.log('Final parsed result:', result);
    return result;
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