import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AppHeader from '@/components/AppHeader';
import MobileNav from '@/components/MobileNav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} />
        </div>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 navy-bg w-64 border-r border-slate-800/50">
            <Sidebar collapsed={false} />
          </SheetContent>
        </Sheet>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppHeader onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8 fade-in">
            <div className={cn('w-full mx-auto', sidebarCollapsed ? 'max-w-none' : 'max-w-[1800px]')}>
              <Outlet />
            </div>
          </main>
        </div>

        <MobileNav />
      </div>

      <footer className="border-t border-slate-200 bg-white/80 text-center text-xs text-slate-500 py-3 px-4">
        <span>© 2026 Kintetsu World Express, Inc. All rights reserved.</span>
        <span className="mx-2">|</span>
        <a href="#" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">Privacy</a>
      </footer>
    </div>
  );
}
