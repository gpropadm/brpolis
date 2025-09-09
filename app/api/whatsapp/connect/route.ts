import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Build time check
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL && !process.env.PGDATABASE) {
    return NextResponse.json(
      { success: false, error: 'WhatsApp service not available during build' },
      { status: 503 }
    );
  }

  try {
    // Dynamic import para evitar erros durante build
    const BaileysService = (await import('@/lib/baileys-service')).default;
    
    console.log('🔌 Iniciando conexão WhatsApp...');
    
    const result = await BaileysService.connect();
    
    if (result.success) {
      console.log('✅ WhatsApp conectando... QR Code disponível');
    }
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erro na conexão WhatsApp:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Build time check
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL && !process.env.PGDATABASE) {
    return NextResponse.json(
      { success: false, error: 'WhatsApp service not available during build' },
      { status: 503 }
    );
  }

  try {
    // Dynamic import para evitar erros durante build
    const BaileysService = (await import('@/lib/baileys-service')).default;
    
    const status = BaileysService.getConnectionStatus();
    const qrCode = BaileysService.getQRCode();
    
    return NextResponse.json({
      success: true,
      connected: status.connected,
      status: status.status,
      qrCode: qrCode
    });

  } catch (error: any) {
    console.error('❌ Erro ao verificar status WhatsApp:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}