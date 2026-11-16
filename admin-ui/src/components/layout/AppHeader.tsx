'use client';

import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { signOut } from '@/components/auth/LogoutButton';
import { useSession } from '@/components/auth/SessionProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tid } from '@/lib/utils';

export function AppHeader({ onMenuClick }: Readonly<{ onMenuClick: () => void }>) {
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            {...tid('header-menu-button')}
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="truncate text-sm font-bold tracking-tight text-kwe-ink">KWE Rate &amp; Quote Management</div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              {...tid('header-user-menu')}
              aria-label="Account menu"
              className="flex h-10 items-center gap-2 rounded-xl pl-1.5 pr-3 transition-colors hover:bg-slate-100"
            >
              <UserAvatar email={user.email} className="h-8 w-8 from-kwe-ink to-slate-800" />
              <div className="hidden text-left md:block">
                <div {...tid('header-user-email')} className="text-sm font-semibold leading-tight text-slate-900">
                  {user.email}
                </div>
                <div {...tid('header-user-role')} className="text-[11px] leading-tight text-slate-500">
                  {user.name ?? 'KWE user'}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate font-semibold">{user.email}</span>
                <span className="text-xs font-normal text-slate-500">{user.permissions.length} permissions</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem {...tid('header-menu-logout')} onSelect={() => void signOut()} className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
