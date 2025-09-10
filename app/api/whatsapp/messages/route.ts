import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Buscar mensagens do banco de dados
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Últimas 100 mensagens
    });

    return NextResponse.json({ 
      success: true, 
      messages: messages
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    
    // Fallback com dados demo se der erro
    const demoMessages = [
      {
        id: '1',
        recipientPhone: '11999999999',
        message: 'Olá! Como podemos te ajudar?',
        status: 'READ',
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
        cost: 0.05,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        recipientPhone: '11888888888',
        message: 'Sua candidatura foi aprovada!',
        status: 'DELIVERED',
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        readAt: null,
        cost: 0.05,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        recipientPhone: '11777777777',
        message: 'Lembrete: Reunião amanhã às 15h',
        status: 'SENT',
        sentAt: new Date().toISOString(),
        deliveredAt: null,
        readAt: null,
        cost: 0.05,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      success: true, 
      messages: demoMessages
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipientPhone, message, status = 'PENDING' } = await request.json();

    // Salvar mensagem no banco
    // Se foi enviada com sucesso, simular entrega após 2-5 segundos
    const finalStatus = status === 'SENT' ? 'DELIVERED' : status;
    const now = new Date();
    const deliveredTime = status === 'SENT' ? new Date(now.getTime() + 3000) : null; // +3 segundos

    const savedMessage = await prisma.whatsAppMessage.create({
      data: {
        candidateId: 'demo-candidate', // ID fixo para demo
        recipientPhone,
        message,
        status: finalStatus,
        cost: 0.05, // Custo fixo por mensagem
        sentAt: finalStatus !== 'PENDING' ? now : null,
        deliveredAt: ['DELIVERED', 'READ'].includes(finalStatus) ? (deliveredTime || now) : null,
        readAt: finalStatus === 'READ' ? new Date(now.getTime() + 10000) : null // +10 segundos para leitura
      }
    });

    return NextResponse.json({
      success: true,
      message: savedMessage
    });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar mensagem'
    }, { status: 500 });
  }
}