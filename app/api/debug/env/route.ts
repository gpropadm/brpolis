import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verificar variáveis de ambiente disponíveis
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL_NO_SSL: !!process.env.POSTGRES_URL_NO_SSL,
    POSTGRES_DATABASE: !!process.env.POSTGRES_DATABASE,
    PGHOST_UNPOOLED: !!process.env.PGHOST_UNPOOLED,
    PGUSER: !!process.env.PGUSER,
    PGPASSWORD: !!process.env.PGPASSWORD,
    PGDATABASE: !!process.env.PGDATABASE,
    POSTGRES_HOST: !!process.env.POSTGRES_HOST,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV
  };

  return NextResponse.json(envVars);
}