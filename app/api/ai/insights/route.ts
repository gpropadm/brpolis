import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering and disable static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Immediate return for build time
  return NextResponse.json({ 
    success: true, 
    insights: []
  }, { status: 200 });
}