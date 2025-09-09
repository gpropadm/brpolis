// Evolution API Simples - WhatsApp Real
const express = require('express');
const { DisconnectReason, useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let sock = null;
let qrData = null;
let isConnected = false;

// Estado da conexão
app.get('/instance/connectionState/:instanceName', (req, res) => {
  res.json({
    instance: {
      instanceName: req.params.instanceName,
      status: isConnected ? 'open' : 'close'
    },
    connectionStatus: {
      state: isConnected ? 'open' : 'close'
    }
  });
});

// Criar instância
app.post('/instance/create', async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrData = qr;
        console.log('QR Code gerado!');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        console.log('✅ WhatsApp conectado!');
        isConnected = true;
      } else if (connection === 'close') {
        isConnected = false;
        console.log('❌ WhatsApp desconectado');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    res.json({
      instance: {
        instanceName: req.body.instanceName,
        status: 'creating'
      },
      qrcode: { code: qrData }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Conectar (obter QR Code)
app.get('/instance/connect/:instanceName', (req, res) => {
  res.json({
    code: qrData,
    base64: qrData
  });
});

// Enviar mensagem texto
app.post('/message/sendText/:instanceName', async (req, res) => {
  try {
    if (!sock || !isConnected) {
      return res.status(400).json({
        error: true,
        message: 'WhatsApp não conectado'
      });
    }

    const { number, textMessage } = req.body;
    const jid = `${number}@s.whatsapp.net`;
    
    console.log(`📱 Enviando mensagem para: ${number}`);
    console.log(`💬 Texto: ${textMessage.text}`);
    
    const result = await sock.sendMessage(jid, { text: textMessage.text });
    
    res.json({
      key: {
        id: result.key.id,
        remoteJid: result.key.remoteJid,
        fromMe: true
      },
      message: 'Mensagem enviada com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// Iniciar servidor
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Evolution API rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});

module.exports = app;