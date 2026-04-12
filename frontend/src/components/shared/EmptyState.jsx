/**
 * EmptyState — Shown when no data matches filters
 */
export default function EmptyState({ message = 'No results found', icon = '🔍' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-gray-400 text-lg font-medium">{message}</p>
      <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
    </div>
  );
}
