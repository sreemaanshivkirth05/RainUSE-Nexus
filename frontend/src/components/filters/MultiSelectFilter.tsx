"use client";

import { FilterOption } from "@/lib/types";

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 cursor-pointer transition-colors text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 h-3.5 w-3.5"
            />
            <span className="text-gray-300 flex-1 truncate">{opt.value}</span>
            <span className="text-gray-500 text-xs tabular-nums">{opt.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
