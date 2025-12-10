import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
});

const COMPANY_CONTEXT = `You are writing content for Baynunah Watergeneration Technologies SP LLC, a company based in Abu Dhabi, UAE that produces water from air using atmospheric water generation technology under the Ma Hawa brand.

COMPANY CONTEXT:
- Company: Baynunah Watergeneration Technologies SP LLC
- Brand: Ma Hawa
- Location: Abu Dhabi, UAE
- Industry: Sustainable water technology
- Employees: 60+

UAE CONTEXT:
- Currency: AED
- Standard workweek: Sunday-Thursday
- Probation: 6 months
- Annual leave: 30 days

Write in a professional but warm tone. Be concise and action-oriented.`;

export async function generateEmailDraft(params: {
  type: "interview_invite" | "rejection" | "offer" | "followup" | "reminder" | "document_request";
  recipientName: string;
  positionTitle?: string;
  details?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewerName?: string;
}): Promise<string> {
  const { type, recipientName, positionTitle, details, interviewDate, interviewTime, interviewerName } = params;

  const typePrompts: Record<string, string> = {
    interview_invite: `Write an interview invitation email for ${recipientName} for the ${positionTitle || "position"} role.${interviewDate ? ` Interview date: ${interviewDate}.` : ""}${interviewTime ? ` Time: ${interviewTime}.` : ""}${interviewerName ? ` They will meet with ${interviewerName}.` : ""} Keep it professional and include logistics.`,
    
    rejection: `Write a polite rejection email for ${recipientName} who applied for the ${positionTitle || "position"} role. Thank them for their time and interest. Keep it brief and respectful.`,
    
    offer: `Write an offer letter email for ${recipientName} for the ${positionTitle || "position"} role.${details ? ` Details: ${details}` : ""} Include congratulations and excitement about them joining.`,
    
    followup: `Write a follow-up email to ${recipientName} regarding their application for the ${positionTitle || "position"} role.${details ? ` Context: ${details}` : ""} Check in on their status politely.`,
    
    reminder: `Write a reminder email to ${recipientName} about their pending ${details || "recruitment task"}.${positionTitle ? ` This is for the ${positionTitle} role.` : ""} Be friendly but clear about what's needed.`,
    
    document_request: `Write an email to ${recipientName} requesting ${details || "required documents"}.${positionTitle ? ` This is for their ${positionTitle} application/onboarding.` : ""} List what's needed clearly.`,
  };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

${typePrompts[type] || typePrompts.followup}

Write only the email body. Do not include subject line. Start with the greeting.`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  return textBlock?.text || "";
}

export async function generateJobDescription(params: {
  positionTitle: string;
  department: string;
  experienceMin?: number;
  experienceMax?: number;
  employmentType?: string;
  responsibilities?: string[];
  requirements?: string[];
}): Promise<string> {
  const { positionTitle, department, experienceMin, experienceMax, employmentType, responsibilities, requirements } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

Generate a professional job description for:

Position: ${positionTitle}
Department: ${department}
Experience: ${experienceMin || 0} - ${experienceMax || "open"} years
Employment Type: ${employmentType || "Full-time"}

${responsibilities?.length ? `Key responsibilities to include:\n${responsibilities.map(r => `- ${r}`).join("\n")}` : ""}

${requirements?.length ? `Requirements to include:\n${requirements.map(r => `- ${r}`).join("\n")}` : ""}

Format with clear sections:
1. About Us (brief)
2. Role Overview
3. Key Responsibilities (bullet points)
4. Requirements (bullet points)
5. What We Offer
6. How to Apply`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  return textBlock?.text || "";
}

