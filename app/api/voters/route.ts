import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const authResult = await authService.verifyToken(token);
    
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar eleitores do candidato atual
    const voters = await prisma.voter.findMany({
      where: { 
        candidateId: authResult.user.id 
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        status: true,
        score: true,
        city: true,
        state: true,
        neighborhood: true,
        zone: true,
        section: true,
        interests: true,
        createdAt: true
      }
    });

    // Processar interesses (JSON string para array)
    const processedVoters = voters.map(voter => ({
      ...voter,
      interests: voter.interests ? JSON.parse(voter.interests as string) : [],
      createdAt: voter.createdAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true, 
      voters: processedVoters 
    });

  } catch (error) {
    console.error('Erro ao buscar eleitores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const authResult = await authService.verifyToken(token);
    
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, cpf, status, score, city, state, neighborhood, zone, section, interests } = body;

    // Validações básicas
    if (!name || !email || !phone || !city || !state) {
      return NextResponse.json({ 
        error: 'Nome, email, telefone, cidade e estado são obrigatórios' 
      }, { status: 400 });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const existingVoter = await prisma.voter.findUnique({
        where: { cpf }
      });

      if (existingVoter) {
        return NextResponse.json({ 
          error: 'CPF já cadastrado' 
        }, { status: 400 });
      }
    }

    // Criar novo eleitor
    const voter = await prisma.voter.create({
      data: {
        candidateId: authResult.user.id,
        name,
        email: email.toLowerCase(),
        phone,
        cpf: cpf || null,
        status: status || 'POTENTIAL',
        score: score || 50,
        city,
        state,
        neighborhood: neighborhood || '',
        zone: zone || '',
        section: section || '',
        interests: interests ? JSON.stringify(interests) : JSON.stringify([])
      }
    });

    return NextResponse.json({ 
      success: true, 
      voter: {
        ...voter,
        interests: voter.interests ? JSON.parse(voter.interests as string) : []
      }
    });

  } catch (error) {
    console.error('Erro ao criar eleitor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}