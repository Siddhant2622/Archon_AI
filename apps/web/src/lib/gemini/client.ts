import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Export the model for direct usage
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
});

// ===== Response Cache =====
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): any | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  responseCache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  // Limit cache size
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
}

// ===== Code Analysis =====
export interface SectionAnalysis {
  score: number;
  reasons: string[];
  improvements: string[];
}

export interface RootCauseTrace {
  bug: string;
  files: string[];
  explanation: string;
  fix: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  findings: Finding[];
  metrics: {
    architecture: number;
    performance: number;
    security: number;
    codeQuality: number;
    developerExperience: number;
    aiReadiness: number;
  };
  sections: {
    architecture: SectionAnalysis;
    performance: SectionAnalysis;
    security: SectionAnalysis;
    codeQuality: SectionAnalysis;
    database: SectionAnalysis;
    api: SectionAnalysis;
    uiux: SectionAnalysis;
    aiWorkflow: SectionAnalysis;
  };
  rootCauseTraces: RootCauseTrace[];
  dependencyGraph: { source: string; target: string; type: string }[];
}

export interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  line?: number;
  file?: string;
  suggestion?: string;
  confidence: number;
  rootCause?: string;
  impactedFiles?: string[];
  suggestedPatch?: string;
}

const ANALYSIS_PROMPT = `You are an expert code reviewer and AI code intelligence engine. Analyze the following code with extreme precision.

Return a JSON response (NO markdown fences, just raw JSON) with this exact structure:
{
  "score": <0-100 overall quality score>,
  "summary": "<2-3 sentence summary of the code quality>",
  "findings": [
    {
      "severity": "<critical|high|medium|low|info>",
      "category": "<Bug|Security|Performance|Style|Architecture|Reliability|Maintainability>",
      "title": "<short title>",
      "description": "<detailed explanation>",
      "line": <line number if applicable, null otherwise>,
      "suggestion": "<specific fix recommendation with code example>",
      "confidence": <0.0-1.0 confidence score>,
      "rootCause": "<root cause explanation if applicable>"
    }
  ],
  "metrics": {
    "performance": <0-100>,
    "security": <0-100>,
    "maintainability": <0-100>,
    "reliability": <0-100>
  }
}

Key analysis areas:
- Bugs: null references, type errors, race conditions, off-by-one errors
- Security: injection, XSS, exposed secrets, insecure crypto, auth issues
- Performance: N+1 queries, unnecessary re-renders, memory leaks, blocking operations
- Architecture: SOLID violations, circular dependencies, god classes, tight coupling
- Reliability: missing error handling, unvalidated inputs, edge cases
- Maintainability: code duplication, magic numbers, poor naming, missing types

Be specific with line numbers and provide actionable fix suggestions. Include code examples in suggestions.

CODE TO ANALYZE:
`;

export async function analyzeCode(code: string): Promise<AnalysisResult> {
  // Check cache
  const cacheKey = `analyze:${hashCode(code)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const result = await geminiModel.generateContent(ANALYSIS_PROMPT + code);
    let text = result.response.text();

    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      text = match[0];
    }

    const parsed = JSON.parse(text) as AnalysisResult;

    // Validate and normalize
    parsed.score = Math.max(0, Math.min(100, parsed.score || 50));
    parsed.metrics = {
      architecture: Math.max(0, Math.min(100, parsed.metrics?.architecture || 50)),
      performance: Math.max(0, Math.min(100, parsed.metrics?.performance || 50)),
      security: Math.max(0, Math.min(100, parsed.metrics?.security || 50)),
      codeQuality: Math.max(0, Math.min(100, parsed.metrics?.codeQuality || 50)),
      developerExperience: Math.max(0, Math.min(100, parsed.metrics?.developerExperience || 50)),
      aiReadiness: Math.max(0, Math.min(100, parsed.metrics?.aiReadiness || 50)),
    };
    parsed.findings = (parsed.findings || []).map((f) => ({
      ...f,
      confidence: f.confidence || 0.8,
      severity: f.severity || 'medium',
      category: f.category || 'General',
    }));

    setCache(cacheKey, parsed);
    return parsed;
  } catch (error: any) {
    // Handle specific Gemini errors
    if (error?.status === 429) {
      throw new Error('AI rate limit reached. Please wait a moment and try again.');
    }
    if (error instanceof SyntaxError) {
      // If Gemini returned invalid JSON, return a basic result
      return {
        score: 50,
        summary: 'Analysis completed with limited results due to AI response parsing issue.',
        findings: [{
          severity: 'info',
          category: 'General',
          title: 'Analysis Incomplete',
          description: 'The AI response could not be fully parsed. Please try again.',
          suggestion: 'Retry the analysis or simplify the code input.',
          confidence: 0.5,
        }],
        metrics: {
          architecture: 50,
          performance: 50,
          security: 50,
          codeQuality: 50,
          developerExperience: 50,
          aiReadiness: 50,
        },
      } as AnalysisResult;
    }
    throw error;
  }
}

const REPO_ANALYSIS_PROMPT = `You are a Senior AI Platform Engineer. Your task is to perform a DEEP repository-wide analysis on the provided file contents.
You MUST output a raw JSON object (NO markdown fences) with the exact structure:
{
  "score": <0-100 overall score>,
  "summary": "<holistic repository summary>",
  "metrics": { "architecture": <0-100>, "performance": <0-100>, "security": <0-100>, "codeQuality": <0-100>, "developerExperience": <0-100>, "aiReadiness": <0-100> },
  "sections": {
    "architecture": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "performance": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "security": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "codeQuality": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "database": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "api": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "uiux": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] },
    "aiWorkflow": { "score": <0-100>, "reasons": ["<reason1>", ...], "improvements": ["<improvement1>", ...] }
  },
  "rootCauseTraces": [
    { "bug": "<bug description>", "files": ["<file1>", "<file2>"], "explanation": "<why it happens>", "fix": "<exact code patch>" }
  ],
  "dependencyGraph": [
    { "source": "<file1>", "target": "<file2>", "type": "<import|call|state>" }
  ],
  "findings": []
}

