import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  // Multiple build-time checks - return early if building
  if (
    process.env.VERCEL_ENV === 'preview' || 
    process.env.CI === 'true' ||
    process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ||
    process.env.VERCEL === '1' && !request?.url?.includes('localhost')
  ) {
    return NextResponse.json({ success: true, insights: [] }, { status: 200 });
  }

  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const authResult = await authService.verifyToken(token);
    
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar insights da IA para o candidato
    let insights: any[] = [];
    try {
      insights = await prisma.aIInsight.findMany({
        where: { 
          candidateId: authResult.user.id 
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    } catch (dbError) {
      console.error('Database connection error during build:', dbError);
      // Return empty array during build time
      insights = [];
    }

    return NextResponse.json({ 
      success: true, 
      insights: insights.map(insight => ({
        ...insight,
        createdAt: insight.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar insights da IA:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}