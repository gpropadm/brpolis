import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Safe Prisma client initialization
let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  prisma = {} as PrismaClient;
}

export async function GET(request: NextRequest) {
  // Early return for build-time analysis
  if (process.env.VERCEL_ENV === 'preview' || process.env.CI === 'true') {
    return NextResponse.json({ error: 'Build time - route not available' }, { status: 503 });
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
    const insights = await prisma.aIInsight.findMany({
      where: { 
        candidateId: authResult.user.id 
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }).catch((dbError) => {
      console.error('Database error:', dbError);
      return [];
    });

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