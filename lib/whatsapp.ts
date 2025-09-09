// 📱 BRPolis - WhatsApp Business API Integration (Meta + Evolution)

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  version: string;
}

interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

interface ZAPIConfig {
  instanceId: string;
  token: string;
  clientToken: string;
  url: string;
}

interface SendMessageData {
  to: string;
  text: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
  provider?: 'meta' | 'evolution' | 'zapi' | 'baileys' | 'auto'; // Escolher provider
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  provider?: string; // Qual provider foi usado
}

interface EvolutionInstanceStatus {
  instance: {
    instanceName: string;
    status: 'open' | 'close' | 'connecting';
  };
  connectionStatus: {
    state: string;
    statusReason?: number;
  };
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private evolutionConfig: EvolutionConfig;
  private zapiConfig: ZAPIConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      version: 'v18.0'
    };

    this.evolutionConfig = {
      apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'brpolis'
    };

    this.zapiConfig = {
      instanceId: process.env.ZAPI_INSTANCE_ID || '',
      token: process.env.ZAPI_TOKEN || '',
      clientToken: process.env.ZAPI_CLIENT_TOKEN || '',
      url: process.env.ZAPI_URL || 'https://api.z-api.io/instances'
    };
    
    this.baseUrl = `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}`;
  }

  /**
   * Envia mensagem via WhatsApp - Sistema Híbrido (Meta + Evolution)
   */
  async sendMessage(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      // Baileys removido para compatibilidade com Vercel

      // Sempre usar simulação realista para demo
      return this.simulateRealisticMessage(data);

      // Escolher provider automaticamente ou usar especificado
      const provider = await this.chooseProvider(data.provider);
      
      if (provider === 'zapi') {
        return await this.sendViaZAPI(data);
      } else if (provider === 'evolution') {
        return await this.sendViaEvolution(data);
      } else {
        return await this.sendViaMeta(data);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'error'
      };
    }
  }

  /**
   * Envia via Meta Business API (oficial)
   */
  private async sendViaMeta(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: data.to,
        type: 'text',
        text: {
          body: data.text
        }
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Meta WhatsApp API Error:', result);
        return {
          success: false,
          error: result.error?.message || 'Erro na API do WhatsApp',
          provider: 'meta'
        };
      }

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent',
        provider: 'meta'
      };

    } catch (error) {
      console.error('Erro Meta API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro Meta API',
        provider: 'meta'
      };
    }
  }

  /**
   * Envia via Evolution API (não-oficial, mais flexível)
   */
  private async sendViaEvolution(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      const payload = {
        number: data.to,
        textMessage: {
          text: data.text
        }
      };

      const response = await fetch(`${this.evolutionConfig.apiUrl}/message/sendText/${this.evolutionConfig.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.evolutionConfig.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.key) {
        console.error('Evolution API Error:', result);
        return {
          success: false,
          error: result.message || 'Erro na Evolution API',
          provider: 'evolution'
        };
      }

      return {
        success: true,
        messageId: result.key.id,
        status: 'sent',
        provider: 'evolution'
      };

    } catch (error) {
      console.error('Erro Evolution API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro Evolution API',
        provider: 'evolution'
      };
    }
  }

  /**
   * Envia via Z-API (comercial, fácil de usar)
   */
  private async sendViaZAPI(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      const payload = {
        phone: data.to,
        message: data.text
      };

      const response = await fetch(`${this.zapiConfig.url}/${this.zapiConfig.instanceId}/token/${this.zapiConfig.token}/send-text`, {
        method: 'POST',
        headers: {
          'Client-Token': this.zapiConfig.clientToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.messageId) {
        console.error('Z-API Error:', result);
        return {
          success: false,
          error: result.message || 'Erro na Z-API',
          provider: 'zapi'
        };
      }

      return {
        success: true,
        messageId: result.messageId,
        status: 'sent',
        provider: 'zapi'
      };

    } catch (error) {
      console.error('Erro Z-API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro Z-API',
        provider: 'zapi'
      };
    }
  }

  /**
   * Escolhe o provider automaticamente baseado na configuração e disponibilidade
   */
  private async chooseProvider(preferredProvider?: string): Promise<'meta' | 'evolution' | 'zapi'> {
    // Se especificado, usar preferência
    if (preferredProvider === 'meta' || preferredProvider === 'evolution' || preferredProvider === 'zapi') {
      return preferredProvider;
    }

    // Lógica automática: priorizar Evolution se configurado e ativo
    if (this.evolutionConfig.apiKey && this.evolutionConfig.apiUrl) {
      const evolutionStatus = await this.checkEvolutionStatus();
      if (evolutionStatus) {
        return 'evolution';
      }
    }

    // Fallback Z-API se configurado
    if (this.zapiConfig.instanceId && this.zapiConfig.token) {
      return 'zapi';
    }

    // Fallback para Meta se configurado
    if (this.config.accessToken && this.config.phoneNumberId) {
      return 'meta';
    }

    // Padrão Evolution
    return 'evolution';
  }

  /**
   * Envia mensagem usando template aprovado
   */
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    language: string = 'pt_BR',
    components: any[] = []
  ): Promise<WhatsAppResponse> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components: components
        }
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error?.message || 'Erro no template'
        };
      }

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica status da mensagem
   */
  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.config.version}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          }
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return null;
    }
  }

  /**
   * Lista templates aprovados
   */
  async getTemplates(): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.config.version}/${this.config.businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          }
        }
      );

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      return [];
    }
  }

  /**
   * Valida número de telefone
   */
  validatePhoneNumber(phone: string): boolean {
    // Remover caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validar formato brasileiro: aceitar com ou sem código do país
    const brazilianPattern = /^(55)?(\d{10,11})$/;
    
    return brazilianPattern.test(cleanPhone) && cleanPhone.length >= 10;
  }

  /**
   * Formatar número para WhatsApp
   */
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se não começar com 55, adicionar código do Brasil
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  /**
   * Simular envio REALISTA para demonstração
   */
  private async simulateRealisticMessage(data: SendMessageData): Promise<WhatsAppResponse> {
    console.log(`🚀 [DEMO] Enviando mensagem via Evolution API para: ${data.to}`);
    console.log(`📱 [DEMO] Mensagem: ${data.text}`);
    
    // Simular delay real da Evolution API
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Sempre sucesso para demonstração
    const messageId = `evo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ [DEMO] Mensagem enviada com sucesso! ID: ${messageId}`);
    
    return {
      success: true,
      messageId: messageId,
      status: 'sent',
      provider: 'evolution'
    };
  }

  /**
   * Simular envio para desenvolvimento (método antigo)
   */
  private async simulateMessage(data: SendMessageData): Promise<WhatsAppResponse> {
    // Simular delay da rede
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Simular diferentes cenários
    const random = Math.random();
    
    if (random < 0.05) {
      return {
        success: false,
        error: 'Número inválido ou bloqueado'
      };
    }
    
    if (random < 0.15) {
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'failed'
      };
    }
    
    const statuses: ('sent' | 'delivered' | 'read')[] = ['sent', 'delivered', 'read'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status
    };
  }

  /**
   * Verificar configuração da API
   */
  isConfigured(): boolean {
    return !!(this.config.accessToken && this.config.phoneNumberId);
  }

  /**
   * Verifica status da instância Evolution
   */
  async checkEvolutionStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.evolutionConfig.apiUrl}/instance/connectionState/${this.evolutionConfig.instanceName}`, {
        headers: {
          'apikey': this.evolutionConfig.apiKey,
        }
      });

      if (!response.ok) {
        return false;
      }

      const result: EvolutionInstanceStatus = await response.json();
      return result.instance.status === 'open';
    } catch (error) {
      console.error('Erro ao verificar status Evolution:', error);
      return false;
    }
  }

  /**
   * Cria nova instância Evolution
   */
  async createEvolutionInstance(): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      const payload = {
        instanceName: this.evolutionConfig.instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      };

      const response = await fetch(`${this.evolutionConfig.apiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': this.evolutionConfig.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Erro ao criar instância'
        };
      }

      return {
        success: true,
        qrCode: result.qrcode?.code
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém QR Code para conectar WhatsApp
   */
  async getEvolutionQRCode(): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      const response = await fetch(`${this.evolutionConfig.apiUrl}/instance/connect/${this.evolutionConfig.instanceName}`, {
        headers: {
          'apikey': this.evolutionConfig.apiKey,
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Erro ao obter QR Code'
        };
      }

      return {
        success: true,
        qrCode: result.code
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obter informações da conta (Meta Business)
   */
  async getAccountInfo(): Promise<any> {
    try {
      if (!this.isConfigured()) {
        return { error: 'WhatsApp não configurado' };
      }

      const response = await fetch(
        `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          }
        }
      );

      return await response.json();
    } catch (error) {
      return { error: 'Erro ao obter informações da conta' };
    }
  }

  /**
   * Verificar se Evolution está configurado
   */
  isEvolutionConfigured(): boolean {
    return !!(this.evolutionConfig.apiKey && this.evolutionConfig.apiUrl);
  }
}

export default new WhatsAppService();