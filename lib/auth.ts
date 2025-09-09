// 🔐 BRPolis - Sistema de Autenticação

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  politicalRole?: string;
  planId?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  politicalRole?: string;
  state?: string;
  city?: string;
  party?: string;
  phone?: string;
  planId?: string;
  createdBy?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'brpolis_jwt_secret_change_in_production';
  private readonly JWT_EXPIRES_IN = '7d';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutos

  /**
   * Faz login do usuário
   */
  async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{
    success: boolean;
    token?: string;
    user?: AuthUser;
    error?: string;
  }> {
    try {
      const { email, password } = credentials;

      // Buscar usuário no banco
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { plan: true }
      });

      if (!user) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Verificar se conta está ativa
      if (!user.isActive) {
        return { success: false, error: 'Conta desativada. Entre em contato com o administrador.' };
      }

      // Verificar se conta está bloqueada
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
        return { success: false, error: `Conta bloqueada. Tente novamente em ${minutes} minutos.` };
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        // Incrementar tentativas de login
        const loginAttempts = user.loginAttempts + 1;
        const updateData: any = { loginAttempts };

        // Bloquear conta se exceder tentativas
        if (loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          updateData.lockedUntil = new Date(Date.now() + this.LOCK_TIME);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });

        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Verificar se plano está ativo (se houver)
      if (user.planExpiresAt && user.planExpiresAt < new Date()) {
        return { success: false, error: 'Plano expirado. Entre em contato para renovar.' };
      }

      // Reset tentativas de login e atualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date()
        }
      });

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      // Criar sessão no banco
      await prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        }
      });

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        politicalRole: user.politicalRole || undefined,
        planId: user.planId || undefined,
        isActive: user.isActive
      };

      return { success: true, token, user: authUser };

    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(userData: CreateUserData): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
  }> {
    try {
      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email.toLowerCase() }
      });

      if (existingUser) {
        return { success: false, error: 'Este email já está em uso' };
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          politicalRole: userData.politicalRole,
          state: userData.state,
          city: userData.city,
          party: userData.party,
          phone: userData.phone,
          planId: userData.planId,
          createdBy: userData.createdBy,
        }
      });

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        politicalRole: user.politicalRole || undefined,
        planId: user.planId || undefined,
        isActive: user.isActive
      };

      return { success: true, user: authUser };

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, error: 'Erro ao criar usuário' };
    }
  }

  /**
   * Verifica se token JWT é válido
   */
  async verifyToken(token: string): Promise<{
    valid: boolean;
    user?: AuthUser;
    error?: string;
  }> {
    try {
      // Verificar token JWT
      jwt.verify(token, this.JWT_SECRET);
      
      // Verificar se sessão existe no banco
      const session = await prisma.userSession.findUnique({
        where: { token }
      });
      
      if (!session || session.expiresAt < new Date()) {
        return { valid: false, error: 'Token expirado ou inválido' };
      }

      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { plan: true }
      });

      if (!user) {
        return { valid: false, error: 'Usuário não encontrado' };
      }

      // Atualizar último uso da sessão
      await prisma.userSession.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() }
      });

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        politicalRole: user.politicalRole || undefined,
        planId: user.planId || undefined,
        isActive: user.isActive
      };

      return { valid: true, user: authUser };

    } catch (error) {
      console.error('Erro na verificação do token:', error);
      return { valid: false, error: 'Token inválido' };
    }
  }

  /**
   * Faz logout (invalida token)
   */
  async logout(token: string): Promise<{ success: boolean }> {
    try {
      await prisma.userSession.delete({
        where: { token }
      });
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false };
    }
  }

  /**
   * Gera token para reset de senha
   */
  async generatePasswordResetToken(email: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return { success: false, error: 'Email não encontrado' };
      }

      // Gerar token único
      const token = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token,
          type: 'password_reset',
          expiresAt
        }
      });

      return { success: true, token };

    } catch (error) {
      console.error('Erro ao gerar token de reset:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Reseta senha usando token
   */
  async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
      });

      if (!verificationToken || verificationToken.expiresAt < new Date() || verificationToken.usedAt) {
        return { success: false, error: 'Token inválido ou expirado' };
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha do usuário
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { 
          password: hashedPassword,
          loginAttempts: 0,
          lockedUntil: null
        }
      });

      // Marcar token como usado
      await prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() }
      });

      return { success: true };

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  private generateSecureToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export default new AuthService();