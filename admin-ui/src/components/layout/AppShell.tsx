'use client';

import { useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8FAFC]">
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <Sidebar idPrefix="sidebar" collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent className="w-64 border-r border-slate-800/50 bg-kwe-ink p-0 text-slate-300">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar idPrefix="drawer" onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onMenuClick={() => setMobileOpen(true)} />
          <main id="main-content" className="w-full flex-1 px-4 py-6 pb-24 animate-in fade-in md:px-6 lg:px-8 lg:py-8 lg:pb-8">
            <div className={cn('mx-auto w-full', collapsed ? 'max-w-none' : 'max-w-[1800px]')}>{children}</div>
          </main>
        </div>

        <MobileNav />
      </div>
      <AppFooter />
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 px-4 py-3 pb-20 text-center text-xs text-slate-500 lg:pb-3">
      <span>© 2026 Kintetsu World Express, Inc. All rights reserved.</span>
      <span className="mx-2">|</span>
      <a
        href="https://www.kwe.com/privacy/"
        id="footer-privacy-link"
        data-testid="footer-privacy-link"
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
      >
        Privacy
      </a>
    </footer>
  );
}
