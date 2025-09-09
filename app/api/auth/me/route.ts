import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const result = await AuthService.verifyToken(token);

    if (!result.valid) {
      const response = NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
      
      // Remove cookie inválido
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('Erro na verificação de usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}