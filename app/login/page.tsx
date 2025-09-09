'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Erro ao fazer login');
        return;
      }

      // Login bem-sucedido - redirecionar para dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro ao fazer login. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Side - 70% */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-16 xl:px-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 right-10 bottom-10 bg-white/5 backdrop-blur-sm rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Transforme sua
              <span className="text-yellow-300"> campanha política</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              O sistema mais avançado do Brasil para gestão política com IA, WhatsApp em massa e analytics em tempo real
            </p>
          </div>

          {/* Features highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">IA Vertical</h3>
              <p className="text-sm text-blue-100">Insights políticos precisos com inteligência artificial especializada</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">WhatsApp 100k+</h3>
              <p className="text-sm text-blue-100">Envie milhares de mensagens simultaneamente com alta taxa de entrega</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics Avançado</h3>
              <p className="text-sm text-blue-100">Dashboards em tempo real com métricas eleitorais precisas</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-12 h-12 bg-red-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Geolocalização</h3>
              <p className="text-sm text-blue-100">Mapeamento inteligente de eleitores e zonas eleitorais</p>
            </div>
          </div>

          {/* People images */}
          <div className="flex justify-center items-center space-x-4">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full border-4 border-white/30 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                JS
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-semibold">
                MS
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                AC
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white/30 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                LB
              </div>
            </div>
            <p className="text-white/80 ml-4">
              <span className="font-semibold text-yellow-300">+2.500</span> políticos confiam no BRPolis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - 30% */}
      <div className="flex-1 lg:flex-none lg:w-[30%] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">BR</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">BRPolis</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sistema político mais avançado do Brasil
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="demo@brpolis.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Não tem conta? <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Solicite acesso</a>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © 2025 BRPolis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}