'use client';

import { useEffect, useRef, useState } from 'react';

export const PRODUCT_COLOR_OPTIONS: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'White', hex: '#F9FAFB' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Magenta', hex: '#D946EF' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Gold', hex: '#D4A017' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Salmon', hex: '#FA8072' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Peach', hex: '#FFCBA4' },
  { name: 'Rust', hex: '#B7410E' },
  { name: 'Mint', hex: '#98FF98' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Rose', hex: '#FF007F' },
  { name: 'Sky', hex: '#87CEEB' },
  { name: 'Wine', hex: '#722F37' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Plum', hex: '#DDA0DD' },
  { name: 'Khaki', hex: '#C3B091' },
  { name: 'Chocolate', hex: '#7B3F00' },
];

type ColorMultiSelectProps = {
  selected: string[];
  onChange: (colors: string[]) => void;
  label?: string;
  optional?: boolean;
};

export function ColorMultiSelect({
  selected,
  onChange,
  label = 'Available Colors',
  optional = true,
}: ColorMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const hexFor = (name: string) =>
    PRODUCT_COLOR_OPTIONS.find((o) => o.name === name)?.hex ?? '#6B7280';

  const addCustomColor = () => {
    const name = customName.trim();
    if (!name || selected.includes(name)) return;
    onChange([...selected, name]);
    setCustomName('');
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((c) => c !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const remove = (name: string) => {
    onChange(selected.filter((c) => c !== name));
  };

  const summary =
    selected.length === 0
      ? 'Select colors…'
      : selected.length <= 3
        ? selected.join(', ')
        : `${selected.slice(0, 3).join(', ')} +${selected.length - 3} more`;

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-sm font-semibold text-white mb-2">
        {label}{' '}
        {optional && <span className="text-foreground/50 text-xs">(Optional)</span>}
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-foreground/20 bg-primary/40 text-left text-foreground hover:border-button/50 focus:outline-none focus:ring-2 focus:ring-button/40 transition-colors"
      >
        <span className={selected.length === 0 ? 'text-foreground/50' : 'text-white'}>
          {summary}
        </span>
        <svg
          className={`w-5 h-5 text-foreground/60 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-foreground/20 bg-primary shadow-lg"
        >
          {PRODUCT_COLOR_OPTIONS.map(({ name, hex }) => {
            const isSelected = selected.includes(name);
            return (
              <label
                key={name}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-foreground/10 last:border-0 hover:bg-button/10 ${
                  isSelected ? 'bg-button/10' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(name)}
                  className="h-4 w-4 rounded border-foreground/30 text-button focus:ring-button/50"
                />
                <span
                  className="w-5 h-5 rounded-full border border-foreground/30 shrink-0"
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
                <span className="text-sm text-white">{name}</span>
              </label>
            );
          })}
          <div className="p-3 border-t border-foreground/10 flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
              placeholder="Custom color name"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-foreground/20 bg-primary/60 text-white"
            />
            <button
              type="button"
              onClick={addCustomColor}
              className="px-3 py-2 text-sm rounded-lg bg-button text-button-text font-medium"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
          placeholder="Or type a custom color and press Enter"
          className="flex-1 px-4 py-2 text-sm rounded-xl border border-foreground/20 bg-primary/40 text-white"
        />
        <button type="button" onClick={addCustomColor} className="px-4 py-2 rounded-xl bg-button text-button-text text-sm font-medium">
          Add color
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-button/20 text-button border border-button/30 rounded-lg text-sm font-medium"
            >
              <span
                className="w-3 h-3 rounded-full border border-foreground/30 shrink-0"
                style={{ backgroundColor: hexFor(color) }}
                aria-hidden
              />
              {color}
              <button
                type="button"
                onClick={() => remove(color)}
                className="ml-1 text-button hover:text-foreground transition-colors"
                aria-label={`Remove ${color}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
