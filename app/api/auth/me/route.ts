import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Build time check - return immediately if likely build time
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL && !process.env.PGDATABASE) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  // Dynamic import para evitar erros durante build
  try {
    const authService = (await import('@/lib/auth')).default;
    
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const result = await authService.verifyToken(token);

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