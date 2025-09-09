'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AIInsight {
  id: string;
  type: 'SENTIMENT' | 'TREND' | 'PREDICTION' | 'RECOMMENDATION';
  title: string;
  content: string;
  confidence: number;
  createdAt: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

export default function IAVerticalPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsightType, setSelectedInsightType] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [insightsRes, campaignsRes] = await Promise.all([
        fetch('/api/ai/insights'),
        fetch('/api/campaigns')
      ]);
      
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData.insights || []);
      }
      
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'SENTIMENT':
        return (
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </div>
        );
      case 'TREND':
        return (
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
            </svg>
          </div>
        );
      case 'PREDICTION':
        return (
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
          </div>
        );
      case 'RECOMMENDATION':
        return (
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getInsightTypeText = (type: string) => {
    switch (type) {
      case 'SENTIMENT': return 'Análise de Sentimento';
      case 'TREND': return 'Tendência';
      case 'PREDICTION': return 'Previsão';
      case 'RECOMMENDATION': return 'Recomendação';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-l-red-500 bg-red-50';
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50';
      case 'LOW': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredInsights = selectedInsightType === 'ALL' 
    ? insights 
    : insights.filter(insight => insight.type === selectedInsightType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">IA Vertical</h1>
              <p className="text-gray-600 dark:text-gray-400">Insights políticos com inteligência artificial</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                Voltar
              </Link>
              <button
                onClick={generateNewInsights}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isGenerating ? '🤖 Analisando...' : '🤖 Gerar Insights'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.filter(i => i.type === 'SENTIMENT').length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Análises de Sentimento</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.filter(i => i.type === 'TREND').length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Tendências</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.filter(i => i.type === 'PREDICTION').length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Previsões</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.filter(i => i.type === 'RECOMMENDATION').length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Recomendações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <select
            value={selectedInsightType}
            onChange={(e) => setSelectedInsightType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">Todos os Insights</option>
            <option value="SENTIMENT">Análise de Sentimento</option>
            <option value="TREND">Tendências</option>
            <option value="PREDICTION">Previsões</option>
            <option value="RECOMMENDATION">Recomendações</option>
          </select>
        </div>

        {/* Insights */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando insights da IA...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum insight disponível
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gere novos insights com nossa IA para obter análises políticas avançadas
            </p>
            <button
              onClick={generateNewInsights}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {isGenerating ? '🤖 Gerando...' : '🤖 Gerar Primeiros Insights'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInsights.map((insight) => (
              <div key={insight.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${getPriorityColor(insight.priority)}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getInsightTypeIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {insight.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {getInsightTypeText(insight.type)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            insight.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.priority === 'HIGH' ? 'Alta' : 
                             insight.priority === 'MEDIUM' ? 'Média' : 'Baixa'} Prioridade
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {insight.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Confiança:</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      insight.confidence >= 80 ? 'bg-green-500' :
                                      insight.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${insight.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {insight.confidence}%
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(insight.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}