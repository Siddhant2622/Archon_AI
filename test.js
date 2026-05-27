fetch('http://localhost:3000/api/analyze/repository', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repoFullName: 'Siddhant2622/Career_Curator',
    defaultBranch: 'main',
    files: [{ path: 'stitch/index.html' }, { path: 'stitch/server.js' }]
  })
}).then(res => res.json()).then(console.log).catch(console.error);
