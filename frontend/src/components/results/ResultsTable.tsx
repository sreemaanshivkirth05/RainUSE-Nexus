"use client";

import { BuildingResult } from "@/lib/types";

interface ResultsTableProps {
  items: BuildingResult[];
  onSort: (field: string) => void;
  currentSort: { field: string; direction: "asc" | "desc" };
}

const COLUMNS = [
  { key: "final_viability_score", label: "Score", width: "w-16" },
  { key: "name", label: "Building", width: "w-64" },
  { key: "state", label: "State", width: "w-24" },
  { key: "city", label: "City", width: "w-28" },
  { key: "roof_area_sqft", label: "Roof (sqft)", width: "w-28" },
  { key: "annual_capture_gallons", label: "Capture (gal/yr)", width: "w-32" },
  { key: "opportunity_type", label: "Type", width: "w-40" },
] as const;

export function ResultsTable({ items, onSort, currentSort }: ResultsTableProps) {
  const getSortIcon = (field: string) => {
    if (currentSort.field !== field) return "↕";
    return currentSort.direction === "asc" ? "↑" : "↓";
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`${col.width} px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors select-none`}
              >
                {col.label}{" "}
                <span className="text-gray-600">{getSortIcon(col.key)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {items.map((building) => (
            <tr
              key={building.building_id}
              className="hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <td className="px-3 py-3">
                <span className={`font-bold tabular-nums ${scoreColor(building.final_viability_score)}`}>
                  {building.final_viability_score}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="font-medium text-gray-200 truncate max-w-64">
                  {building.name}
                </div>
              </td>
              <td className="px-3 py-3 text-gray-400">{building.state}</td>
              <td className="px-3 py-3 text-gray-400">{building.city}</td>
              <td className="px-3 py-3 text-gray-400 tabular-nums">
                {building.roof_area_sqft.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-gray-400 tabular-nums">
                {building.annual_capture_gallons.toLocaleString()}
              </td>
              <td className="px-3 py-3">
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  {building.opportunity_type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
