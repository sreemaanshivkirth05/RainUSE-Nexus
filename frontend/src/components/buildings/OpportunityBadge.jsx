import { getOpportunityClass, getOpportunityIcon } from '../../utils/formatters';

/**
 * OpportunityBadge — Colored badge for opportunity type
 */
export default function OpportunityBadge({ type }) {
  return (
    <span className={`opp-badge ${getOpportunityClass(type)}`}>
      <span>{getOpportunityIcon(type)}</span>
      {type}
    </span>
  );
}
