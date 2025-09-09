// 📱 BRPolis - WhatsApp Business API Integration

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  version: string;
}

interface SendMessageData {
  to: string;
  text: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      version: 'v18.0'
    };
    
    this.baseUrl = `https://graph.facebook.com/${this.config.version}/${this.config.phoneNumberId}`;
  }

  /**
   * Envia mensagem de texto via WhatsApp Business API
   */
  async sendMessage(data: SendMessageData): Promise<WhatsAppResponse> {
    try {
      // Em desenvolvimento, simular envio
      if (process.env.NODE_ENV === 'development') {
        return this.simulateMessage(data);
      }

      // Produção: usar WhatsApp Business API real
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
        console.error('WhatsApp API Error:', result);
        return {
          success: false,
          error: result.error?.message || 'Erro na API do WhatsApp'
        };
      }

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent'
      };

    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
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
    
    // Validar formato brasileiro: 5511999999999 (com código do país)
    const brazilianPattern = /^55\d{10,11}$/;
    
    return brazilianPattern.test(cleanPhone);
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
   * Simular envio para desenvolvimento
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
   * Obter informações da conta
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
}

export default new WhatsAppService();