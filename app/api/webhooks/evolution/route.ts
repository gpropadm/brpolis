import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('📱 Webhook Evolution API recebido:', {
      event: data.event,
      instance: data.instance,
      timestamp: new Date().toISOString(),
      data: data.data
    });

    // Processar diferentes tipos de eventos
    switch (data.event) {
      case 'MESSAGES_UPSERT':
        console.log('📨 Nova mensagem recebida:', data.data);
        // Aqui você pode processar mensagens recebidas
        // Exemplo: salvar no banco, responder automaticamente, etc.
        break;

      case 'MESSAGES_UPDATE':
        console.log('📋 Status da mensagem atualizado:', data.data);
        // Processar updates de status (entregue, lido, etc.)
        break;

      case 'PRESENCE_UPDATE':
        console.log('👤 Presença atualizada:', data.data);
        // Processar updates de presença (online, offline, typing, etc.)
        break;

      case 'CONNECTION_UPDATE':
        console.log('🔌 Status de conexão atualizado:', data.data);
        // Processar mudanças na conexão
        break;

      case 'SEND_MESSAGE':
        console.log('📤 Mensagem enviada:', data.data);
        // Processar confirmação de envio
        break;

      default:
        console.log('❓ Evento desconhecido:', data.event);
    }

    // Responder com sucesso para confirmar recebimento
    return NextResponse.json({
      success: true,
      message: 'Webhook processado com sucesso',
      event: data.event,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar webhook'
    }, { status: 500 });
  }
}

// Permitir GET para teste
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Endpoint de webhook Evolution API está ativo',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}