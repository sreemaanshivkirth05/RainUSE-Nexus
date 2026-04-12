/**
 * LoadingState — Skeleton loading state
 */
export default function LoadingState({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-800 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-800/60 rounded w-1/2" />
            </div>
            <div className="w-16 h-8 bg-gray-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
