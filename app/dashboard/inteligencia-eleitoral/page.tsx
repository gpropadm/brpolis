'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ElectoralData {
  totalVoters: number;
  supporterPercentage: number;
  potentialPercentage: number;
  undecidedPercentage: number;
  againstPercentage: number;
  averageScore: number;
  growthRate: number;
  topNeighborhoods: Array<{
    name: string;
    supporters: number;
    potential: number;
    percentage: number;
  }>;
  demographicData: Array<{
    segment: string;
    supporters: number;
    total: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    supporters: number;
    potential: number;
  }>;
}

interface PollData {
  id: string;
  question: string;
  responses: Array<{
    option: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
  createdAt: string;
}

export default function InteligenciaEleitoralPage() {
  const [electoralData, setElectoralData] = useState<ElectoralData | null>(null);
  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '', '']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [electoralRes, pollsRes] = await Promise.all([
        fetch('/api/analytics/electoral'),
        fetch('/api/polls')
      ]);
      
      if (electoralRes.ok) {
        const data = await electoralRes.json();
        setElectoralData(data.analytics);
      }
      
      if (pollsRes.ok) {
        const data = await pollsRes.json();
        setPolls(data.polls || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados eleitorais:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoll)
      });
      
      if (response.ok) {
        await fetchData();
        setShowNewPoll(false);
        setNewPoll({ question: '', options: ['', '', ''] });
      }
    } catch (error) {
      console.error('Erro ao criar enquete:', error);
    }
  };

  const addOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, '']
    });
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index)
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando inteligência eleitoral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inteligência Eleitoral</h1>
              <p className="text-gray-600 dark:text-gray-400">Analytics avançados e pesquisas de opinião</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                Voltar
              </Link>
              <button
                onClick={() => setShowNewPoll(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                📊 Nova Pesquisa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {electoralData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {electoralData.supporterPercentage.toFixed(1)}%
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Taxa de Apoio</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {electoralData.potentialPercentage.toFixed(1)}%
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Potencial de Conversão</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {electoralData.averageScore.toFixed(1)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Score Médio</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {electoralData.totalVoters.toLocaleString()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Base Total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('demographics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'demographics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Demografia
              </button>
              <button
                onClick={() => setActiveTab('geographic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'geographic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Geográfico
              </button>
              <button
                onClick={() => setActiveTab('polls')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'polls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pesquisas
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && electoralData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribuição de Status */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Distribuição Eleitoral
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Apoiadores</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {electoralData.supporterPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Potenciais</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {electoralData.potentialPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-500 rounded mr-3"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Indecisos</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {electoralData.undecidedPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Contra</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {electoralData.againstPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Crescimento */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Taxa de Crescimento
                    </h3>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${
                        electoralData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {electoralData.growthRate > 0 ? '+' : ''}{electoralData.growthRate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Últimos 30 dias
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'demographics' && electoralData && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Análise Demográfica
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Segmento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Apoiadores
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Taxa de Conversão
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {electoralData.demographicData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.segment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.supporters}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.percentage.toFixed(1)}%
                              </div>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'geographic' && electoralData && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Distribuição Geográfica
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                      Top Bairros por Apoio
                    </h4>
                    <div className="space-y-4">
                      {electoralData.topNeighborhoods.map((neighborhood, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {neighborhood.name}
                            </h5>
                            <span className="text-sm font-medium text-blue-600">
                              {neighborhood.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{neighborhood.supporters} apoiadores</span>
                            <span>{neighborhood.potential} potenciais</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">
                        Mapa interativo em desenvolvimento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'polls' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Pesquisas de Opinião
                  </h3>
                  <button
                    onClick={() => setShowNewPoll(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    + Nova Pesquisa
                  </button>
                </div>

                {polls.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma pesquisa criada
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Crie pesquisas para entender a opinião dos eleitores
                    </p>
                    <button
                      onClick={() => setShowNewPoll(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                      Criar Primeira Pesquisa
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {polls.map((poll) => (
                      <div key={poll.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                          {poll.question}
                        </h4>
                        <div className="space-y-3">
                          {poll.responses.map((response, index) => (
                            <div key={index}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-gray-300">{response.option}</span>
                                <span className="text-gray-500 dark:text-gray-400">{response.percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${response.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                          Total de votos: {poll.totalVotes}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Pesquisa */}
      {showNewPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Nova Pesquisa de Opinião
                </h2>
                <button
                  onClick={() => setShowNewPoll(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={createPoll} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pergunta
                  </label>
                  <textarea
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                    placeholder="Qual sua opinião sobre..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opções de Resposta
                  </label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newPoll.options];
                          newOptions[index] = e.target.value;
                          setNewPoll({...newPoll, options: newOptions});
                        }}
                        placeholder={`Opção ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Adicionar opção
                  </button>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewPoll(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Criar Pesquisa
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