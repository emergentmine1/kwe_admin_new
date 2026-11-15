'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
}

/** Shared filter / pick-list select with automation-friendly ids on trigger and options. */
export function FilterSelect({ id, label, value, onChange, options, all, disabled, className }: Readonly<Props>) {
  return (
    <Select name={id} value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} data-testid={id} aria-label={label} className={cn('h-10 rounded-xl border-slate-200', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {all && (
          <SelectItem value="all" id={`${id}-option-all`} data-testid={`${id}-option-all`}>
            {all}
          </SelectItem>
        )}
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v} id={`${id}-option-${slug(v)}`} data-testid={`${id}-option-${slug(v)}`} className="capitalize">
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
