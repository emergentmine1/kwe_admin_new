import { cn } from '@/lib/utils';
import logo from '../../../public/Kwe-logo.png';

export function BrandLogo({ className, id = 'brand-logo' }: Readonly<{ className?: string; id?: string }>) {
  return <img src={logo.src} width={logo.width} height={logo.height} alt="KWE" id={id} data-testid={id} className={cn('h-8 w-auto', className)} />;
}
