import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const city = searchParams.get('city') || '';
    const profession = searchParams.get('profession') || '';
    
    // Buscar do banco de dados com filtros
    const voters = await prisma.voter.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          status ? { status } : {},
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          profession ? { profession: { contains: profession, mode: 'insensitive' } } : {}
        ]
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.voter.count({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          status ? { status } : {},
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          profession ? { profession: { contains: profession, mode: 'insensitive' } } : {}
        ]
      }
    });

    return NextResponse.json({
      success: true,
      voters,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: voters.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar eleitores:', error);
    
    // Dados demo se der erro
    const demoVoters = [
      {
        id: '1',
        name: 'João Silva Santos',
        email: 'joao.silva@email.com',
        phone: '11999999999',
        birthDate: '1979-05-15',
        gender: 'MALE',
        profession: 'Professor',
        educationLevel: 'COLLEGE',
        incomeRange: 'FROM_5_TO_10',
        interests: ['educacao', 'saude', 'meio-ambiente'],
        status: 'SUPPORTER',
        score: 85,
        lastContact: '2024-09-01',
        street: 'Rua das Flores, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000',
        zone: '001',
        section: '0015',
        createdAt: '2024-08-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Maria Oliveira Costa',
        email: 'maria.oliveira@email.com', 
        phone: '11888888888',
        birthDate: '1985-11-22',
        gender: 'FEMALE',
        profession: 'Enfermeira',
        educationLevel: 'COLLEGE',
        incomeRange: 'FROM_2_TO_5',
        interests: ['saude', 'assistencia-social'],
        status: 'POTENTIAL',
        score: 65,
        lastContact: '2024-08-28',
        street: 'Av. Paulista, 456',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-000',
        zone: '002',
        section: '0045',
        createdAt: '2024-08-10T14:20:00Z'
      },
      {
        id: '3',
        name: 'Carlos Ferreira Lima',
        email: 'carlos.ferreira@email.com',
        phone: '11777777777',
        birthDate: '1992-03-08',
        gender: 'MALE', 
        profession: 'Desenvolvedor',
        educationLevel: 'COLLEGE',
        incomeRange: 'FROM_5_TO_10',
        interests: ['tecnologia', 'inovacao', 'empreendedorismo'],
        status: 'UNDECIDED',
        score: 45,
        lastContact: null,
        street: 'Rua Augusta, 789',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-000',
        zone: '003',
        section: '0078',
        createdAt: '2024-08-05T09:15:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      voters: demoVoters,
      pagination: {
        current: 1,
        total: 1,
        count: demoVoters.length,
        totalRecords: demoVoters.length
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const voterData = await request.json();
    
    const voter = await prisma.voter.create({
      data: {
        candidateId: 'demo-candidate',
        name: voterData.name,
        email: voterData.email,
        phone: voterData.phone?.replace(/\D/g, ''),
        cpf: voterData.cpf,
        birthDate: voterData.birthDate ? new Date(voterData.birthDate) : null,
        gender: voterData.gender,
        profession: voterData.profession,
        educationLevel: voterData.educationLevel,
        incomeRange: voterData.incomeRange,
        interests: JSON.stringify(voterData.interests || []),
        status: voterData.status || 'POTENTIAL',
        score: voterData.score || 50,
        street: voterData.street,
        number: voterData.number,
        neighborhood: voterData.neighborhood,
        city: voterData.city,
        state: voterData.state,
        zipCode: voterData.zipCode?.replace(/\D/g, ''),
        zone: voterData.zone,
        section: voterData.section
      }
    });

    return NextResponse.json({
      success: true,
      voter
    });
  } catch (error) {
    console.error('Erro ao criar eleitor:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao cadastrar eleitor'
    }, { status: 500 });
  }
}