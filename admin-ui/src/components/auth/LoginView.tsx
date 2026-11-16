import { SsoButton } from '@/components/auth/SsoButton';
import { ErrorNotice } from '@/components/common/ErrorNotice';
import type { AuthMode } from '@/lib/auth/roles';
import logo from '../../../public/Kwe-logo.png';

const HERO =
  'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600';

interface Props {
  mode: AuthMode;
  from: string;
  message?: string;
}

export function LoginView({ mode, from, message }: Readonly<Props>) {
  return (
    <div id="login-page" data-testid="login-page" className="grid min-h-dvh font-condensed lg:grid-cols-2">
      <div className="flex min-h-dvh flex-col bg-white lg:min-h-0">
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="flex w-full max-w-[760px] flex-col items-center justify-center text-center">
            <img src={logo.src} width={logo.width} height={logo.height} alt="KWE" id="login-logo" data-testid="login-logo" className="h-16 w-auto sm:h-20" />
            <div className="mt-10 text-base font-medium uppercase tracking-[0.18em] text-[#A8954A] sm:text-lg">Welcome To</div>
            <h1
              id="login-title"
              data-testid="login-title"
              className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-[#111827] sm:text-5xl md:text-6xl"
            >
              Rate &amp; Quote
              <br />
              Management
            </h1>
            {message && (
              <div className="mt-6">
                <ErrorNotice id="login-error" message={message} />
              </div>
            )}
            <SsoButton mode={mode} from={from} />
            <div className="mt-12 text-sm text-slate-500 sm:text-base">Rate &amp; Quote Management System (RQMS)</div>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
          <span>© 2026 Kintetsu World Express, Inc. All rights reserved.</span>
          <span className="mx-2">|</span>
          <a
            href="https://www.kwe.com/privacy/"
            id="login-privacy-link"
            data-testid="login-privacy-link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            Privacy
          </a>
        </footer>
      </div>
      <div className="relative hidden items-center overflow-hidden bg-[#1A2333] px-20 lg:flex">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[#1A2333]/60" />
        <h2 className="relative w-full text-center text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
          Streamlined
          <br />
          Freight Pricing
          <br />
          &amp; Management.
        </h2>
      </div>
    </div>
  );
}
