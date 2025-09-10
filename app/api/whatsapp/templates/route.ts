import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Templates demo para políticos
    const demoTemplates = [
      {
        id: '1',
        name: 'Mensagem para Apoiadores',
        category: 'apoiadores',
        content: `Olá {{nome}}! 👋

Sua família é muito importante para nossa campanha! 

🗳️ No dia {{data_eleicao}}, conto com seu voto para transformar nossa cidade.

📱 Compartilhe nossa mensagem com seus amigos!

{{candidato}}
{{numero}}`,
        variables: ['nome', 'data_eleicao', 'candidato', 'numero'],
        targetGroups: ['Apoiadores Confirmados'],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Convite para Evento',
        category: 'eventos', 
        content: `🎉 {{nome}}, você está convidado(a)!

📅 {{evento_nome}}
📍 {{local}}
🕐 {{horario}}

Vamos conversar sobre o futuro de {{cidade}}!

✅ Confirme presença: {{link_confirmacao}}

{{candidato}}`,
        variables: ['nome', 'evento_nome', 'local', 'horario', 'cidade', 'link_confirmacao', 'candidato'],
        targetGroups: ['Zona Sul - Centro', 'Apoiadores Confirmados'],
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Proposta - Saúde',
        category: 'propostas',
        content: `{{nome}}, nossa proposta para a SAÚDE! 🏥

✅ Mais postos de saúde nos bairros
✅ Redução das filas de espera  
✅ Telemedicina gratuita
✅ Programa de prevenção

💪 Juntos podemos melhorar a saúde de {{cidade}}!

{{candidato}} {{numero}}`,
        variables: ['nome', 'cidade', 'candidato', 'numero'],
        targetGroups: ['Interessados em Saúde'],
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Lembrete de Votação',
        category: 'eleicao',
        content: `🗳️ {{nome}}, HOJE É DIA DE MUDAR O FUTURO!

📍 Sua seção: {{secao_eleitoral}}
🕐 Votação até às 17h

👆 Digite {{numero}} na urna
   
📱 Chame sua família e amigos!

#{{hashtag_campanha}}`,
        variables: ['nome', 'secao_eleitoral', 'numero', 'hashtag_campanha'],
        targetGroups: ['Apoiadores Confirmados', 'Indecisos - Alta Prioridade'],
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Mensagem para Jovens',
        category: 'demografico',
        content: `E aí {{nome}}! 🔥

Tá ligado que sua geração pode mudar tudo? 💪

🎯 Nossas prioridades JOVENS:
• Primeiro emprego garantido
• WiFi grátis na cidade
• Espaços de coworking públicos
• Apoio ao empreendedorismo

{{candidato}} entende os jovens! 
Vote {{numero}}! 🚀`,
        variables: ['nome', 'candidato', 'numero'],
        targetGroups: ['Jovens (18-35 anos)'],
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      success: true, 
      templates: demoTemplates
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar templates'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, content, variables, targetGroups } = await request.json();

    const newTemplate = {
      id: Date.now().toString(),
      name,
      category: category || 'geral',
      content,
      variables: variables || [],
      targetGroups: targetGroups || [],
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      template: newTemplate
    });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar template'
    }, { status: 500 });
  }
}