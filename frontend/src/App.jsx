import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Landing from './pages/Landing';
import TopBuildings from './pages/TopBuildings';
import StateDashboard from './pages/StateDashboard';
import BuildingDetails from './pages/BuildingDetails';
import Methodology from './pages/Methodology';
import Compare from './pages/Compare';
import MapView from './pages/MapView';
import StateInsights from './pages/StateInsights';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1600px] mx-auto overflow-y-auto">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/state/:stateId" element={<StateDashboard />} />
            <Route path="/buildings" element={<TopBuildings />} />
            <Route path="/buildings/:id" element={<BuildingDetails />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/states" element={<StateInsights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}