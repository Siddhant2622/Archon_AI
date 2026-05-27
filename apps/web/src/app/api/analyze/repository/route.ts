import { NextResponse } from 'next/server';
import { analyzeRepositoryContext } from '@/lib/gemini/client';

export async function POST(request: Request) {
  try {
    const { repoFullName, defaultBranch, files } = await request.json();

    if (!repoFullName || !defaultBranch || !files) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Limit to max 40 most important files
    const priorityFiles = files
      .filter((f: any) => {
        const p = f.path.toLowerCase();
        return p.includes('package.json') || p.includes('tsconfig') || p.includes('next.config') || 
               p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.jsx') || 
               p.endsWith('.py') || p.endsWith('.go') || p.endsWith('.rs') || 
               p.endsWith('.html') || p.endsWith('.css') || p.endsWith('.java');
      })
      .sort((a: any, b: any) => {
        // Prioritize config and main files
        const aScore = a.path.includes('package.json') || a.path.includes('config') ? 10 : 0;
        const bScore = b.path.includes('package.json') || b.path.includes('config') ? 10 : 0;
        return bScore - aScore;
      })
      .slice(0, 40);

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3.raw',
    };
    if (process.env.GITHUB_TOKEN) {
      const token = process.env.GITHUB_TOKEN.replace(/^"|"$/g, '');
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fileContentsPromises = priorityFiles.map(async (file: any) => {
      try {
        // Try raw.githubusercontent.com first (bypasses standard API limits)
        let url = `https://raw.githubusercontent.com/${repoFullName}/${defaultBranch}/${file.path}`;
        let res = await fetch(url, { headers });
        
        // If it fails (maybe it's a private repo and raw doesn't accept the token format as easily), fallback to API
        if (!res.ok) {
           res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${file.path}?ref=${defaultBranch}`, { headers });
           if (!res.ok) {
             const errText = await res.text();
             console.error(`Failed to fetch ${file.path}:`, res.status, errText);
             return null;
           }
        }
        const content = await res.text();
        return `\n--- FILE: ${file.path} ---\n${content.substring(0, 50000)}`; // limit per file
      } catch (err) {
        console.error(`Error fetching ${file.path}:`, err);
        return null;
      }
    });

    const fileContents = (await Promise.all(fileContentsPromises)).filter(Boolean);
    const repoContext = fileContents.join('\n');

    if (repoContext.length === 0) {
      return NextResponse.json({ error: 'Could not fetch any file contents for analysis' }, { status: 400 });
    }

    const result = await analyzeRepositoryContext(repoContext);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Repository Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
