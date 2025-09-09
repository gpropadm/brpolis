import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST() {
  // Build time check
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL && !process.env.PGDATABASE) {
    return NextResponse.json(
      { success: false, error: 'WhatsApp service not available during build' },
      { status: 503 }
    );
  }

  // Para demo: simular conexão bem-sucedida
  return NextResponse.json({
    success: true,
    status: 'demo',
    message: 'Demo mode - WhatsApp simulation active'
  });
}

export async function GET() {
  // Build time check
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL_NO_SSL && !process.env.PGDATABASE) {
    return NextResponse.json(
      { success: false, error: 'WhatsApp service not available during build' },
      { status: 503 }
    );
  }

  // Para demo: simular status conectado
  return NextResponse.json({
    success: true,
    connected: true,
    status: 'demo',
    message: 'Demo mode active - ready to send messages'
  });
}