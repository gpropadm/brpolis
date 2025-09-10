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
      <div className="hidden lg:flex lg:flex-1 lg:w-[60%] bg-white relative overflow-hidden items-center justify-end pr-8">
        {/* Cartas de baralho embaralhadas - MAIORES */}
        <div className="relative w-[450px] mr-12">
          <div className="relative h-96 w-full">
            
            {/* Carta 1 - fundo esquerdo */}
            <div className="absolute top-8 left-4 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform rotate-12 hover:rotate-6 transition-all duration-500 hover:scale-105 cursor-pointer z-10">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 1" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 2 - meio esquerdo */}
            <div className="absolute top-4 left-20 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-105 cursor-pointer z-20">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 2" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 3 - centro */}
            <div className="absolute top-0 left-36 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform rotate-3 hover:rotate-1 transition-all duration-500 hover:scale-110 cursor-pointer z-30">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 3" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 4 - meio direito */}
            <div className="absolute top-6 right-20 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform -rotate-8 hover:-rotate-4 transition-all duration-500 hover:scale-105 cursor-pointer z-25">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 4" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 5 - fundo direito */}
            <div className="absolute top-12 right-4 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform rotate-15 hover:rotate-8 transition-all duration-500 hover:scale-105 cursor-pointer z-15">
              <img 
                src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 5" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 6 - baixo esquerdo */}
            <div className="absolute bottom-8 left-8 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform -rotate-12 hover:-rotate-6 transition-all duration-500 hover:scale-105 cursor-pointer z-20">
              <img 
                src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 6" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 7 - baixo centro */}
            <div className="absolute bottom-4 left-40 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform rotate-8 hover:rotate-4 transition-all duration-500 hover:scale-110 cursor-pointer z-35">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 7" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Carta 8 - baixo direito */}
            <div className="absolute bottom-6 right-8 w-32 h-48 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 transform -rotate-4 hover:rotate-0 transition-all duration-500 hover:scale-105 cursor-pointer z-25">
              <img 
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=450&fit=crop&crop=face" 
                alt="Pessoa 8" 
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Right Side - Login Form (40%) */}
      <div className="flex-1 lg:flex-none lg:w-[40%] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-4 xl:px-8 bg-white border-l border-gray-100">
        <div className="ml-0 w-full max-w-xs">
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

        </div>
      </div>
    </div>
  );
}