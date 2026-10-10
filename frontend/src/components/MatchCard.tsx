import { Match } from '../types';
import { Clock, Shield, CheckCircle } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  isSelected: boolean;
  onSelect: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected, onSelect }) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div
      onClick={() => onSelect(match)}
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: isSelected ? 'rgba(30, 58, 138, 0.35)' : 'var(--bg-card)',
        border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
        boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.2)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
      }}
    >
      {/* Top Meta Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-dim)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          {match.sport}
        </span>

        {/* Status Badge */}
        {isLive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
            }} className="live-pulse" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', letterSpacing: '0.05em' }}>
              LIVE
            </span>
          </div>
        )}

        {isFinished && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}>
            <CheckCircle size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
              FT
            </span>
          </div>
        )}

        {match.status === 'scheduled' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}>
            <Clock size={12} color="var(--accent-amber)" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-amber)' }}>
              {formatTime(match.startTime)}
            </span>
          </div>
        )}
      </div>

      {/* Teams & Scores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{match.homeTeam}</span>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            color: isLive ? 'var(--text-main)' : 'var(--text-muted)',
          }}>
            {match.homeScore}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{match.awayTeam}</span>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            color: isLive ? 'var(--text-main)' : 'var(--text-muted)',
          }}>
            {match.awayScore}
          </span>
        </div>
      </div>
    </div>
  );
};