export async function generateCandidateSummary(params: {
  name: string;
  currentTitle?: string;
  currentCompany?: string;
  experienceYears?: number;
  skills?: string[];
  education?: string;
  cvText?: string;
}): Promise<{ summary: string; highlights: string[]; concerns: string[] }> {
  const { name, currentTitle, currentCompany, experienceYears, skills, education, cvText } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

Analyze this candidate profile and provide a brief executive summary:

Candidate: ${name}
Current Role: ${currentTitle || "Not specified"} at ${currentCompany || "Not specified"}
Experience: ${experienceYears || "Not specified"} years
Skills: ${skills?.join(", ") || "Not specified"}
Education: ${education || "Not specified"}

${cvText ? `CV/Resume Text:\n${cvText}` : ""}

Respond in JSON format:
{
  "summary": "2-3 sentence executive summary",
  "highlights": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["potential concern or gap 1", "if any"]
}`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  
  try {
    const jsonMatch = textBlock?.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall back to simple format
  }

  return {
    summary: textBlock?.text || `${name} is a candidate with ${experienceYears || "unspecified"} years of experience.`,
    highlights: [],
    concerns: [],
  };
}

export async function generateInterviewQuestions(params: {
  positionTitle: string;
  department: string;
  experienceLevel?: string;
  focusAreas?: string[];
}): Promise<{ category: string; questions: string[] }[]> {
  const { positionTitle, department, experienceLevel, focusAreas } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

Generate interview questions for:

Position: ${positionTitle}
Department: ${department}
Experience Level: ${experienceLevel || "Mid-level"}
${focusAreas?.length ? `Focus Areas: ${focusAreas.join(", ")}` : ""}

Provide questions in JSON format:
[
  {
    "category": "Technical Skills",
    "questions": ["question 1", "question 2", "question 3"]
  },
  {
    "category": "Behavioral",
    "questions": ["question 1", "question 2"]
  },
  {
    "category": "Cultural Fit",
    "questions": ["question 1", "question 2"]
  }
]

Include 8-12 total questions across categories.`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  
  try {
    const jsonMatch = textBlock?.text?.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall back to default
  }

  return [
    { category: "General", questions: ["Tell me about yourself and your experience.", "Why are you interested in this role?"] }
  ];
}

export async function scoreCandidate(params: {
  positionTitle: string;
  requirements: string[];
  candidateProfile: {
    experienceYears?: number;
    skills?: string[];
    currentTitle?: string;
    education?: string;
  };
}): Promise<{ score: number; reasoning: string; matchedRequirements: string[]; gaps: string[] }> {
  const { positionTitle, requirements, candidateProfile } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

Score this candidate for the ${positionTitle} position:

Requirements:
${requirements.map(r => `- ${r}`).join("\n")}

Candidate Profile:
- Experience: ${candidateProfile.experienceYears || "Not specified"} years
- Skills: ${candidateProfile.skills?.join(", ") || "Not specified"}
- Current Title: ${candidateProfile.currentTitle || "Not specified"}
- Education: ${candidateProfile.education || "Not specified"}

Respond in JSON:
{
  "score": 0-100,
  "reasoning": "Brief explanation",
  "matchedRequirements": ["requirement met 1", "requirement met 2"],
  "gaps": ["missing skill or qualification"]
}`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  
  try {
    const jsonMatch = textBlock?.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall back
  }

  return {
    score: 50,
    reasoning: "Unable to generate detailed score",
    matchedRequirements: [],
    gaps: [],
  };
}

export async function generateSourcingCriteria(params: {
  positionTitle: string;
  department: string;
  jobDescription?: string;
  experienceMin?: number;
  experienceMax?: number;
}): Promise<{
  keywords: string[];
  alternativeTitles: string[];
  targetCompanies: string[];
  relatedIndustries: string[];
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  searchTips: string[];
  candidatePersona: string;
}> {
  const { positionTitle, department, jobDescription, experienceMin, experienceMax } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

Generate sourcing criteria for recruiting candidates for this position. Focus on UAE/GCC job market context.

Position: ${positionTitle}
Department: ${department}
Experience Range: ${experienceMin || 0} - ${experienceMax || 10}+ years
${jobDescription ? `Job Description:\n${jobDescription}` : ""}

Consider:
- Baynunah is a water technology company (atmospheric water generation)
- Target candidates in UAE, willing to relocate to Abu Dhabi
- Related industries: Water/Utilities, Desalination, CleanTech, Oil & Gas, EPC contractors

Respond in JSON:
{
  "keywords": ["primary search keyword 1", "keyword 2", "keyword 3"],
  "alternativeTitles": ["alternative job title 1", "regional variation", "synonym title"],
  "targetCompanies": ["company in UAE/GCC to source from", "competitor", "similar industry company"],
  "relatedIndustries": ["industry 1", "industry 2"],
  "mustHaveSkills": ["essential skill 1", "essential skill 2"],
  "niceToHaveSkills": ["bonus skill 1", "bonus skill 2"],
  "searchTips": ["tip for finding candidates", "what to look for in profiles"],
  "candidatePersona": "2-3 sentence description of ideal candidate profile"
}`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  
  try {
    const jsonMatch = textBlock?.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall back
  }

  return {
    keywords: [positionTitle],
    alternativeTitles: [],
    targetCompanies: [],
    relatedIndustries: ["Water & Utilities", "CleanTech"],
    mustHaveSkills: [],
    niceToHaveSkills: [],
    searchTips: ["Look for relevant experience in similar industries"],
    candidatePersona: `Experienced professional in ${department} with background relevant to ${positionTitle}.`,
  };
}

