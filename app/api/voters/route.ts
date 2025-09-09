import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Immediate return for build time
  return NextResponse.json({ 
    success: true, 
    voters: []
  });
}

export async function POST(request: NextRequest) {
  // Immediate return for build time
  return NextResponse.json({ 
    success: false, 
    error: 'Build time - voter creation not available'
  }, { status: 400 });
}