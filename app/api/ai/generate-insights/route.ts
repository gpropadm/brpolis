import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth';

const prisma = new PrismaClient();

// Simulação de IA - em produção seria integrado com OpenAI/outras APIs
const generateAIInsights = (candidateName: string, votersData: any[]) => {
  const insights = [
    {
      type: 'SENTIMENT' as const,
      title: 'Sentimento Positivo em Alta',
      content: `Análise de redes sociais mostra crescimento de 23% no sentimento positivo em relação à campanha de ${candidateName} na última semana. Maior engajamento em posts sobre educação e saúde.`,
      confidence: 87,
      priority: 'HIGH' as const
    },
    {
      type: 'TREND' as const,
      title: 'Tendência: Crescimento no Segmento Jovem',
      content: `Detectado aumento significativo de interesse entre eleitores de 18-25 anos. Recomenda-se intensificar presença em plataformas digitais e pautas de primeiro emprego.`,
      confidence: 73,
      priority: 'MEDIUM' as const
    },
    {
      type: 'PREDICTION' as const,
      title: 'Previsão de Votação por Zona',
      content: `Modelo preditivo indica potencial crescimento de 15% na zona eleitoral 042. Fatores: proximidade com universidades e perfil socioeconômico da região.`,
      confidence: 91,
      priority: 'HIGH' as const
    },
    {
      type: 'RECOMMENDATION' as const,
      title: 'Recomendação: Foco em Saúde Pública',
      content: `IA recomenda priorizar agenda de saúde pública. Análise de dados mostra que 67% dos eleitores indecisos consideram este tema decisivo para o voto.`,
      confidence: 82,
      priority: 'HIGH' as const
    },
    {
      type: 'SENTIMENT' as const,
      title: 'Análise de Adversários',
      content: `Monitoramento de campanhas adversárias indica declínio na aprovação do principal concorrente (-8% em 15 dias). Oportunidade para intensificar propostas diferenciadoras.`,
      confidence: 76,
      priority: 'MEDIUM' as const
    },
    {
      type: 'TREND' as const,
      title: 'Trending Topics Relacionados',
      content: `Temas em ascensão nas redes: #TransparenciaPublica, #EmpregoJovem, #MobilidadeUrbana. Considere incluir essas pautas nos próximos discursos e materiais de campanha.`,
      confidence: 84,
      priority: 'MEDIUM' as const
    }
  ];

  // Personalizar com base nos dados reais dos eleitores
  if (votersData.length > 0) {
    const supporterCount = votersData.filter(v => v.status === 'SUPPORTER').length;
    const undecidedCount = votersData.filter(v => v.status === 'UNDECIDED').length;
    const supporterPercentage = ((supporterCount / votersData.length) * 100).toFixed(1);

    insights.push({
      type: 'PREDICTION' as const,
      title: 'Análise da Base Eleitoral',
      content: `Sua base atual tem ${supporterCount} apoiadores confirmados (${supporterPercentage}% do total cadastrado). ${undecidedCount} eleitores ainda estão indecisos - oportunidade para conversão através de contato direto personalizado.`,
      confidence: 95,
      priority: 'HIGH' as const
    });
  }

  return insights;
};

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

    const userId = authResult.user.id;

    // Buscar dados para gerar insights personalizados
    const [user, voters] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId }
      }),
      prisma.voter.findMany({
        where: { candidateId: userId },
        select: { status: true, score: true, interests: true }
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Gerar insights com IA simulada
    const newInsights = generateAIInsights(user.name, voters);

    // Salvar insights no banco
    const createdInsights = await Promise.all(
      newInsights.map(insight =>
        prisma.aIInsight.create({
          data: {
            candidateId: userId,
            type: insight.type,
            title: insight.title,
            content: insight.content,
            confidence: insight.confidence,
            priority: insight.priority
          }
        })
      )
    );

    return NextResponse.json({ 
      success: true, 
      message: `${createdInsights.length} novos insights gerados com sucesso!`,
      insights: createdInsights.map(insight => ({
        ...insight,
        createdAt: insight.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}