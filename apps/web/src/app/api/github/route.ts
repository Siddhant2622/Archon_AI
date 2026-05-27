import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoUrl = searchParams.get('url');
  const usernameParam = searchParams.get('username');

  if (!repoUrl && !usernameParam) {
    return NextResponse.json({ error: 'Repository URL or GitHub username is required' }, { status: 400 });
  }

  let targetUrl = repoUrl;
  let username = usernameParam;

  // Auto-detect if username parameter is actually a repository URL
  if (username && (username.includes('github.com') || username.includes('/'))) {
    targetUrl = username;
    username = null;
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (process.env.GITHUB_TOKEN) {
    const token = process.env.GITHUB_TOKEN.replace(/^"|"$/g, '');
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle repository URL query
  if (targetUrl) {
    try {
      let cleanUrl = targetUrl.trim();
      if (cleanUrl.startsWith('http://')) cleanUrl = cleanUrl.replace('http://', '');
      if (cleanUrl.startsWith('https://')) cleanUrl = cleanUrl.replace('https://', '');
      if (cleanUrl.startsWith('github.com/')) cleanUrl = cleanUrl.replace('github.com/', '');
      
      const urlParts = cleanUrl.split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];

      if (!owner || !repo) {
        return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: 'Repository not found or is private' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to fetch repository data from GitHub' }, { status: response.status });
      }

      const data = await response.json();
      
      // Construct a response object compatible with both single repo fetches and search result lists
      return NextResponse.json({
        name: data.name,
        full_name: data.full_name,
        description: data.description || "No description provided.",
        language: data.language || "Unknown",
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
        default_branch: data.default_branch,
        updated_at: data.updated_at,
        html_url: data.html_url,
        private: data.private,
        data: {
          repos: [{
            id: data.id,
            name: data.name,
            full_name: data.full_name,
            description: data.description || "No description provided.",
            language: data.language || "Unknown",
            stargazers_count: data.stargazers_count,
            forks_count: data.forks_count,
            default_branch: data.default_branch,
            updated_at: data.updated_at,
            html_url: data.html_url,
            private: data.private,
          }]
        }
      });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // Handle username repositories query
  if (username) {
    try {
      const cleanUsername = username.trim();
      const response = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to fetch repositories for this user' }, { status: response.status });
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'Unexpected response from GitHub' }, { status: 500 });
      }

      const repos = data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
        private: repo.private,
      }));

      return NextResponse.json({
        data: {
          repos
        }
      });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
