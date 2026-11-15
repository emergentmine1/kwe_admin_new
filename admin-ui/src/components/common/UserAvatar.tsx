import { cn } from '@/lib/utils';

export function UserAvatar({ email, className }: Readonly<{ email: string; className?: string }>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold uppercase text-white',
        className,
      )}
    >
      {email.slice(0, 2)}
    </div>
  );
}
