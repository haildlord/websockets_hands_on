import { Commentary } from '../types';
import { MessageSquare, AlertTriangle, ArrowRightLeft, Flag, Award } from 'lucide-react';

interface CommentaryFeedProps {
  commentaries: Commentary[];
  isLoading: boolean;
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({ commentaries, isLoading }) => {
  const getEventIcon = (eventType?: string | null) => {
    switch (eventType?.toLowerCase()) {
      case 'goal':
        return <Award size={16} color="var(--accent-emerald)" />;
      case 'yellow_card':
      case 'card':
        return <AlertTriangle size={16} color="var(--accent-amber)" />;
      case 'red_card':
        return <AlertTriangle size={16} color="var(--accent-rose)" />;
      case 'substitution':
      case 'sub':
        return <ArrowRightLeft size={16} color="var(--accent-cyan)" />;
      case 'period':
      case 'halftime':
      case 'fulltime':
        return <Flag size={16} color="var(--accent-purple)" />;
      default:
        return <MessageSquare size={16} color="var(--text-dim)" />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px 0',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 310px)',
    }}>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
          Loading live commentary timeline...
        </div>
      )}

      {!isLoading && commentaries.length === 0 && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <MessageSquare size={32} color="var(--text-dim)" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>No Commentary Yet</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Real-time updates will appear live as soon as events occur.
            </p>
          </div>
        </div>
      )}

      {commentaries.map((item, index) => {
        const isGoal = item.eventType?.toLowerCase() === 'goal';

        return (
          <div
            key={item.id || index}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: isGoal ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
              border: `1px solid ${isGoal ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)'}`,
              transition: 'all 0.2s ease',
            }}
            className={index === 0 ? 'animate-new-event' : ''}
          >
            {/* Minute Pill */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minWidth: '44px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: '700',
                color: item.minute !== undefined && item.minute !== null ? 'var(--accent-cyan)' : 'var(--text-dim)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}>
                {item.minute !== undefined && item.minute !== null ? `${item.minute}'` : '--'}
              </span>
            </div>

            {/* Event Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {getEventIcon(item.eventType)}
                </span>

                {item.eventType && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: isGoal ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    letterSpacing: '0.05em',
                  }}>
                    {item.eventType}
                  </span>
                )}

                {item.period && (
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {item.period}
                  </span>
                )}

                {(item.actor || item.team) && (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                    {[item.actor, item.team].filter(Boolean).join(' • ')}
                  </span>
                )}
              </div>

              {/* Message text */}
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-main)' }}>
                {item.message}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {item.tags.map((tag: string, tIdx: number) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-dim)',
                        backgroundColor: '#1e293b',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
