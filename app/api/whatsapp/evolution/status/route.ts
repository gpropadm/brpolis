import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
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
        error: 'Evolution API não configurada',
        configured: false
      });
    }

    // Verificar status da instância
    const isActive = await whatsappService.checkEvolutionStatus();

    return NextResponse.json({
      success: true,
      configured: true,
      active: isActive,
      status: isActive ? 'connected' : 'disconnected'
    });

  } catch (error) {
    console.error('Erro ao verificar status Evolution:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}