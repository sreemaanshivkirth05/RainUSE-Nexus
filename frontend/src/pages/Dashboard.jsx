import { useState } from 'react';
import { Link } from 'react-router-dom';
import KPIStats from '../components/dashboard/KPIStats';
import StateOverviewCards from '../components/dashboard/StateOverviewCards';
import TopStatesChart from '../components/dashboard/TopStatesChart';
import { getScoreClass, getViabilityColor } from '../utils/formatters';
import OpportunityBadge from '../components/buildings/OpportunityBadge';
import mockSummary from '../data/mockSummary.json';

/**
 * Dashboard — Main overview page with KPIs, state summaries, and top buildings
 */
export default function Dashboard() {
  const summary = mockSummary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Multi-state rainwater reuse opportunity overview
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Mock Data Active
        </div>
      </div>

      {/* KPI Cards */}
      <KPIStats summary={summary} />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top states chart - 2 cols */}
        <div className="lg:col-span-2">
          <TopStatesChart states={summary.state_summaries} />
        </div>

        {/* Top buildings preview */}
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-200 flex items-center gap-2">
              <span>🏢</span> Top Buildings
            </h3>
            <Link
              to="/buildings"
              className="text-xs text-water-400 hover:text-water-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {summary.top_buildings_preview?.map((building, index) => (
              <div
                key={building.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-800/80 flex items-center justify-center text-xs font-bold text-gray-500">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-300 truncate">{building.name}</div>
                  <div className="text-[11px] text-gray-500">{building.city}, {building.state}</div>
                </div>
                <span className={`score-badge px-2 py-0.5 text-xs ${getScoreClass(building.final_viability_score)}`}>
                  {building.final_viability_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* State overview cards */}
      <div>
        <h3 className="font-display font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>🗺️</span> State Coverage
        </h3>
        <StateOverviewCards states={summary.state_summaries} />
      </div>
    </div>
  );
}
