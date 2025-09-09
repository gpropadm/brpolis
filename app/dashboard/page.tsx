'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  politicalRole?: string;
  planId?: string;
  isActive: boolean;
}

interface DashboardMetrics {
  totalVoters: number;
  supporterPercentage: number;
  messagesSent: number;
  messagesRead: number;
  responseRate: number;
  campaignBudgetUsed: number;
  electoralZones: number;
  aiInsightsGenerated: number;
  lastUpdated: Date;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.success) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      loadMetrics();
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      router.push('/login');
    }
  };

  const loadMetrics = async () => {
    // Simulando carregamento de métricas
    setTimeout(() => {
      setMetrics({
        totalVoters: 45782,
        supporterPercentage: 68.5,
        messagesSent: 125430,
        messagesRead: 89801,
        responseRate: 23.4,
        campaignBudgetUsed: 67.2,
        electoralZones: 24,
        aiInsightsGenerated: 156,
        lastUpdated: new Date()
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const getPoliticalRoleLabel = (role?: string) => {
    const labels: { [key: string]: string } = {
      'PRESIDENT': 'Presidente',
      'GOVERNOR': 'Governador(a)',
      'SENATOR': 'Senador(a)',
      'FEDERAL_DEPUTY': 'Dep. Federal',
      'STATE_DEPUTY': 'Dep. Estadual',
      'MAYOR': 'Prefeito(a)',
      'COUNCILOR': 'Vereador(a)'
    };
    return role ? labels[role] || role : 'Não definido';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}>
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center mb-5 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mr-3">
              <span className="text-sm font-bold text-white">BR</span>
            </div>
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">BRPolis</span>
          </div>

          {/* User Info */}
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {getPoliticalRoleLabel(user.politicalRole)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <a href="#" className="flex items-center w-full p-2 text-gray-900 bg-gray-100 rounded-lg group dark:text-white dark:bg-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">Dashboard</span>
            </a>

            <a href="/dashboard/ia-vertical" className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-white dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">IA Vertical</span>
            </a>

            <a href="/dashboard/whatsapp" className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-white dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">WhatsApp Enterprise</span>
            </a>

            <a href="/dashboard/inteligencia-eleitoral" className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-white dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">Inteligência Eleitoral</span>
            </a>

            <a href="/dashboard/crm" className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-white dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 715 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">CRM Eleitoral</span>
            </a>
          </nav>

          {/* Logout */}
          <div className="mt-auto pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-white dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 ms-3 whitespace-nowrap">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-4">Dashboard Político</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Bem-vindo, {user.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6">
          {/* KPIs Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Eleitores */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <span>+12.5%</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.totalVoters.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Eleitores</p>
            </div>

            {/* Taxa de Apoio */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <span>+8.2%</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.supporterPercentage}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Apoio</p>
            </div>

            {/* Mensagens WhatsApp */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg dark:bg-purple-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <span>+156%</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.messagesSent.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mensagens Enviadas</p>
            </div>

            {/* Taxa de Resposta */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg dark:bg-yellow-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <span>+5.1%</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.responseRate}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Resposta</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Bem-vindo ao BRPolis, {user.name}! 🎉
                </h2>
                <p className="text-blue-100">
                  Seu sistema político está ativo como <strong>{getPoliticalRoleLabel(user.politicalRole)}</strong>. 
                  Gerencie sua campanha com as ferramentas mais avançadas do Brasil.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nova Campanha WhatsApp</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Crie uma nova campanha de mensagens em massa.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar Eleitores</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Importe ou cadastre novos eleitores em sua base.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg dark:bg-purple-900 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório de IA</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Veja os insights mais recentes da inteligência artificial.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última atualização: {metrics?.lastUpdated.toLocaleString('pt-BR')}
            </p>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}