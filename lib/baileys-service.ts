// 📱 BRPolis - Baileys WhatsApp Integration (REAL WhatsApp)

import makeWASocket, { 
  ConnectionState, 
  DisconnectReason, 
  useMultiFileAuthState, 
  WAMessage,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

interface BaileysMessage {
  to: string;
  text: string;
}

interface BaileysResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  qrCode?: string;
  status?: string;
}

class BaileysWhatsAppService {
  private sock: any = null;
  private qrCodeData: string | null = null;
  private connectionState: ConnectionState = 'close';
  private authDir = path.join(process.cwd(), '.whatsapp-auth');

  constructor() {
    this.ensureAuthDir();
  }

  private ensureAuthDir() {
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  /**
   * Conecta ao WhatsApp e gera QR Code
   */
  async connect(): Promise<BaileysResponse> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      
      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Vamos capturar o QR Code
      });

      // Capturar QR Code
      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.qrCodeData = qr;
          console.log('🔍 QR Code gerado! Escaneie com seu WhatsApp');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('📱 Conexão fechada devido ao ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
          
          if (shouldReconnect) {
            this.connect();
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp conectado com sucesso!');
          this.connectionState = 'open';
        }

        this.connectionState = connection;
      });

      // Salvar credenciais quando mudarem
      this.sock.ev.on('creds.update', saveCreds);

      return {
        success: true,
        status: 'connecting',
        qrCode: this.qrCodeData
      };

    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na conexão'
      };
    }
  }

  /**
   * Envia mensagem via Baileys
   */
  async sendMessage(data: BaileysMessage): Promise<BaileysResponse> {
    try {
      if (!this.sock || this.connectionState !== 'open') {
        return {
          success: false,
          error: 'WhatsApp não conectado. Conecte primeiro via QR Code.'
        };
      }

      // Formatar número para WhatsApp
      const formattedNumber = this.formatPhoneNumber(data.to);
      const jid = `${formattedNumber}@s.whatsapp.net`;

      console.log(`📱 Enviando mensagem para: ${formattedNumber}`);
      console.log(`💬 Mensagem: ${data.text}`);

      // Enviar mensagem
      const result = await this.sock.sendMessage(jid, { text: data.text });
      
      const messageId = result?.key?.id || `baileys_${Date.now()}`;
      
      console.log(`✅ Mensagem enviada! ID: ${messageId}`);

      return {
        success: true,
        messageId: messageId,
        status: 'sent'
      };

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no envio'
      };
    }
  }

  /**
   * Obtém QR Code atual
   */
  getQRCode(): string | null {
    return this.qrCodeData;
  }

  /**
   * Verifica status da conexão
   */
  getConnectionStatus(): { connected: boolean; status: string } {
    return {
      connected: this.connectionState === 'open',
      status: this.connectionState
    };
  }

  /**
   * Formatar número brasileiro para WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`;
    }
    
    // Garante que números de celular tenham 9 dígitos (adiciona 9 se necessário)
    if (cleanPhone.length === 12 && !cleanPhone.substring(4, 5).includes('9')) {
      cleanPhone = cleanPhone.substring(0, 4) + '9' + cleanPhone.substring(4);
    }
    
    return cleanPhone;
  }

  /**
   * Desconecta WhatsApp
   */
  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.connectionState = 'close';
      console.log('📱 WhatsApp desconectado');
    }
  }

  /**
   * Limpa sessão (logout completo)
   */
  async clearSession(): Promise<void> {
    await this.disconnect();
    
    // Remove arquivos de autenticação
    if (fs.existsSync(this.authDir)) {
      fs.rmSync(this.authDir, { recursive: true, force: true });
      console.log('🗑️ Sessão WhatsApp limpa');
    }
  }
}

// Singleton instance
const baileysService = new BaileysWhatsAppService();

export default baileysService;
export { BaileysWhatsAppService, type BaileysMessage, type BaileysResponse };