import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Build time check - return immediately if likely build time
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL && !process.env.PGDATABASE) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  // Dynamic import para evitar erros durante build
  try {
    console.log('🔐 Iniciando processo de login...');
    const AuthService = (await import('@/lib/auth')).default;
    console.log('✅ AuthService importado com sucesso');
    
    const { email, password } = await request.json();
    console.log('📧 Email recebido:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter IP e User Agent para auditoria
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('🔍 Chamando AuthService.login...');
    const result = await AuthService.login(
      { email, password },
      ipAddress,
      userAgent
    );
    console.log('📊 Resultado do login:', { success: result.success, error: result.error });

    if (!result.success) {
      console.log('❌ Login falhou:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    console.log('✅ Login bem-sucedido para:', result.user?.email);

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

  } catch (error: any) {
    console.error('💥 Erro crítico na API de login:', error);
    console.error('🔍 Stack trace:', error?.stack);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}