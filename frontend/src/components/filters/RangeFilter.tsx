"use client";

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  step?: number;
  formatValue?: (v: number) => string;
  onChangeMin: (value: number | undefined) => void;
  onChangeMax: (value: number | undefined) => void;
}

export function RangeFilter({
  label,
  min,
  max,
  currentMin,
  currentMax,
  step = 1,
  formatValue,
  onChangeMin,
  onChangeMax,
}: RangeFilterProps) {
  const fmt = formatValue || ((v: number) => v.toLocaleString());

  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={fmt(min)}
          value={currentMin ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value;
            onChangeMin(v === "" ? undefined : Number(v));
          }}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
        />
        <span className="text-gray-500 text-xs">to</span>
        <input
          type="number"
          placeholder={fmt(max)}
          value={currentMax ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value;
            onChangeMax(v === "" ? undefined : Number(v));
          }}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
