import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth';
import whatsappService from '@/lib/whatsapp';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const authResult = await authService.verifyToken(token);
    
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { recipients, message } = body;

    if (!recipients || !message) {
      return NextResponse.json({ 
        error: 'Destinatários e mensagem são obrigatórios' 
      }, { status: 400 });
    }

    // Processar lista de destinatários
    const phoneNumbers = recipients
      .split('\n')
      .map((phone: string) => phone.trim())
      .filter((phone: string) => phone.length > 0);

    if (phoneNumbers.length === 0) {
      return NextResponse.json({ 
        error: 'Nenhum destinatário válido fornecido' 
      }, { status: 400 });
    }

    // Verificar se o usuário tem plano que permite WhatsApp
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      include: { plan: true }
    });

    if (!user?.plan) {
      return NextResponse.json({ 
        error: 'Plano necessário para enviar mensagens WhatsApp' 
      }, { status: 403 });
    }

    // Verificar limite de mensagens do plano
    const messagesSentThisMonth = await prisma.whatsAppMessage.count({
      where: {
        candidateId: authResult.user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    if (messagesSentThisMonth + phoneNumbers.length > user.plan.maxMessages) {
      return NextResponse.json({ 
        error: `Limite de mensagens do plano excedido. Limite: ${user.plan.maxMessages}, já enviadas: ${messagesSentThisMonth}` 
      }, { status: 403 });
    }

    const results = [];

    // Enviar mensagens via WhatsApp Business API
    for (const phone of phoneNumbers) {
      try {
        const sendResult = await whatsappService.sendMessage({
          to: whatsappService.formatPhoneNumber(phone),
          text: message
        });
        
        // Salvar mensagem no banco
        const status = sendResult.success ? (sendResult.status || 'SENT') : 'FAILED';
        const whatsappMessage = await prisma.whatsAppMessage.create({
          data: {
            candidateId: authResult.user.id,
            recipientPhone: phone,
            message: message,
            status: status.toUpperCase() as any,
            cost: 0.05, // Custo padrão por mensagem WhatsApp
            sentAt: sendResult.success ? new Date() : null,
            deliveredAt: ['DELIVERED', 'READ'].includes(status.toUpperCase()) ? new Date() : null,
            readAt: status.toUpperCase() === 'READ' ? new Date() : null
          }
        });

        results.push({
          phone,
          status: status,
          messageId: whatsappMessage.id,
          whatsappMessageId: sendResult.messageId
        });
      } catch (error) {
        console.error(`Erro ao enviar para ${phone}:`, error);
        
        // Salvar mensagem com erro no banco
        try {
          await prisma.whatsAppMessage.create({
            data: {
              candidateId: authResult.user.id,
              recipientPhone: phone,
              message: message,
              status: 'FAILED',
              cost: 0,
              sentAt: null,
              deliveredAt: null,
              readAt: null
            }
          });
        } catch (dbError) {
          console.error('Erro ao salvar mensagem falha:', dbError);
        }

        results.push({
          phone,
          status: 'FAILED',
          error: 'Erro interno'
        });
      }
    }

    const successCount = results.filter(r => r.status !== 'FAILED').length;
    const failedCount = results.filter(r => r.status === 'FAILED').length;

    return NextResponse.json({ 
      success: true, 
      message: `Envio concluído: ${successCount} sucessos, ${failedCount} falhas`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failedCount
      }
    });

  } catch (error) {
    console.error('Erro ao enviar mensagens WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}