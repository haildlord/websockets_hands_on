import { useState } from 'react';
import { Match, MatchStatus } from '../types';
import { MatchCard } from './MatchCard';
import { RefreshCw } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  selectedMatch,
  onSelectMatch,
  onRefresh,
  isLoading,
}) => {
  const [filter, setFilter] = useState<'all' | MatchStatus>('all');

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const liveCount = matches.filter((m) => m.status === 'live').length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '360px',
      flexShrink: 0,
      borderRight: '1px solid var(--border-color)',
      padding: '20px',
      height: 'calc(100vh - 73px)',
      overflowY: 'auto',
    }}>
      {/* List Header with filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Matches
          <span style={{
            fontSize: '11px',
            backgroundColor: '#1e293b',
            color: 'var(--text-muted)',
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            {matches.length}
          </span>
        </h2>

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          style={{ padding: '6px 10px', fontSize: '12px' }}
          title="Refresh matches"
        >
          <RefreshCw size={13} className={isLoading ? 'live-pulse' : ''} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        backgroundColor: '#0f172a',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
      }}>
        {(['all', 'live', 'scheduled', 'finished'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 0',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filter === tab ? '#1e293b' : 'transparent',
              color: filter === tab ? 'var(--text-main)' : 'var(--text-dim)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            {tab === 'live' && liveCount > 0 && (
              <span style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
              }} />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredMatches.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '13px',
            border: '1px dashed var(--border-color)',
            borderRadius: '12px',
          }}>
            No {filter !== 'all' ? filter : ''} matches found.
          </div>
        ) : (
          filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isSelected={selectedMatch?.id === match.id}
              onSelect={onSelectMatch}
            />
          ))
        )}
      </div>
    </div>
  );
};
