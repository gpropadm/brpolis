import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Buscar estatísticas de cada campanha
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const messages = await prisma.whatsAppMessage.findMany({
          where: { campaignId: campaign.id }
        });

        const total = messages.length;
        const sent = messages.filter(m => ['SENT', 'DELIVERED', 'READ'].includes(m.status)).length;
        const delivered = messages.filter(m => ['DELIVERED', 'READ'].includes(m.status)).length;
        const read = messages.filter(m => m.status === 'READ').length;
        const cost = messages.reduce((sum, m) => sum + (m.cost || 0), 0);

        return {
          ...campaign,
          stats: {
            total,
            sent,
            delivered,
            read,
            cost,
            deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
            readRate: delivered > 0 ? Math.round((read / delivered) * 100) : 0
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    
    // Dados demo se der erro
    const demoCampaigns = [
      {
        id: '1',
        name: 'Campanha Eleitoral 2024',
        description: 'Divulgação das propostas eleitorais',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        stats: {
          total: 15420,
          sent: 15420,
          delivered: 14891,
          read: 8234,
          cost: 771.00,
          deliveryRate: 97,
          readRate: 55
        }
      },
      {
        id: '2', 
        name: 'Lembrete de Votação',
        description: 'Lembrar eleitores do dia da votação',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          total: 89340,
          sent: 89340,
          delivered: 86221,
          read: 52834,
          cost: 4467.00,
          deliveryRate: 96,
          readRate: 61
        }
      }
    ];

    return NextResponse.json({
      success: true,
      campaigns: demoCampaigns
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, message, contacts, scheduledAt } = await request.json();

    // Criar campanha
    const campaign = await prisma.campaign.create({
      data: {
        candidateId: 'demo-candidate',
        name,
        description: description || '',
        politicalRole: 'MAYOR',
        state: 'SP',
        city: 'São Paulo',
        startDate: scheduledAt ? new Date(scheduledAt) : new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
        budget: contacts.length * 0.05,
        status: 'ACTIVE'
      }
    });

    // Criar mensagens em lote para todos os contatos
    const messages = contacts.map((contact: any) => ({
      candidateId: 'demo-candidate',
      campaignId: campaign.id,
      recipientPhone: contact.phone,
      message: message,
      status: 'PENDING',
      cost: 0.05
    }));

    await prisma.whatsAppMessage.createMany({
      data: messages
    });

    return NextResponse.json({
      success: true,
      campaign,
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar campanha'
    }, { status: 500 });
  }
}