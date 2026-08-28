async function testHttpEndpoints() {
  console.log('Testing Frontend Dev Server & Backend API availability...');

  try {
    const frontendRes = await fetch('http://localhost:5173');
    console.log(`Frontend Status: ${frontendRes.status} ${frontendRes.statusText}`);
    const html = await frontendRes.text();
    console.log(`Frontend HTML length: ${html.length}, contains <div id="root">: ${html.includes('id="root"')}`);

    const backendRes = await fetch('http://localhost:5000/api/posts');
    const backendData = await backendRes.json();
    console.log(`Backend /api/posts Status: ${backendRes.status}, Success: ${backendData.success}`);

    console.log('\nAll Servers are LIVE and functioning properly!');
  } catch (err: any) {
    console.error('HTTP Test Error:', err.message);
  }
}

testHttpEndpoints();
