import { AlertCircle } from 'lucide-react';
import { tid } from '@/lib/utils';

export function ErrorNotice({ id, message }: Readonly<{ id: string; message: string }>) {
  return (
    <div
      {...tid(id)}
      role="alert"
      className="flex max-w-sm items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-left text-sm text-rose-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
    </div>
  );
}
