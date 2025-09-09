# 📱 Evolution API Integration - BRPolis

## 🚀 Sistema Híbrido WhatsApp

O BRPolis agora suporta **dois provedores de WhatsApp**:

### 1. **Meta Business API** (Oficial)
- ✅ Oficial e estável
- ❌ Rate limits rigorosos (1k-100k/dia)
- ❌ Precisa aprovação Meta
- ❌ Caro (R$ 0,05-0,15 por mensagem)

### 2. **Evolution API** (Não-oficial)
- ✅ Sem rate limits da Meta
- ✅ Mais barato (sem taxa por mensagem)
- ✅ Funcionalidades avançadas
- ❌ Risco de ban
- ❌ Não é oficial

## 🐳 Como Usar com Docker

### 1. Subir o ambiente completo:
```bash
docker-compose up -d
```

### 2. Acessar serviços:
- **BRPolis**: http://localhost:3000
- **Evolution API**: http://localhost:8080
- **Adminer**: http://localhost:8081 (postgres/brpolis/brpolis123)

### 3. Conectar WhatsApp:
1. Acesse o dashboard BRPolis
2. Vá em "WhatsApp" → "Evolution API"
3. Clique em "Obter QR Code"
4. Escaneie com seu WhatsApp

## 🔧 Configuração Manual

### 1. Instalar Evolution API:
```bash
# Via Docker
docker run --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="B6D711FCDE4D4FD5936544120E713976" \
  -e SERVER_TYPE=http \
  davidsongomes/evolution-api:v2.0.0

# Via NPM
npm i -g @evolution/api
evolution-api start
```

### 2. Configurar variáveis:
```bash
# .env.local
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="B6D711FCDE4D4FD5936544120E713976"
EVOLUTION_INSTANCE_NAME="brpolis-campaign"
```

### 3. Criar instância:
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: B6D711FCDE4D4FD5936544120E713976" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "brpolis-campaign", "qrcode": true}'
```

## 🔄 API Endpoints

### Status da Instância:
```http
GET /api/whatsapp/evolution/status
```

### QR Code:
```http
GET /api/whatsapp/evolution/qrcode
POST /api/whatsapp/evolution/qrcode  # Criar nova instância
```

### Enviar Mensagem (automático):
```http
POST /api/whatsapp/send
{
  "recipients": "5511999999999\n5511888888888",
  "message": "Mensagem da campanha"
}
```

### Forçar Provider:
```http
POST /api/whatsapp/send
{
  "recipients": "5511999999999",
  "message": "Mensagem via Evolution",
  "provider": "evolution"  // ou "meta"
}
```

## 🎯 Estratégia Recomendada

### Para Volume Alto (>1k mensagens/dia):
```javascript
const sendMessage = async (contacts, message) => {
  // VIPs via Meta (oficial, mais confiável)
  const vipContacts = contacts.filter(c => c.isVip);
  await sendViaMeta(vipContacts, message);
  
  // Massa via Evolution (não-oficial, mais barato)
  const massContacts = contacts.filter(c => !c.isVip);
  await sendViaEvolution(massContacts, message);
};
```

### Monitoramento:
- ✅ Always monitor for WhatsApp bans
- ✅ Use multiple phone numbers
- ✅ Rotate instances daily
- ✅ Backup with Meta API

## ⚠️ Avisos Importantes

1. **Não é oficial**: WhatsApp pode banir números
2. **Use números descartáveis** para testes
3. **Monitore constantemente** por banimentos
4. **Tenha backup** com Meta Business API
5. **Respeite LGPD** e leis eleitorais

## 🛠️ Troubleshooting

### QR Code não aparece:
```bash
# Reiniciar instância
curl -X POST http://localhost:8080/instance/restart/brpolis-campaign \
  -H "apikey: B6D711FCDE4D4FD5936544120E713976"
```

### Instância desconectada:
```bash
# Verificar status
curl http://localhost:8080/instance/connectionState/brpolis-campaign \
  -H "apikey: B6D711FCDE4D4FD5936544120E713976"
```

### Logs do Evolution:
```bash
docker logs evolution-api -f
```

## 📊 Comparação Final

| Recurso | Meta Business | Evolution API |
|---------|---------------|---------------|
| **Custo** | R$ 0,05-0,15/msg | Grátis* |
| **Rate Limit** | 1k-100k/dia | Ilimitado* |
| **Aprovação** | Necessária | Não |
| **Estabilidade** | 99.9% | 95%* |
| **Ban Risk** | Baixo | Alto |
| **Compliance** | Alto | Baixo |

*_Depende do WhatsApp não detectar_

## 🚀 Pronto para Usar!

O sistema escolhe automaticamente o melhor provider baseado na configuração e disponibilidade. Para forçar um específico, use o parâmetro `provider` na API.

**Recomendação**: Comece testando Evolution API com números descartáveis, e use Meta Business para campanhas críticas!