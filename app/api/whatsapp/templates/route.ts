import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import authService from '@/lib/auth';

// Templates de exemplo - em produção seria armazenado no banco
const defaultTemplates = [
  {
    id: '1',
    name: 'Apresentação Pessoal',
    content: 'Olá! Sou {NOME_CANDIDATO}, candidato a {CARGO} por {CIDADE}. Gostaria de conhecer suas principais preocupações sobre nossa cidade. Posso contar com seu apoio?',
    variables: ['NOME_CANDIDATO', 'CARGO', 'CIDADE']
  },
  {
    id: '2', 
    name: 'Convite para Evento',
    content: 'Você está convidado(a) para nosso evento em {LOCAL} no dia {DATA} às {HORARIO}. Vamos conversar sobre o futuro de {CIDADE}!',
    variables: ['LOCAL', 'DATA', 'HORARIO', 'CIDADE']
  },
  {
    id: '3',
    name: 'Agradecimento',
    content: 'Obrigado(a) por seu tempo e atenção! Sua opinião é muito importante para construirmos juntos um futuro melhor para {CIDADE}.',
    variables: ['CIDADE']
  },
  {
    id: '4',
    name: 'Pesquisa de Opinião',
    content: 'Gostaria de saber sua opinião sobre {TEMA}. Sua resposta me ajudará a criar propostas mais alinhadas com as necessidades da população.',
    variables: ['TEMA']
  }
];

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

    return NextResponse.json({ 
      success: true, 
      templates: defaultTemplates
    });

  } catch (error) {
    console.error('Erro ao buscar templates WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}