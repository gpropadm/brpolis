const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createInitialUser() {
  try {
    console.log('🚀 Criando usuário inicial...');
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('candidato123', 10);
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'candidato@exemplo.com' }
    });
    
    if (existingUser) {
      console.log('✅ Usuário já existe:', existingUser.email);
      return;
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
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Senha: candidato123');
    console.log('👤 Nome:', user.name);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialUser();