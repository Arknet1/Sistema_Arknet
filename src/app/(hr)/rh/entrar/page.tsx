'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HrLogo } from '@/components/hr/hr-logo';
import { HrButton } from '@/components/hr/hr-button';
import { HrInput, HrField } from '@/components/hr/hr-input';
import { Lock, Mail, AlertCircle, Info } from 'lucide-react';

function HrLoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'session_expired'
      ? 'A sua sessão expirou. Por favor inicie sessão novamente.'
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, preencha o seu e-mail e palavra-passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Credenciais inválidas. Verifique o e-mail e palavra-passe.');
        setIsLoading(false);
        return;
      }

      // Check role and redirect appropriately
      const role = data.user?.role?.toUpperCase();

      if (role === 'FUNCIONARIO') {
        window.location.href = '/portal';
      } else if (role === 'TECNICO_RH' || role === 'ADMINISTRADOR' || data.user?.role === 'admin') {
        window.location.href = redirectParam && redirectParam.startsWith('/rh') ? redirectParam : '/rh';
      } else {
        // Fallback
        window.location.href = '/portal';
      }
    } catch {
      setErrorMessage('Ocorreu um erro de rede ao tentar iniciar sessão. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--hr-bg)]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] mb-4">
            <HrLogo href="/rh/entrar" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--hr-text)] tracking-tight">
            Recursos Humanos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--hr-text-muted)] mt-1">
            J.Matos Tecnologia · Gestão de Pessoas e Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-md)] p-6 sm:p-8">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-[var(--hr-status-error-bg)] border border-[var(--hr-border)] border-l-4 border-l-[var(--hr-status-error)] rounded-[var(--hr-radius-sm)] flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 text-[var(--hr-status-error)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--hr-status-error)] font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <HrField label="E-mail Corporativo" htmlFor="email" required>
              <HrInput
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@jmatos.co.ao"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </HrField>

            <HrField label="Palavra-passe" htmlFor="password" required>
              <HrInput
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </HrField>

            <div className="pt-2">
              <HrButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Aceder à Plataforma
              </HrButton>
            </div>
          </form>

          {/* First Access Guidance */}
          <div className="mt-6 pt-5 border-t border-[var(--hr-border-subtle)] flex items-start gap-2.5 text-xs text-[var(--hr-text-muted)]">
            <Info className="w-4 h-4 text-[var(--hr-primary)] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Primeiro acesso de colaborador? Utilize a senha temporária atribuída pelos Recursos Humanos na sua admissão.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-[var(--hr-text-light)] select-none">
          © {new Date().getFullYear()} J.Matos Tecnologia, Lda. Todos os direitos reservados.
        </div>
      </div>
    </main>
  );
}

export default function HrLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[var(--hr-bg)] flex items-center justify-center p-4">A carregar...</div>}>
      <HrLoginForm />
    </React.Suspense>
  );
}
