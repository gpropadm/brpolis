import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Para demo, vou retornar grupos fictícios baseados nos dados de eleitores
    const demoGroups = [
      {
        id: '1',
        name: 'Apoiadores Confirmados',
        description: 'Eleitores que já confirmaram apoio',
        tags: ['apoiador', 'confirmado'],
        contactCount: 12450,
        segmentation: {
          status: 'SUPPORTER',
          score: { min: 80, max: 100 }
        },
        color: '#10B981', // verde
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Zona Sul - Centro',
        description: 'Moradores da região central e zona sul',
        tags: ['zona-sul', 'centro', 'região'],
        contactCount: 8900,
        segmentation: {
          neighborhoods: ['Centro', 'Vila Madalena', 'Pinheiros', 'Jardins']
        },
        color: '#3B82F6', // azul
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Interessados em Saúde',
        description: 'Contatos que demonstraram interesse em propostas de saúde',
        tags: ['saúde', 'interesse', 'política-pública'],
        contactCount: 15670,
        segmentation: {
          interests: ['saude', 'hospital', 'sus']
        },
        color: '#EF4444', // vermelho
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Jovens (18-35 anos)',
        description: 'Eleitores entre 18 e 35 anos',
        tags: ['jovens', 'idade', 'demografia'],
        contactCount: 22340,
        segmentation: {
          ageRange: { min: 18, max: 35 }
        },
        color: '#8B5CF6', // roxo
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Empresários e Comerciantes',
        description: 'Profissionais do setor empresarial',
        tags: ['empresário', 'comércio', 'economia'],
        contactCount: 4560,
        segmentation: {
          profession: ['empresario', 'comerciante', 'empreendedor']
        },
        color: '#F59E0B', // amarelo
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Indecisos - Alta Prioridade',
        description: 'Eleitores indecisos com potencial de conversão',
        tags: ['indeciso', 'conversão', 'prioridade'],
        contactCount: 18920,
        segmentation: {
          status: 'UNDECIDED',
          score: { min: 40, max: 70 }
        },
        color: '#F97316', // laranja
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      groups: demoGroups
    });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar grupos'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, tags, segmentation, color } = await request.json();

    // Simular criação de grupo
    const newGroup = {
      id: Date.now().toString(),
      name,
      description: description || '',
      tags: tags || [],
      segmentation,
      color: color || '#6B7280',
      contactCount: Math.floor(Math.random() * 20000) + 1000, // Simulado
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      group: newGroup
    });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar grupo'
    }, { status: 500 });
  }
}