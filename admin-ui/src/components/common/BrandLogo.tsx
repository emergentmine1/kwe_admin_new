import Image from 'next/image';
import { cn } from '@/lib/utils';
import logo from '../../../public/Kwe-logo.png';

export function BrandLogo({ className, id = 'brand-logo' }: Readonly<{ className?: string; id?: string }>) {
  return <Image src={logo} alt="KWE" id={id} data-testid={id} className={cn('h-8 w-auto', className)} priority />;
}
