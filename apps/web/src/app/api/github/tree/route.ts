import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get('repo'); // e.g. "owner/repo"

  if (!repoFullName) {
    return NextResponse.json({ error: 'Repository full name is required (owner/repo)' }, { status: 400 });
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (process.env.GITHUB_TOKEN) {
    const token = process.env.GITHUB_TOKEN.replace(/^"|"$/g, '');
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers });
    if (!repoRes.ok) {
      const errorText = await repoRes.text();
      let errorMsg = 'Failed to fetch repository metadata';
      try { errorMsg = JSON.parse(errorText).message || errorMsg; } catch (e) {}
      
      if (repoRes.status === 404) return NextResponse.json({ error: 'Repository not found. If it is private, please add GITHUB_TOKEN to .env.local' }, { status: 404 });
      if (repoRes.status === 403 && errorMsg.toLowerCase().includes('rate limit')) {
        return NextResponse.json({ error: 'GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to .env.local' }, { status: 403 });
      }
      throw new Error(errorMsg);
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;

    // 2. Fetch the git tree recursively
    const treeRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!treeRes.ok) {
      const errorText = await treeRes.text();
      let errorMsg = 'Failed to fetch repository tree';
      try { errorMsg = JSON.parse(errorText).message || errorMsg; } catch (e) {}
      if (treeRes.status === 403 && errorMsg.toLowerCase().includes('rate limit')) {
        return NextResponse.json({ error: 'GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to .env.local' }, { status: 403 });
      }
      throw new Error(errorMsg);
    }
    const treeData = await treeRes.json();

    // 3. Filter only interesting files (ignore binaries, large build folders, etc.)
    const ignoreList = [
      '.jpg', '.png', '.gif', '.ico', '.svg', '.mp4', '.mp3', '.pdf', '.zip', '.tar', '.gz', 
      'node_modules/', 'dist/', 'build/', '.next/', 'coverage/', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
    ];

    const files = treeData.tree
      .filter((item: any) => item.type === 'blob')
      .map((item: any) => ({
        path: item.path,
        size: item.size,
        url: item.url,
      }))
      .filter((file: any) => !ignoreList.some(ignore => file.path.includes(ignore) || file.path.endsWith(ignore)));

    return NextResponse.json({
      defaultBranch,
      files,
    });
  } catch (error: any) {
    console.error('GitHub API Tree Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
