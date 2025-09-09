import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Immediate return for build time
  return NextResponse.json(
    { success: false, error: 'Build time - login not available' },
    { status: 200 }
  );
}