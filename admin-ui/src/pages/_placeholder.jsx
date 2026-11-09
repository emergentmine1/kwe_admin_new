export default function PlaceholderPage({ title, description = 'This screen is not implemented in the current frontend build.' }) {
  return (
    <div className="p-8">
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">KWE admin</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

