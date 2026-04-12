import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Landing from './pages/Landing';
import TopBuildings from './pages/TopBuildings';
import StateDashboard from './pages/StateDashboard';
import BuildingDetails from './pages/BuildingDetails';
import Methodology from './pages/Methodology';
import Compare from './pages/Compare';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/state/:stateId" element={<StateDashboard />} />
        <Route path="/buildings" element={<TopBuildings />} />
        <Route path="/buildings/:id" element={<BuildingDetails />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
        {/* Top Navigation */}
        <Header />

        {/* Main content area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1600px] mx-auto overflow-y-auto overflow-x-hidden">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
