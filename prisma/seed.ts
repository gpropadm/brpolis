// 🌱 BRPolis - Seed do Banco de Dados

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco BRPolis...');

  // Criar planos
  console.log('📦 Criando planos...');
  
  const planBasico = await prisma.plan.upsert({
    where: { name: 'Básico' },
    update: {},
    create: {
      name: 'Básico',
      description: 'Plano básico para candidatos iniciantes',
      price: 297.00,
      maxVoters: 5000,
      maxMessages: 10000,
      maxCampaigns: 2,
      hasAI: false,
      hasAdvancedAnalytics: false,
      hasApi: false,
      features: JSON.stringify({
        crm: true,
        whatsapp: true,
        analytics: 'basic',
        support: 'email'
      })
    }
  });

  const planProfissional = await prisma.plan.upsert({
    where: { name: 'Profissional' },
    update: {},
    create: {
      name: 'Profissional',
      description: 'Plano completo para candidatos sérios',
      price: 597.00,
      maxVoters: 25000,
      maxMessages: 50000,
      maxCampaigns: 5,
      hasAI: true,
      hasAdvancedAnalytics: true,
      hasApi: false,
      features: JSON.stringify({
        crm: true,
        whatsapp: true,
        analytics: 'advanced',
        ai: true,
        geolocation: true,
        support: 'priority'
      })
    }
  });

  const planEnterprise = await prisma.plan.upsert({
    where: { name: 'Enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      description: 'Plano premium para grandes campanhas',
      price: 1297.00,
      maxVoters: 100000,
      maxMessages: 200000,
      maxCampaigns: 99999,
      hasAI: true,
      hasAdvancedAnalytics: true,
      hasApi: true,
      features: JSON.stringify({
        crm: true,
        whatsapp: true,
        analytics: 'premium',
        ai: true,
        geolocation: true,
        api: true,
        whitelabel: true,
        support: '24/7'
      })
    }
  });

  console.log('✅ Planos criados:', { planBasico: planBasico.name, planProfissional: planProfissional.name, planEnterprise: planEnterprise.name });

  // Criar Super Admin
  console.log('👑 Criando Super Administrador...');
  
  const hashedPassword = await bcrypt.hash('BRPolis@2025!', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@brpolis.com' },
    update: {},
    create: {
      email: 'admin@brpolis.com',
      password: hashedPassword,
      name: 'Super Administrador BRPolis',
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    }
  });

  console.log('✅ Super Admin criado:', superAdmin.email);

  // Criar Admin de vendas
  console.log('🏢 Criando Administrador de Vendas...');
  
  const salesHashedPassword = await bcrypt.hash('Vendas@2025!', 12);
  
  const salesAdmin = await prisma.user.upsert({
    where: { email: 'vendas@brpolis.com' },
    update: {},
    create: {
      email: 'vendas@brpolis.com',
      password: salesHashedPassword,
      name: 'Administrador de Vendas',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      createdBy: superAdmin.id,
    }
  });

  console.log('✅ Admin de vendas criado:', salesAdmin.email);

  // Criar candidato de exemplo
  console.log('🗳️ Criando candidato de exemplo...');
  
  const candidatePassword = await bcrypt.hash('candidato123', 12);
  
  const candidate = await prisma.user.upsert({
    where: { email: 'candidato@exemplo.com' },
    update: {},
    create: {
      email: 'candidato@exemplo.com',
      password: candidatePassword,
      name: 'João Silva',
      role: 'CANDIDATE',
      politicalRole: 'MAYOR',
      state: 'SP',
      city: 'São Paulo',
      party: 'NOVO',
      phone: '(11) 99999-9999',
      planId: planProfissional.id,
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      createdBy: salesAdmin.id,
    }
  });

  console.log('✅ Candidato de exemplo criado:', candidate.email);

  // Criar alguns eleitores de exemplo para o candidato
  console.log('👥 Criando eleitores de exemplo...');
  
  const voters = await Promise.all([
    prisma.voter.upsert({
      where: { cpf: '12345678901' },
      update: {},
      create: {
        candidateId: candidate.id,
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 88888-8888',
        cpf: '12345678901',
        gender: 'FEMALE',
        status: 'SUPPORTER',
        score: 85,
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Centro',
        zone: '001',
        section: '0001',
        interests: JSON.stringify(['educacao', 'saude', 'seguranca'])
      }
    }),
    prisma.voter.upsert({
      where: { cpf: '98765432109' },
      update: {},
      create: {
        candidateId: candidate.id,
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        phone: '(11) 77777-7777',
        cpf: '98765432109',
        gender: 'MALE',
        status: 'POTENTIAL',
        score: 65,
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Vila Madalena',
        zone: '002',
        section: '0015',
        interests: JSON.stringify(['emprego', 'transporte', 'meio-ambiente'])
      }
    }),
    prisma.voter.upsert({
      where: { cpf: '11122233344' },
      update: {},
      create: {
        candidateId: candidate.id,
        name: 'Ana Oliveira',
        email: 'ana@email.com',
        phone: '(11) 66666-6666',
        cpf: '11122233344',
        gender: 'FEMALE',
        status: 'UNDECIDED',
        score: 40,
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Mooca',
        zone: '003',
        section: '0030',
        interests: JSON.stringify(['habitacao', 'cultura', 'economia'])
      }
    })
  ]);

  console.log('✅ Eleitores de exemplo criados:', voters.length);

  // Criar campanha de exemplo
  console.log('📢 Criando campanha de exemplo...');
  
  const campaign = await prisma.campaign.upsert({
    where: { id: 'sample-campaign-id' },
    update: {},
    create: {
      id: 'sample-campaign-id',
      candidateId: candidate.id,
      name: 'Campanha Prefeito 2024',
      description: 'Campanha para prefeito de São Paulo 2024',
      politicalRole: 'MAYOR',
      state: 'SP',
      city: 'São Paulo',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
      budget: 500000.00,
      status: 'ACTIVE'
    }
  });

  console.log('✅ Campanha de exemplo criada:', campaign.name);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais criadas:');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│ 👑 SUPER ADMIN                              │');
  console.log('│ Email: admin@brpolis.com                    │');
  console.log('│ Senha: BRPolis@2025!                        │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│ 🏢 ADMIN VENDAS                             │');
  console.log('│ Email: vendas@brpolis.com                   │');
  console.log('│ Senha: Vendas@2025!                         │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│ 🗳️  CANDIDATO EXEMPLO                       │');
  console.log('│ Email: candidato@exemplo.com                │');
  console.log('│ Senha: candidato123                         │');
  console.log('│ Cargo: Prefeito de São Paulo                │');
  console.log('│ Plano: Profissional (30 dias)               │');
  console.log('└─────────────────────────────────────────────┘');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });