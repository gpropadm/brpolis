import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const authResult = await authService.verifyToken(token);
    
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar campanhas do candidato
    const campaigns = await prisma.campaign.findMany({
      where: { 
        candidateId: authResult.user.id 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      campaigns: campaigns.map(campaign => ({
        ...campaign,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString()
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}