import { Trophy, Radio, Plus } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onOpenCreateMatch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, onOpenCreateMatch }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
        }}>
          <Trophy size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              SPORTZ<span style={{ color: 'var(--accent-cyan)' }}>.LIVE</span>
            </h1>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-cyan)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}>
              Realtime
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Live Match Intelligence & Commentary Feed
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* WebSocket Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            boxShadow: isConnected ? '0 0 8px var(--accent-emerald)' : 'none',
          }} className={isConnected ? 'live-pulse' : ''} />
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Radio size={14} />
            {isConnected ? 'WS Connected' : 'Reconnecting...'}
          </span>
        </div>

        {/* Create Match Action */}
        <button className="btn btn-primary" onClick={onOpenCreateMatch}>
          <Plus size={16} />
          <span>New Match</span>
        </button>
      </div>
    </header>
  );
};
