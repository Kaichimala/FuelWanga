"use client";

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}

export default function ChipGroup<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="-mb-0.5 w-full text-[.85rem] text-muted">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className="min-h-[44px] cursor-pointer rounded-full border border-line bg-bg px-4 py-[9px] text-ink aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accenttext"
        >
          {o}
        </button>
      ))}
    </div>
  );
}
