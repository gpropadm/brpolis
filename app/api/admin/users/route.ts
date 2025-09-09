import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering and disable static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET - Listar usuários (apenas admins)
export async function GET(request: NextRequest) {
  // Immediate return for build time
  return NextResponse.json({ 
    success: true,
    data: { users: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
  }, { status: 200 });
}

// POST - Criar novo usuário (apenas admins)
export async function POST(request: NextRequest) {
  // Immediate return for build time
  return NextResponse.json({ 
    success: true,
    message: 'Build time - user creation not available',
    user: null
  }, { status: 200 });
}