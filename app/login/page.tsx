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
      {/* Left Side - Login Form (40%) */}
      <div className="flex-1 lg:flex-none lg:w-[40%] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center shadow-xl">
                <span className="text-3xl font-bold text-white">BR</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">BRPolis</h2>
            <p className="text-lg text-gray-600">
              Faça login em sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
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
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-base placeholder-gray-500"
                placeholder="Email ou telefone"
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
                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-base placeholder-gray-500"
                placeholder="Senha"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Esqueceu a senha?
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Não tem conta? <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Cadastre-se</a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animated People Cards (60%) */}
      <div className="hidden lg:flex lg:flex-1 lg:w-[60%] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden items-center justify-center p-12">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-200/30 rounded-full blur-2xl"></div>
        
        {/* Cards Container */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Main heading */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Junte-se aos
              <span className="text-primary-600"> jovens políticos</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mais de 2.500 candidatos já transformaram suas campanhas com o BRPolis
            </p>
          </div>

          {/* Floating people cards */}
          <div className="grid grid-cols-3 gap-8 perspective-1000">
            {/* Card 1 - Top Left */}
            <div className="transform hover:scale-105 transition-all duration-500 animate-float">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500 transform rotate-[-2deg] hover:rotate-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">AJ</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Ana Julia</h3>
                  <p className="text-sm text-gray-600 mb-3">Vereadora · São Paulo</p>
                  <p className="text-xs text-gray-500 italic">"Triplicou meu alcance!"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Top Center */}
            <div className="transform hover:scale-105 transition-all duration-500 animate-float-delay-1">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500 transform rotate-[1deg] hover:rotate-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">CM</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Carlos Miguel</h3>
                  <p className="text-sm text-gray-600 mb-3">Deputado · Rio de Janeiro</p>
                  <p className="text-xs text-gray-500 italic">"100k mensagens enviadas!"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Top Right */}
            <div className="transform hover:scale-105 transition-all duration-500 animate-float-delay-2">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500 transform rotate-[-1deg] hover:rotate-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">LS</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Luiza Santos</h3>
                  <p className="text-sm text-gray-600 mb-3">Prefeita · Brasília</p>
                  <p className="text-xs text-gray-500 italic">"IA mudou tudo!"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 - Bottom Left */}
            <div className="transform hover:scale-105 transition-all duration-500 animate-float-delay-3">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500 transform rotate-[2deg] hover:rotate-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">RF</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Rafael Ferreira</h3>
                  <p className="text-sm text-gray-600 mb-3">Governador · Minas Gerais</p>
                  <p className="text-xs text-gray-500 italic">"Resultados incríveis!"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 - Bottom Center */}
            <div className="transform hover:scale-105 transition-all duration-500 animate-float">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500 transform rotate-[-3deg] hover:rotate-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">MO</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Marina Oliveira</h3>
                  <p className="text-sm text-gray-600 mb-3">Senadora · Bahia</p>
                  <p className="text-xs text-gray-500 italic">"Sistema perfeito!"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6 - Bottom Right */}
            <div className="transform hover:scale-105 transition-all duration-500 animate-float-delay-1">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500 transform rotate-[1deg] hover:rotate-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">JS</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">João Silva</h3>
                  <p className="text-sm text-gray-600 mb-3">Deputado Federal · Ceará</p>
                  <p className="text-xs text-gray-500 italic">"Recomendo 100%!"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <div className="flex -space-x-3 mr-4">
                <div className="w-8 h-8 bg-primary-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">+</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                Junte-se a <span className="font-bold text-primary-600">2.500+ políticos</span> que confiam no BRPolis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}