'use client';

import React, { useState, useEffect } from 'react';
import { HrSidebar } from '@/components/hr/hr-sidebar';
import { HrHeader } from '@/components/hr/hr-header';

export default function RhPainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name?: string;
    email?: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--hr-bg)]">
      {/* Desktop Sidebar & Mobile Menu Drawer */}
      <HrSidebar
        userRole={user?.role || 'TECNICO_RH'}
        userName={user?.name || user?.email?.split('@')[0] || 'Utilizador RH'}
        userEmail={user?.email || 'rh@jmatos.co.ao'}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Breadcrumbs, Search, User, 2px orange line) */}
        <HrHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          user={user}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
