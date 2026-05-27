import { NextResponse } from 'next/server';
import { checkRateLimit, apiError, apiSuccess, getClientIP, sanitizeString } from '@/lib/api/middleware';

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`arch:${clientIP}`, { maxRequests: 5, windowMs: 60_000 });
    
    if (!rateLimit.allowed) {
      return apiError('Rate limit exceeded. Please wait before generating another architecture.', 429);
    }

    const body = await request.json();
    const description = body?.description;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return apiError('Project description is required', 400);
    }

    const sanitizedDescription = sanitizeString(description, 10_000);

    if (process.env.GEMINI_API_KEY) {
      try {
        const { geminiModel } = await import('@/lib/gemini/client');

        const prompt = `You are a world-class software architect. Based on the following project description, generate a comprehensive architecture blueprint.

PROJECT DESCRIPTION:
${description}

Generate a detailed architecture document in Markdown format that includes ALL of the following sections:

# 🏗️ Architecture Blueprint

## 1. System Overview
Provide a high-level description of the proposed architecture. Include the architectural style (monolithic, microservices, serverless, event-driven, etc.) and why it's the best fit.

## 2. Frontend Layer
- Framework recommendation with justification
- State management approach
- Routing strategy
- Styling/UI framework
- SSR/SSG considerations

## 3. API & Backend Services
- API architecture (REST, GraphQL, gRPC, etc.)
- Service decomposition (what services and their responsibilities)
- Authentication & authorization approach
- API gateway or edge middleware

## 4. Data Storage
- Primary database (with justification)
- Caching layer (Redis, Memcached, etc.)
- File/blob storage
- Search engine (if needed)
- Data modeling approach

## 5. Infrastructure & DevOps
- Cloud provider recommendation
- Containerization strategy
- CI/CD pipeline design
- Monitoring & observability
- Logging strategy
- Infrastructure as Code

## 6. Scalability & Performance
- Horizontal vs vertical scaling strategy
- Load balancing approach
- CDN strategy
- Connection pooling
- Rate limiting
- Performance bottlenecks to watch

## 7. Security Architecture
- Authentication flow (OAuth, JWT, sessions)
- Authorization model (RBAC, ABAC)
- Data encryption (at rest, in transit)
- API security best practices
- OWASP top 10 mitigations

## 8. Technology Stack Summary
Create a table with columns: Layer | Technology | Purpose | Alternative

## 9. Implementation Roadmap
Provide a phased implementation plan:
- Phase 1: MVP (2-4 weeks)
- Phase 2: Core Features (4-8 weeks)
- Phase 3: Scale & Polish (8-12 weeks)

## 10. Cost Estimation
Provide rough monthly cost estimates for:
- Development/Staging
- Production (low traffic)
- Production (high traffic)

Be specific and opinionated. Use real technology names and versions. Include code examples for key configurations where helpful. Format everything in clean, professional Markdown with tables and bullet points.`;

        const result = await geminiModel.generateContent(prompt);
        const architecture = result.response.text();

        return apiSuccess({ architecture });
      } catch (aiError: any) {
        console.error('AI architecture generation error:', aiError);

        // If rate limited, provide a helpful message
        if (aiError?.status === 429) {
          return apiError('AI rate limit reached. Please wait a moment and try again.', 429);
        }
        // Fall through to fallback
      }
    }

    // Fallback: Generate without AI
    const architecture = generateFallbackArchitecture(description);
    return apiSuccess({ architecture });

  } catch (error) {
    console.error('Architecture error:', error);
    return apiError('Internal server error', 500);
  }
}

function generateFallbackArchitecture(description: string): string {
  const descLower = description.toLowerCase();

  const hasEcommerce = descLower.includes('ecommerce') || descLower.includes('e-commerce') || descLower.includes('shop') || descLower.includes('store');
  const hasRealtime = descLower.includes('realtime') || descLower.includes('real-time') || descLower.includes('websocket') || descLower.includes('chat');
  const hasAI = descLower.includes('ai') || descLower.includes('machine learning') || descLower.includes('ml');
  const hasAPI = descLower.includes('api') || descLower.includes('microservice');

  const framework = hasRealtime ? 'Next.js with WebSocket support' : 'Next.js (React)';
  const db = hasEcommerce ? 'PostgreSQL (managed via Supabase or AWS RDS)' : 'PostgreSQL or MongoDB';
  const cache = hasRealtime ? 'Redis (pub/sub + caching)' : 'Redis for session & data caching';

  return `# 🏗️ Architecture Blueprint

> **Generated for:** ${description.substring(0, 100)}...
>
> *Note: For AI-powered detailed analysis, configure your Gemini API key.*

## 1. System Overview
Based on your requirements, a **${hasAPI ? 'microservices' : 'modular monolith'}** architecture is recommended. This provides a good balance of simplicity and scalability for your use case.

## 2. Frontend Layer
| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | **${framework}** | SSR support, excellent DX, large ecosystem |
| State | **Zustand or Redux Toolkit** | Lightweight, TypeScript-friendly |
| Styling | **Tailwind CSS** | Utility-first, rapid prototyping |
| Hosting | **Vercel** | Zero-config Next.js deployment |

## 3. Backend Services
- **API Style:** REST with OpenAPI spec
- **Runtime:** Node.js with Express or NestJS
- **Auth:** Firebase Auth or NextAuth.js for JWT-based authentication
${hasRealtime ? '- **WebSockets:** Socket.io for real-time features' : ''}
${hasAI ? '- **AI Pipeline:** Python FastAPI service for ML workloads' : ''}

## 4. Data Storage
- **Primary Database:** ${db}
- **Caching:** ${cache}
- **File Storage:** AWS S3 or Cloudflare R2
${hasEcommerce ? '- **Search:** Algolia or Elasticsearch for product search' : ''}

## 5. Infrastructure
- **Cloud:** AWS or GCP
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Datadog or Grafana Cloud

## 6. Scalability
- Horizontal scaling with container orchestration
- CDN for static assets (Cloudflare/Vercel Edge)
- Database connection pooling
- API rate limiting with Redis

## 7. Security
- HTTPS everywhere (TLS 1.3)
- JWT with refresh token rotation
- CORS configuration
- Input validation & sanitization
- SQL injection prevention via ORM
- Rate limiting per IP/user

## 8. Implementation Roadmap
1. **Phase 1 (Weeks 1-4):** Core backend + auth + basic UI
2. **Phase 2 (Weeks 5-8):** Feature development + integrations
3. **Phase 3 (Weeks 9-12):** Testing, optimization, deployment

---
*Configure your GEMINI_API_KEY for a comprehensive AI-generated architecture analysis.*`;
}
