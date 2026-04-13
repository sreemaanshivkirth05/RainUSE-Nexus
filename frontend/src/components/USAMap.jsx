import { useNavigate } from 'react-router-dom';
import { TARGET_STATES } from '../utils/constants';

function slugifyState(name) {
  return encodeURIComponent(name.replace(/\s+/g, '-'));
}

export default function USAMap() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {TARGET_STATES.map((state) => {
        const stateName = typeof state === 'string' ? state : state.name;

        return (
          <button
            key={stateName}
            onClick={() => navigate(`/state/${slugifyState(stateName)}`)}
            className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800/60 hover:border-white/20 transition-all text-left"
          >
            {stateName}
          </button>
        );
      })}
    </div>
  );
}