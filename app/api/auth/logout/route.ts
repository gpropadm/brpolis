import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import AuthService from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      await AuthService.logout(token);
    }

    const response = NextResponse.json({ success: true });
    
    // Remover cookie de autenticação
    response.cookies.delete('auth_token');

    return response;

  } catch (error) {
    console.error('Erro na API de logout:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}