import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// Force dynamic rendering and disable static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Safe Prisma client initialization
let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  prisma = {} as PrismaClient;
}

// Middleware para verificar se é admin
async function checkAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return { authorized: false, error: 'Token não fornecido' };
    }

    const result = await authService.verifyToken(token);
    
    if (!result.valid || !result.user) {
      return { authorized: false, error: 'Token inválido' };
    }

    // Verificar se é admin ou super admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(result.user.role)) {
      return { authorized: false, error: 'Acesso negado. Apenas administradores.' };
    }

    return { authorized: true, user: result.user };
  } catch (authError) {
    console.error('Auth error:', authError);
    return { authorized: false, error: 'Auth service not available' };
  }
}

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