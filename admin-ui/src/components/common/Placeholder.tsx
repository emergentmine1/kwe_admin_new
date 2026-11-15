import { Card } from '@/components/common/Blocks';

export function Placeholder({ title, id }: Readonly<{ title: string; id: string }>) {
  return (
    <Card id={id} className="max-w-xl p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">KWE admin</p>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">This screen is not implemented in the current frontend build.</p>
    </Card>
  );
}
