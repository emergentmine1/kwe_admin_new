import { ChevronDown } from 'lucide-react';
import { cn, slug } from '@/lib/utils';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  /** Label for the "show everything" option; omit when there is none. */
  all?: string;
  disabled?: boolean;
  className?: string;
  /** Placeholder shown while no value is chosen (form fields). */
  placeholder?: string;
  invalid?: boolean;
}

/** Shared native select: server-rendered, CSP-safe (no inline styles), mobile-native picker, stable locators. */
export function FilterSelect({ id, label, value, onChange, options, all, disabled, className, placeholder = 'Select…', invalid }: Readonly<Props>) {
  return (
    <div className={cn('relative h-10', className)}>
      <select
        id={id}
        name={id}
        data-testid={id}
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-full w-full appearance-none truncate rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
          invalid && 'border-red-400',
        )}
      >
        {!all && !value && <option value="" disabled>{placeholder}</option>}
        {all && <option value="all" id={`${id}-option-all`} data-testid={`${id}-option-all`}>{all}</option>}
        {options.map(([v, l]) => (
          <option key={v} value={v} id={`${id}-option-${slug(v)}`} data-testid={`${id}-option-${slug(v)}`}>
            {l}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
