export async function GET() {
  try {
    return Response.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return Response.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