export async function analyzeProfileStrengths(params: {
  positionTitle: string;
  profileUrl?: string;
  candidateName: string;
  currentTitle?: string;
  currentCompany?: string;
  summary?: string;
  experience?: string;
  skills?: string;
  education?: string;
  location?: string;
}): Promise<{
  overallFit: "strong" | "moderate" | "weak";
  fitScore: number;
  strengths: { point: string; details: string }[];
  redFlags: { point: string; details: string; severity: "high" | "medium" | "low" }[];
  recommendations: string[];
  outreachTips: string;
}> {
  const { positionTitle, candidateName, currentTitle, currentCompany, summary, experience, skills, education, location } = params;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1200,
    messages: [{
      role: "user",
      content: `${COMPANY_CONTEXT}

Analyze this candidate profile for the ${positionTitle} position at Baynunah Watergeneration Technologies (Abu Dhabi, UAE).

Candidate Information:
- Name: ${candidateName}
- Current Role: ${currentTitle || "Not provided"}
- Current Company: ${currentCompany || "Not provided"}
- Location: ${location || "Not provided"}
${summary ? `- Profile Summary: ${summary}` : ""}
${experience ? `- Experience: ${experience}` : ""}
${skills ? `- Skills: ${skills}` : ""}
${education ? `- Education: ${education}` : ""}

Provide an honest assessment with both strengths and potential concerns. Consider:
- Relevance to water technology/utilities industry
- Willingness to work in UAE (if not already there)
- Career progression and stability
- Skills match for the role

Respond in JSON:
{
  "overallFit": "strong" | "moderate" | "weak",
  "fitScore": 0-100,
  "strengths": [
    {"point": "strength title", "details": "why this is valuable"}
  ],
  "redFlags": [
    {"point": "concern title", "details": "why this matters", "severity": "high" | "medium" | "low"}
  ],
  "recommendations": ["action to take", "question to ask in screening"],
  "outreachTips": "Personalized suggestion for how to approach this candidate"
}`,
    }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  
  try {
    const jsonMatch = textBlock?.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall back
  }

  return {
    overallFit: "moderate",
    fitScore: 50,
    strengths: [{ point: "Profile submitted", details: "Candidate information available for review" }],
    redFlags: [],
    recommendations: ["Review profile manually for detailed assessment"],
    outreachTips: `Reach out to ${candidateName} with a personalized message about the ${positionTitle} opportunity.`,
  };
}
