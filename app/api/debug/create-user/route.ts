import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import para evitar erros durante build
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    
    const prisma = new PrismaClient();
    
    // Hash da senha
    const hashedPassword = await bcrypt.default.hash('candidato123', 10);
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'candidato@exemplo.com' }
    });
    
    if (existingUser) {
      await prisma.$disconnect();
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário já existe',
        user: {
          email: existingUser.email,
          name: existingUser.name
        }
      });
    }
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: 'candidato@exemplo.com',
        password: hashedPassword,
        name: 'Candidato Exemplo',
        role: 'CANDIDATE',
        politicalRole: 'MAYOR',
        state: 'SP',
        city: 'São Paulo',
        party: 'INDEPENDENTE',
        phone: '(11) 99999-9999',
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário criado com sucesso!',
      user: {
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}