Rules:
- Be brutally honest with scores.
- Provide highly actionable, technical 'improvements'.
- Trace bugs across multiple files in 'rootCauseTraces'.
- Map 'dependencyGraph' showing key component imports.
`;

export async function analyzeRepositoryContext(repoData: string): Promise<AnalysisResult> {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: REPO_ANALYSIS_PROMPT + '\n\nREPOSITORY CONTEXT:\n' + repoData }] }],
      generationConfig: { 
        responseMimeType: 'application/json',
        maxOutputTokens: 8192 
      }
    });
    let text = result.response.text();
    // Extract JSON object if there's conversational wrapper text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      text = match[0];
    }
    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error('===== GEMINI ANALYSIS ERROR =====', error);
    if (error?.status === 429 || error?.message?.includes('429')) {
      throw new Error('AI rate limit reached. Please try again later.');
    }
    
    // Fallback if parsing fails or 500 error
    return {
      score: 50,
      summary: `Analysis completed with limited results due to AI parsing issue. Error: ${error?.message || 'Unknown error'}. Wait a moment and try again.`,
      findings: [],
      metrics: { architecture: 50, performance: 50, security: 50, codeQuality: 50, developerExperience: 50, aiReadiness: 50 },
      sections: {
        architecture: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        performance: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        security: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        codeQuality: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        database: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        api: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        uiux: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] },
        aiWorkflow: { score: 50, reasons: ['Could not complete full analysis'], improvements: [] }
      },
      rootCauseTraces: [],
      dependencyGraph: []
    };
  }
}

// ===== Streaming Analysis =====
export async function analyzeCodeStream(code: string): Promise<ReadableStream> {
  const result = await geminiModel.generateContentStream(ANALYSIS_PROMPT + code);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// ===== Documentation Generation =====
export async function generateDocumentation(code: string, language: string = 'TypeScript'): Promise<string> {
  const cacheKey = `docs:${hashCode(code + language)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const prompt = `You are a technical documentation expert. Generate comprehensive, professional documentation for the following ${language} code.

Include:
1. **Overview** - What the code does and its purpose
2. **Installation/Setup** - If applicable
3. **API Reference** - Every function, class, method, interface with:
   - Parameters (type, description, required/optional)
   - Return values
   - Example usage
   - Error handling
4. **Architecture** - Code structure and design patterns used
5. **Dependencies** - External dependencies and their purpose
6. **Usage Examples** - Practical examples showing common use cases
7. **Notes** - Edge cases, limitations, performance considerations

Format in clean, professional Markdown with proper headings, tables, and code blocks.

CODE:
\`\`\`${language.toLowerCase()}
${code}
\`\`\``;

  const result = await geminiModel.generateContent(prompt);
  const documentation = result.response.text();
  setCache(cacheKey, documentation);
  return documentation;
}

// ===== Architecture Review =====
export async function reviewArchitecture(description: string): Promise<string> {
  const prompt = `You are a world-class software architect with deep expertise in distributed systems, cloud architecture, and modern application design.

Analyze the following project and generate a comprehensive architecture blueprint in Markdown format.

Include sections for: System Overview, Technology Stack, Frontend Architecture, Backend Services, Data Layer, Infrastructure, Security, Scalability, and Implementation Roadmap.

Be specific and opinionated. Use real technology names, versions, and include diagrams using Mermaid syntax where helpful.

PROJECT DESCRIPTION:
${description}`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

// ===== Patch Generation =====
export async function generatePatch(code: string, finding: { title: string; description: string; suggestion?: string }): Promise<string> {
  const prompt = `You are a code fixing expert. Generate a unified diff patch to fix the following issue.

ISSUE:
Title: ${finding.title}
Description: ${finding.description}
${finding.suggestion ? `Suggestion: ${finding.suggestion}` : ''}

ORIGINAL CODE:
\`\`\`
${code}
\`\`\`

Return ONLY the unified diff (with --- and +++ headers) showing the exact changes needed. No explanations before or after the diff.`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

// ===== Utility =====
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 1000); i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}
