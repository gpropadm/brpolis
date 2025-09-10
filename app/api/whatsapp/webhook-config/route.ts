import { NextRequest, NextResponse } from 'next/server';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'B6D711FCDE4D4FD5936544120E713976';
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'brpolis-campaign';

export async function POST(request: NextRequest) {
  try {
    const { webhookConfig, whatsappSettings } = await request.json();

    // Configurar webhook na Evolution API
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/evolution`;
    
    const webhookData = {
      webhook: {
        url: webhookUrl,
        events: []
      }
    };

    // Adicionar eventos baseados na configuração
    if (webhookConfig.onSend) webhookData.webhook.events.push('SEND_MESSAGE');
    if (webhookConfig.chatPresence) webhookData.webhook.events.push('PRESENCE_UPDATE');
    if (webhookConfig.onDisconnect) webhookData.webhook.events.push('CONNECTION_UPDATE');
    if (webhookConfig.messageStatus) webhookData.webhook.events.push('MESSAGES_UPDATE');
    if (webhookConfig.onReceive) webhookData.webhook.events.push('MESSAGES_UPSERT');
    if (webhookConfig.onConnect) webhookData.webhook.events.push('CONNECTION_UPDATE');

    // Configurar webhook na Evolution API
    const webhookResponse = await fetch(`${EVOLUTION_API_URL}/webhook/set/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify(webhookData)
    });

    if (!webhookResponse.ok) {
      throw new Error('Erro ao configurar webhook na Evolution API');
    }

    // Configurar settings do WhatsApp na Evolution API
    const settingsData = {
      rejectCall: whatsappSettings.autoRejectCalls,
      msgCall: whatsappSettings.autoRejectCalls ? whatsappSettings.rejectCallMessage : '',
      alwaysOnline: true,
      readMessages: whatsappSettings.autoReadMessages,
      readStatus: whatsappSettings.autoReadStatus
    };

    const settingsResponse = await fetch(`${EVOLUTION_API_URL}/settings/set/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify(settingsData)
    });

    if (!settingsResponse.ok) {
      throw new Error('Erro ao configurar settings na Evolution API');
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso!',
      webhook: await webhookResponse.json(),
      settings: await settingsResponse.json()
    });

  } catch (error) {
    console.error('Erro ao configurar webhook/settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar configurações'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Buscar configurações atuais da Evolution API
    const [webhookResponse, settingsResponse] = await Promise.all([
      fetch(`${EVOLUTION_API_URL}/webhook/find/${INSTANCE_NAME}`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      }),
      fetch(`${EVOLUTION_API_URL}/settings/find/${INSTANCE_NAME}`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      })
    ]);

    const webhook = webhookResponse.ok ? await webhookResponse.json() : null;
    const settings = settingsResponse.ok ? await settingsResponse.json() : null;

    // Converter para o formato da nossa interface
    const webhookConfig = {
      onSend: webhook?.events?.includes('SEND_MESSAGE') || false,
      chatPresence: webhook?.events?.includes('PRESENCE_UPDATE') || false,
      onDisconnect: webhook?.events?.includes('CONNECTION_UPDATE') || false,
      messageStatus: webhook?.events?.includes('MESSAGES_UPDATE') || false,
      onReceive: webhook?.events?.includes('MESSAGES_UPSERT') || false,
      notifyMyMessages: false, // Evolution API não tem essa opção específica
      onConnect: webhook?.events?.includes('CONNECTION_UPDATE') || false
    };

    const whatsappSettings = {
      autoRejectCalls: settings?.rejectCall || false,
      autoReadMessages: settings?.readMessages || false,
      autoReadStatus: settings?.readStatus || false
    };

    return NextResponse.json({
      success: true,
      webhookConfig,
      whatsappSettings,
      webhook,
      settings
    });

  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar configurações'
    }, { status: 500 });
  }
}