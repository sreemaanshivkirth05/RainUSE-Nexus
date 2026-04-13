"use client";

interface BooleanFilterProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}

export function BooleanFilter({ label, value, onChange }: BooleanFilterProps) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={value === true}
          ref={(el) => {
            if (el) el.indeterminate = value === undefined;
          }}
          onChange={() => {
            if (value === undefined) onChange(true);
            else if (value === true) onChange(undefined);
            else onChange(undefined);
          }}
          className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 h-4 w-4"
        />
        <span className="text-sm text-gray-300">{label}</span>
      </label>
    </div>
  );
}
