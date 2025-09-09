import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth';
import whatsappService from '@/lib/whatsapp';

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

    // Verificar se Evolution está configurado
    if (!whatsappService.isEvolutionConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Evolution API não configurada'
      }, { status: 400 });
    }

    // Obter QR Code para conectar
    const result = await whatsappService.getEvolutionQRCode();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      qrCode: result.qrCode,
      instructions: [
        '1. Abra o WhatsApp no seu celular',
        '2. Vá em Configurações > Aparelhos conectados',
        '3. Toque em "Conectar um aparelho"',
        '4. Escaneie o QR Code abaixo'
      ]
    });

  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

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

    // Criar nova instância Evolution
    const result = await whatsappService.createEvolutionInstance();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Instância criada com sucesso',
      qrCode: result.qrCode
    });

  } catch (error) {
    console.error('Erro ao criar instância:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}