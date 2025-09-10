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
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Young Politicians Photos (60%) */}
      <div className="hidden lg:flex lg:flex-1 lg:w-[60%] bg-white relative overflow-hidden items-center justify-center">
        {/* Main photos grid - similar to Instagram */}
        <div className="relative max-w-lg mx-auto">
          {/* Central layout with overlapping photos */}
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">AJ</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-1">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">CM</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-2">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">LS</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">RF</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-3">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">MO</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-1">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">JS</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">PC</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-2">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">BM</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-3">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">TA</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">LR</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-1">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">GA</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-2">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">JM</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">AS</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-3">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">RG</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float-delay-1">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">MD</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 animate-float">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">FH</span>
              </div>
            </div>
          </div>

          {/* Bottom message */}
          <div className="text-center mt-8">
            <p className="text-gray-600 font-medium">
              Mais de <span className="font-bold text-primary-600">2.500 jovens políticos</span> usam BRPolis
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (40%) */}
      <div className="flex-1 lg:flex-none lg:w-[40%] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 xl:px-16 bg-white border-l border-gray-100">
        <div className="mx-auto w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">BR</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">BRPolis</h2>
            <p className="text-sm text-gray-600">
              Faça login em sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all text-sm placeholder-gray-500"
                placeholder="Telefone, nome de usuário ou email"
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all text-sm placeholder-gray-500"
                placeholder="Senha"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-xs text-gray-500 bg-white">OU</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="text-center">
            <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Esqueceu a senha?
            </a>
          </div>
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-600">
            Não tem uma conta? <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
}