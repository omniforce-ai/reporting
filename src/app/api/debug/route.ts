export async function GET() {
  try {
    return Response.json({ 
      status: 'ok',
      timestamp: Date.now(),
      nodeVersion: process.version,
    });
  } catch (error) {
    return Response.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

