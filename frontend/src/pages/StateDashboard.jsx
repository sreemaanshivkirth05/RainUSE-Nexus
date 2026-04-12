import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Building2, Droplets, MapPin, ChevronLeft, FileSearch } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import BuildingFilters from '../components/buildings/BuildingFilters';
import CountUp from '../components/CountUp';
import { formatGallons, getScoreClass } from '../utils/formatters';
import mockSummary from '../data/mockSummary.json';
import mockBuildings from '../data/mockBuildings.json';

export default function StateDashboard() {
  const { stateId } = useParams();
  const navigate = useNavigate();
  
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState({
    state: '',
    minRoofArea: '',
    roofOver100k: false,
    minRainfall: '',
    minHarvest: '',
    requireCooling: false,
    highWaterCost: false,
    highFloodRisk: false,
    requireESG: false,
    requireLEED: false,
    requireEnergyStar: false,
  });

  const normalizedStateId = stateId?.toLowerCase();
  const stateData = mockSummary.state_summaries.find(
    s => s.state.toLowerCase() === normalizedStateId
  );
  
  const stateBuildings = mockBuildings.filter(
    b => b.state.toLowerCase() === normalizedStateId
  );

  const filteredCityBuildings = useMemo(() => {
    if (!selectedCity) return [];
    
    return stateBuildings.filter(b => {
      if (b.city !== selectedCity) return false;
      if (filters.state && b.state !== filters.state) return false;
      if (filters.minRoofArea && b.roof_area_sqft < parseInt(filters.minRoofArea)) return false;
      if (filters.roofOver100k && !b.roof_over_100k) return false;
      if (filters.minRainfall && b.annual_rain_inches < parseInt(filters.minRainfall)) return false;
      if (filters.minHarvest && b.annual_capture_gallons < parseInt(filters.minHarvest)) return false;
      if (filters.requireCooling && b.cooling_tower_score < 0.7) return false;
      if (filters.highWaterCost && b.water_cost_score < 0.7) return false;
      if (filters.highFloodRisk && b.flood_score < 0.7) return false;
      if (filters.requireESG && b.esg_score < 0.5) return false;
      if (filters.requireLEED && b.leed_score < 0.5) return false;
      if (filters.requireEnergyStar && b.energy_star_score < 0.5) return false;
      return true;
    }).slice(0, 20); // strict top 20 constraint
  }, [selectedCity, stateBuildings, filters]);

  // Group and aggregate data geographically by city
  const cityInsightsMap = stateBuildings.reduce((acc, b) => {
    const city = b.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = {
        name: city,
        building_count: 0,
        total_capture: 0,
        total_score: 0,
        opportunities: {}
      };
    }
    acc[city].building_count += 1;
    acc[city].total_capture += b.annual_capture_gallons || 0;
    acc[city].total_score += b.final_viability_score || 0;
    
    // Count opportunity types to find the dominant one later
    const opp = b.opportunity_type || 'Balanced Opportunity';
    acc[city].opportunities[opp] = (acc[city].opportunities[opp] || 0) + 1;
    
    return acc;
  }, {});

  // Compute final average and dominant traits for each city
  const cityData = Object.values(cityInsightsMap).map(city => {
    // Determine the most frequent opportunity
    let dominantOpp = '';
    let maxCount = 0;
    for (const [opp, count] of Object.entries(city.opportunities)) {
      if (count > maxCount) {
        maxCount = count;
        dominantOpp = opp;
      }
    }

    return {
      name: city.name,
      building_count: city.building_count,
      total_capture: city.total_capture,
      avg_score: Math.round(city.total_score / city.building_count),
      dominant_opportunity: dominantOpp
    };
  }).sort((a, b) => b.avg_score - a.avg_score);

  if (!stateData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-zinc-200 font-display mb-4">State Not Found</h2>
        <Link to="/" className="text-emerald-500 hover:underline">Return to Map</Link>
      </div>
    );
  }

  const kpis = [
    { label: 'Candidate Buildings', value: stateData.building_count, icon: <Building2 className="w-4 h-4" />, suffix: '' },
    { label: 'Avg Rainfall', value: stateData.avg_rainfall_inches, icon: <Droplets className="w-4 h-4" />, suffix: ' in' },
    { label: 'Capture Potential', value: stateData.total_capture_gallons, icon: <Activity className="w-4 h-4" />, suffix: ' gal' },
    { label: 'Avg Score', value: stateData.avg_viability_score, icon: <MapPin className="w-4 h-4" />, suffix: '/100', badge: 'High' }
  ];

  return (
    <PageWrapper className="max-w-6xl mx-auto pb-12">
      <div className="mb-10 border-b border-white/5 pb-8 relative mt-4">
        <Link to="/" className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-flex items-center gap-2 transition-colors">
          <span>←</span> Regional Select
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl md:text-5xl font-medium text-white tracking-tight">
                {stateData.state}
              </h1>
              <span className="px-3 py-1 rounded bg-zinc-900 border border-white/5 text-zinc-400 text-xs font-mono tracking-widest mt-2 uppercase">
                {stateData.dominant_opportunity}
              </span>
            </div>
            <p className="text-zinc-500 mt-3 text-lg">Strategic water reuse analysis for {stateData.building_count} commercial assets.</p>
          </div>
          <Link to="/buildings" className="flex-shrink-0 px-6 py-2.5 bg-zinc-100 text-black font-semibold rounded shadow hover:bg-white transition-all text-sm flex items-center gap-2">
            View All Data <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {kpis.map((kpi, index) => (
          <div key={index} className="p-6 rounded bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <span className="text-zinc-500">{kpi.icon}</span>
              {kpi.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {kpi.badge}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-medium text-zinc-100 tracking-tight">
                <CountUp to={kpi.value} />
              </span>
              <span className="text-sm font-medium text-zinc-500">{kpi.suffix}</span>
            </div>
            <h3 className="text-xs text-zinc-600 mt-2 uppercase tracking-wide">{kpi.label}</h3>
          </div>
        ))}
      </div>

      <div className="w-full">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl h-full p-6">
            {!selectedCity ? (
              // City Overview Data Table
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-medium text-zinc-200">Top Regional Hubs</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 font-medium">Rank</th>
                        <th className="px-4 py-3 font-medium">City</th>
                        <th className="px-4 py-3 font-medium">Candidates</th>
                        <th className="px-4 py-3 font-medium">Capacity</th>
                        <th className="px-4 py-3 font-medium text-right">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cityData.slice(0, 5).map((city, index) => (
                        <tr 
                          key={city.name} 
                          onClick={() => {
                            setSelectedCity(city.name);
                            setCurrentPage(1);
                          }}
                          className="border-b border-white/5 hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 py-4 text-zinc-600 font-mono">#{index + 1}</td>
                          <td className="px-4 py-4 font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                            {city.name}
                          </td>
                          <td className="px-4 py-4 text-zinc-400">{city.building_count}</td>
                          <td className="px-4 py-4 text-zinc-400">{formatGallons(city.total_capture)}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={`score-badge px-2 py-0.5 ${getScoreClass(city.avg_score)} min-w-[3rem] text-center inline-block`}>
                              {city.avg_score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {cityData.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-sm italic">
                    No cities mapped for this state yet.
                  </div>
                )}
                
                {cityData.length > 0 && (
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => navigate('/buildings')}
                      className="px-5 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors border border-white/5"
                    >
                      Analyze all {stateData.building_count} regional assets
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Specific City Building Table Drill-down with Filtering
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => {
                      setSelectedCity(null);
                      setCurrentPage(1);
                    }}
                    className="flex shrink-0 items-center justify-center w-8 h-8 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-display font-medium text-zinc-200">{selectedCity} Top Candidates</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Filtering {stateBuildings.filter(b => b.city === selectedCity).length} structures inside {selectedCity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  {/* Internal Filters specific to City */}
                  <div className="lg:col-span-1 h-full hidden lg:block">
                    <BuildingFilters filters={filters} onFilterChange={(newFilters) => {
                      setFilters(newFilters);
                      setCurrentPage(1); // reset pagination when filtering
                    }} />
                  </div>

                  {/* Filtered Building Output View */}
                  <div className="lg:col-span-3">
                    {(() => {
                      const totalPages = Math.ceil(filteredCityBuildings.length / itemsPerPage);
                      const currentBuildings = filteredCityBuildings.slice(
                        (currentPage - 1) * itemsPerPage, 
                        currentPage * itemsPerPage
                      );

                      if (filteredCityBuildings.length === 0) {
                        return (
                          <div className="text-center py-20 bg-zinc-900/30 rounded border border-white/5 border-dashed">
                            <FileSearch className="w-12 h-12 text-zinc-700 mx-auto mb-5" />
                            <p className="text-zinc-300 mb-2 font-medium text-lg">No prospects match your criteria</p>
                            <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">Try lowering utility limits or unchecking constraints.</p>
                            <button 
                              onClick={() => {
                                setFilters({state: '', roofOver100k: false, requireCooling: false, highWaterCost: false, highFloodRisk: false, requireESG: false, requireLEED: false, requireEnergyStar: false, minRoofArea:'', minRainfall:'', minHarvest:''});
                                setCurrentPage(1);
                              }}
                              className="px-6 py-2 flex items-center gap-2 mx-auto rounded border border-white/5 bg-zinc-900 hover:bg-zinc-800 hover:border-white/10 text-zinc-300 transition-all text-sm"
                            >
                              Clear Parameters
                            </button>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Mobile Filter toggle spacer handling would go here, omitting for density as it wasn't requested */}
                          <div className="overflow-x-auto rounded border border-white/5 bg-zinc-900/10">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                              <thead className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest border-b border-white/5">
                                <tr>
                                  <th className="px-4 py-3 font-medium">Rank</th>
                                  <th className="px-4 py-3 font-medium">Building Name</th>
                                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Opportunity Type</th>
                                  <th className="px-4 py-3 font-medium text-right">Harvest</th>
                                  <th className="px-4 py-3 font-medium text-right">Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentBuildings.map((building, i) => {
                                  const globalRank = (currentPage - 1) * itemsPerPage + i + 1;
                                  return (
                                    <tr 
                                      key={building.id}
                                      onClick={() => navigate(`/buildings/${building.id}`)}
                                      className="border-b border-white/5 hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                                    >
                                      <td className="px-4 py-4 text-zinc-600 font-mono">#{globalRank}</td>
                                      <td className="px-4 py-4 font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                                        {building.name}
                                      </td>
                                      <td className="px-4 py-4 text-zinc-400 hidden sm:table-cell text-xs max-w-[200px] truncate">
                                        {building.opportunity_type}
                                      </td>
                                      <td className="px-4 py-4 text-zinc-400 text-right font-mono text-xs">
                                        {formatGallons(building.annual_capture_gallons)}
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                        <span className={`score-badge px-2 py-0.5 ${getScoreClass(building.final_viability_score)} min-w-[3rem] text-center inline-block`}>
                                          {building.final_viability_score}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mathematical Pagination */}
                          {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                              {[...Array(totalPages)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(i + 1)}
                                  className={`h-8 w-8 rounded flex items-center justify-center text-xs font-medium border transition-colors ${
                                    currentPage === i + 1 
                                      ? 'bg-zinc-800 border-white/10 text-white' 
                                      : 'border-transparent hover:bg-zinc-800 hover:border-white/5 text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </PageWrapper>
  );
}
