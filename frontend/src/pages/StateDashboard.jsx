import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Activity, Building2, Droplets, MapPin, ChevronLeft, FileSearch, ArrowRight, Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import BuildingFilters from '../components/buildings/BuildingFilters';
import CountUp from '../components/CountUp';
import { formatGallons, getScoreClass } from '../utils/formatters';
import { fetchSummary, fetchBuildings, fetchFilterMetadata } from '../lib/api';

const ITEMS_PER_PAGE = 5;

export default function StateDashboard() {
  const { stateId } = useParams();
  const navigate = useNavigate();
  
  const [stateData, setStateData] = useState(null);
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  const [selectedCity, setSelectedCity] = useState(null);
  const [drillDownBuildings, setDrillDownBuildings] = useState([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    state: stateId || "",
    city: "",
    min_score: "",
    max_score: "",
    opportunity_type: "",
    roof_area_min: "",
    roof_area_max: "",
    rainfall_min: "",
    rainfall_max: "",
    capture_min: "",
    capture_max: "",
    cooling_confidence_min: "",
    water_cost_min: "",
    flood_score_min: "",
    water_stress_min: "",
    esg_min: "",
    leed_min: "",
    energy_star_min: "",
    sort_by: "final_viability_score",
    sort_order: "desc",
    page: 1,
    page_size: ITEMS_PER_PAGE
  });

  // Load initial state aggregates and metadata
  useEffect(() => {
    async function loadStateInsights() {
      setLoading(true);
      try {
        const [sumRes, metaRes, bldgsRes] = await Promise.all([
          fetchSummary(),
          fetchFilterMetadata(),
          fetchBuildings(`state=${stateId}&page_size=5000`)
        ]);
        
        setMetadata(metaRes);
        
        const backendStateSum = sumRes.state_summaries?.find(
          s => s.state.toLowerCase() === stateId.toLowerCase()
        );
        
        const allBuildings = bldgsRes.buildings || [];
        
        let sumRain = 0;
        let rainCount = 0;
        let globalOppCounts = {};
        
        const cityInsightsMap = allBuildings.reduce((acc, b) => {
          if (b.annual_rain_inches !== null && b.annual_rain_inches !== undefined) {
            sumRain += parseFloat(b.annual_rain_inches);
            rainCount++;
          }
          
          const opp = b.opportunity_type || 'Balanced Opportunity';
          globalOppCounts[opp] = (globalOppCounts[opp] || 0) + 1;
          
          const city = b.city || 'Unknown';
          if (!acc[city]) {
            acc[city] = { name: city, building_count: 0, total_capture: 0, total_score: 0, opportunities: {} };
          }
          acc[city].building_count += 1;
          acc[city].total_capture += parseFloat(b.annual_capture_gallons || 0);
          acc[city].total_score += parseFloat(b.final_viability_score || 0);
          acc[city].opportunities[opp] = (acc[city].opportunities[opp] || 0) + 1;
          return acc;
        }, {});
        
        let dominantStateOpp = 'Balanced Opportunity';
        let maxGlobalCount = 0;
        Object.entries(globalOppCounts).forEach(([opp, c]) => {
           if (c > maxGlobalCount) { maxGlobalCount = c; dominantStateOpp = opp; }
        });

        const cData = Object.values(cityInsightsMap).map(city => {
          let dominantOpp = '';
          let maxCount = 0;
          Object.entries(city.opportunities).forEach(([opp, count]) => {
            if (count > maxCount) {
              maxCount = count;
              dominantOpp = opp;
            }
          });
          return {
            name: city.name,
            building_count: city.building_count,
            total_capture: city.total_capture,
            avg_score: Math.round(city.total_score / city.building_count),
            dominant_opportunity: dominantOpp
          };
        }).sort((a, b) => b.avg_score - a.avg_score);

        setCityData(cData);
        
        setStateData({
           state: backendStateSum?.state || stateId,
           building_count: backendStateSum?.total_buildings || allBuildings.length,
           avg_rainfall_inches: rainCount > 0 ? (sumRain / rainCount).toFixed(1) : 0,
           total_capture_gallons: backendStateSum?.total_capture || 0,
           avg_viability_score: backendStateSum?.avg_score ? Math.round(backendStateSum.avg_score) : 0,
           dominant_opportunity: dominantStateOpp
        });
        
      } catch (err) {
        console.error("Failed to load state insights", err);
      } finally {
        setLoading(false);
      }
    }
    loadStateInsights();
  }, [stateId]);

  // Load drill down data when filters/selectedCity change
  useEffect(() => {
    if (!selectedCity) return;
    
    async function loadDrillDown() {
      setDrillDownLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== "" && v !== null && v !== undefined) {
             params.append(k, v);
          }
        });
        
        params.set('state', stateId);
        params.set('city', selectedCity);
        
        const data = await fetchBuildings(params.toString());
        setDrillDownBuildings(data.buildings || []);
        setTotalPages(Math.ceil((data.count || 0) / filters.page_size));
      } catch (err) {
        console.error(err);
        setDrillDownBuildings([]);
      } finally {
        setDrillDownLoading(false);
      }
    }
    loadDrillDown();
  }, [selectedCity, filters, stateId]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
        <p>Loading state insights...</p>
      </div>
    );
  }

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
          <Link to={`/buildings?state=${encodeURIComponent(stateId)}`} className="flex-shrink-0 px-6 py-2.5 bg-zinc-100 text-black font-semibold rounded shadow hover:bg-white transition-all text-sm flex items-center gap-2">
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
                <CountUp to={parseFloat(kpi.value)} />
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
                            setFilters(prev => ({ ...prev, page: 1, city: city.name }));
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
                      onClick={() => navigate(`/buildings?state=${encodeURIComponent(stateId)}`)}
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
                      setFilters(prev => ({ ...prev, page: 1, city: "" }));
                    }}
                    className="flex shrink-0 items-center justify-center w-8 h-8 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-display font-medium text-zinc-200">{selectedCity} Top Candidates</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Exploring prospects in {selectedCity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  {/* Internal Filters specific to City */}
                  <div className="lg:col-span-1 h-full hidden lg:block">
                    <BuildingFilters 
                       filters={filters} 
                       metadata={metadata}
                       onFilterChange={(newFilters) => {
                         setFilters(newFilters);
                       }} 
                    />
                  </div>

                  {/* Filtered Building Output View */}
                  <div className="lg:col-span-3">
                    {drillDownLoading ? (
                       <div className="py-20 flex justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                       </div>
                    ) : (
                      <>
                        {drillDownBuildings.length === 0 ? (
                          <div className="text-center py-20 bg-zinc-900/30 rounded border border-white/5 border-dashed">
                            <FileSearch className="w-12 h-12 text-zinc-700 mx-auto mb-5" />
                            <p className="text-zinc-300 mb-2 font-medium text-lg">No prospects match your criteria</p>
                            <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">Try lowering utility limits or unchecking constraints.</p>
                            <button 
                              onClick={() => {
                                setFilters(prev => ({
                                   ...prev, min_score: '', max_score: '', opportunity_type: '',
                                   roof_area_min: '', capture_min: '', cooling_confidence_min: '',
                                   water_cost_min: '', flood_score_min: '', water_stress_min: '',
                                   esg_min: '', leed_min: '', energy_star_min: '', page: 1
                                }));
                              }}
                              className="px-6 py-2 flex items-center gap-2 mx-auto rounded border border-white/5 bg-zinc-900 hover:bg-zinc-800 hover:border-white/10 text-zinc-300 transition-all text-sm"
                            >
                              Clear Parameters
                            </button>
                          </div>
                        ) : (
                          <>
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
                                  {drillDownBuildings.map((building, i) => {
                                    const globalRank = (filters.page - 1) * filters.page_size + i + 1;
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

                            {totalPages > 1 && (
                              <div className="flex justify-center items-center gap-2 mt-6">
                                {[...Array(totalPages)].map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                                    className={`h-8 w-8 rounded flex items-center justify-center text-xs font-medium border transition-colors ${
                                      filters.page === i + 1 
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
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </PageWrapper>
  );
}
