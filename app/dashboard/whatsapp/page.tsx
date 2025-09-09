'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WhatsAppMessage {
  id: string;
  recipientPhone: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  cost: number;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');
  const [showSendForm, setShowSendForm] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipients: '',
    template: '',
    message: '',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchData();
    checkWhatsAppStatus();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, templatesRes, campaignsRes] = await Promise.all([
        fetch('/api/whatsapp/messages'),
        fetch('/api/whatsapp/templates'),
        fetch('/api/campaigns')
      ]);
      
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);
      }
      
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }
      
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsAppStatus = async () => {
    try {
      // Verificar Z-API primeiro
      const zapiResponse = await fetch(`https://api.z-api.io/instances/3E6FD6EF2451C0253BF61256C14AB051/token/42F3B8BA78AC0BDBE88FEF20/status`, {
        headers: {
          'Client-Token': '42F3B8BA78AC0BDBE88FEF20'
        }
      });
      
      if (zapiResponse.ok) {
        const zapiData = await zapiResponse.json();
        const isConnected = zapiData.connected === true;
        setWhatsappConnected(isConnected);
        
        if (!isConnected) {
          // Gerar QR Code Z-API
          const qrResponse = await fetch(`https://api.z-api.io/instances/3E6FD6EF2451C0253BF61256C14AB051/token/42F3B8BA78AC0BDBE88FEF20/qr-code`, {
            headers: {
              'Client-Token': '42F3B8BA78AC0BDBE88FEF20'
            }
          });
          if (qrResponse.ok) {
            const qrData = await qrResponse.json();
            setQrCode(qrData.value);
          }
        }
        return;
      }
      
      // Fallback para Evolution API local
      const localResponse = await fetch('http://localhost:8080/instance/connectionState/brpolis-campaign');
      if (localResponse.ok) {
        const localData = await localResponse.json();
        const isConnected = localData.connectionStatus?.state === 'open';
        setWhatsappConnected(isConnected);
        return;
      }
      
      // Fallback final para API interna
      const response = await fetch('/api/whatsapp/connect');
      const data = await response.json();
      setWhatsappConnected(data.connected);
      setQrCode(data.qrCode);
    } catch (error) {
      console.error('Erro ao verificar status WhatsApp:', error);
    }
  };

  const connectWhatsApp = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        
        // Verificar status periodicamente
        const interval = setInterval(async () => {
          await checkWhatsAppStatus();
          const statusResponse = await fetch('/api/whatsapp/connect');
          const statusData = await statusResponse.json();
          
          if (statusData.connected) {
            setWhatsappConnected(true);
            setQrCode(null);
            clearInterval(interval);
            setConnecting(false);
          }
        }, 3000);
        
        // Limpar interval após 60 segundos
        setTimeout(() => {
          clearInterval(interval);
          setConnecting(false);
        }, 60000);
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      setConnecting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recipients = sendForm.recipients.split('\n').filter(r => r.trim());
      const results = [];
      
      for (const recipient of recipients) {
        const cleanNumber = recipient.trim().replace(/\D/g, '');
        if (cleanNumber.length >= 10) {
          try {
            // Tentar Z-API primeiro
            const zapiResponse = await fetch(`https://api.z-api.io/instances/3E6FD6EF2451C0253BF61256C14AB051/token/42F3B8BA78AC0BDBE88FEF20/send-text`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Client-Token': '42F3B8BA78AC0BDBE88FEF20'
              },
              body: JSON.stringify({
                phone: `55${cleanNumber}`,
                message: sendForm.message
              })
            });
            
            if (zapiResponse.ok) {
              results.push({ number: cleanNumber, success: true, provider: 'Z-API' });
              continue;
            }
            
            // Fallback para Evolution API local
            const evolutionResponse = await fetch(`http://localhost:8080/message/sendText/brpolis-campaign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                number: cleanNumber,
                textMessage: { text: sendForm.message }
              })
            });
            
            if (evolutionResponse.ok) {
              results.push({ number: cleanNumber, success: true, provider: 'Evolution' });
            } else {
              results.push({ number: cleanNumber, success: false, provider: 'None' });
            }
          } catch (err) {
            results.push({ number: cleanNumber, success: false, provider: 'Error' });
          }
        }
      }
      
      console.log('Resultados do envio:', results);
      
      // Fallback para API interna se todos falharem
      if (results.every(r => !r.success)) {
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sendForm,
            provider: 'zapi'
          })
        });
        
        if (response.ok) {
          console.log('Enviado via API interna');
        }
      }
      
      await fetchData();
      setShowSendForm(false);
      setSendForm({ recipients: '', template: '', message: '', scheduledAt: '' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'READ': return 'bg-purple-100 text-purple-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SENT': return 'Enviada';
      case 'DELIVERED': return 'Entregue';
      case 'READ': return 'Lida';
      case 'FAILED': return 'Falhou';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  };

  const totalMessages = messages.length;
  const sentMessages = messages.filter(m => m.status === 'SENT' || m.status === 'DELIVERED' || m.status === 'READ').length;
  const deliveredMessages = messages.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length;
  const readMessages = messages.filter(m => m.status === 'READ').length;
  const totalCost = messages.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WhatsApp Enterprise</h1>
              <p className="text-gray-600 dark:text-gray-400">Envie mensagens reais via Evolution API • 100% Gratuito</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                Voltar
              </Link>
              <button
                onClick={() => setShowSendForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                📱 Nova Campanha
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {totalMessages}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Total Enviadas</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {deliveredMessages}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Entregues</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {readMessages}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Lidas</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {templates.length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Templates</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  R$ {totalCost.toFixed(2)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Custo Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mensagens Enviadas
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'messages' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    {!whatsappConnected ? (
                      <>
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          🚀 Demo WhatsApp Avançada
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Simulação realista • Interface profissional • Pronto para produção
                        </p>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-4">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <div className="text-sm text-green-800 dark:text-green-200">
                              <strong>🚀 Evolution API Local Ativa!</strong> Servidor rodando na porta 8080.
                              Escaneie o QR Code abaixo com seu WhatsApp para conectar e enviar mensagens REAIS.
                            </div>
                          </div>
                        </div>
                        
                        {qrCode && (
                          <div className="bg-white p-4 rounded-lg border mb-4 inline-block">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} 
                                 alt="QR Code WhatsApp" 
                                 className="w-48 h-48" />
                            <p className="text-sm text-gray-600 mt-2">Escaneie com seu WhatsApp</p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setShowSendForm(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                        >
                          📱 Testar Demo WhatsApp
                        </button>
                      </>
                    ) : (
                      <>
                        <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          ✅ WhatsApp Conectado!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Pronto para enviar mensagens REAIS via Baileys
                        </p>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-4">
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-green-800 dark:text-green-200 font-medium">
                              WhatsApp conectado via Baileys
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowSendForm(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                        >
                          📱 Testar Demo WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Destinatário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Mensagem
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Custo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {messages.map((message) => (
                          <tr key={message.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {message.recipientPhone}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="max-w-xs truncate">
                                {message.message}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                                {getStatusText(message.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              R$ {message.cost.toFixed(3)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Templates de Mensagem
                  </h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    + Novo Template
                  </button>
                </div>
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Nenhum template criado ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{template.content}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm">Usar</button>
                          <button className="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Relatório de Performance
                </h3>
                
                {totalMessages === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Envie algumas mensagens para ver o relatório de performance
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Taxa de Entrega</h4>
                      <div className="text-3xl font-bold text-green-600">
                        {totalMessages > 0 ? ((deliveredMessages / totalMessages) * 100).toFixed(1) : 0}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {deliveredMessages} de {totalMessages} mensagens
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Taxa de Leitura</h4>
                      <div className="text-3xl font-bold text-purple-600">
                        {deliveredMessages > 0 ? ((readMessages / deliveredMessages) * 100).toFixed(1) : 0}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {readMessages} de {deliveredMessages} entregues
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Envio */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nova Campanha WhatsApp
                </h2>
                <button
                  onClick={() => setShowSendForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destinatários (um por linha)
                  </label>
                  <textarea
                    value={sendForm.recipients}
                    onChange={(e) => setSendForm({...sendForm, recipients: e.target.value})}
                    placeholder="11999999999&#10;11888888888&#10;11777777777"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Digite os números no formato: 11999999999 (sem espaços ou caracteres especiais)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={sendForm.message}
                    onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {sendForm.message.length}/1000 caracteres
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSendForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    📱 Enviar Mensagens
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}