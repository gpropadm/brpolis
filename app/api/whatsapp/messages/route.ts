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

    // Buscar mensagens do WhatsApp do candidato
    const messages = await prisma.whatsAppMessage.findMany({
      where: { 
        candidateId: authResult.user.id 
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ 
      success: true, 
      messages: messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
        sentAt: msg.sentAt?.toISOString(),
        deliveredAt: msg.deliveredAt?.toISOString(),
        readAt: msg.readAt?.toISOString(),
        respondedAt: msg.respondedAt?.toISOString()
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}