import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Build time check
  if (process.env.VERCEL_ENV && !process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL) {
    return NextResponse.json(
      { success: false, error: 'Build time - login not available' },
      { status: 200 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter IP e User Agent para auditoria
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await AuthService.login(
      { email, password },
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // Criar response com cookie httpOnly
    const response = NextResponse.json({
      success: true,
      user: result.user
    });

    // Definir cookie com token
    response.cookies.set('auth_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Erro na API de login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}