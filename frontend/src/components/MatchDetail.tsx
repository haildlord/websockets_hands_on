import { Match, Commentary } from '../types';
import { CommentaryFeed } from './CommentaryFeed';
import { Shield, Plus, Clock, CheckCircle } from 'lucide-react';

interface MatchDetailProps {
  match: Match | null;
  commentaries: Commentary[];
  isLoadingCommentary: boolean;
  onOpenAddCommentary: () => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({
  match,
  commentaries,
  isLoadingCommentary,
  onOpenAddCommentary,
}) => {
  if (!match) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        gap: '12px',
        padding: '40px',
      }}>
        <Shield size={48} color="rgba(255, 255, 255, 0.1)" />
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>Select a Match</h3>
        <p style={{ fontSize: '14px', maxWidth: '360px', textAlign: 'center' }}>
          Choose a match from the sidebar to view the live scoreboard and real-time commentary stream.
        </p>
      </div>
    );
  }

  const isLive = match.status === 'live';

  return (
    <div style={{
      flex: 1,
      padding: '24px 32px',
      overflowY: 'auto',
      height: 'calc(100vh - 73px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Big Scoreboard Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Banner Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent-cyan)',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            padding: '4px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}>
            {match.sport}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isLive ? (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '800',
                color: '#ef4444',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }} className="live-pulse" />
                MATCH IN PROGRESS
              </span>
            ) : match.status === 'finished' ? (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(148, 163, 184, 0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--text-muted)',
              }}>
                <CheckCircle size={14} />
                FULL TIME
              </span>
            ) : (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--accent-amber)',
              }}>
                <Clock size={14} />
                SCHEDULED
              </span>
            )}
          </div>
        </div>

        {/* Big Teams & Center Score */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '24px',
          textAlign: 'center',
        }}>
          {/* Home Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={32} color="var(--accent-cyan)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{match.homeTeam}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>HOME</span>
          </div>

          {/* Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '44px',
              fontWeight: '800',
              letterSpacing: '-1px',
              color: 'var(--text-main)',
            }}>
              <span>{match.homeScore}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '32px' }}>:</span>
              <span>{match.awayScore}</span>
            </div>
          </div>

          {/* Away Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '2px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={32} color="var(--accent-purple)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{match.awayTeam}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>AWAY</span>
          </div>
        </div>
      </div>

      {/* Commentary Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Live Commentary
          </h3>
          <span style={{
            fontSize: '11px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            color: 'var(--accent-cyan)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '700',
          }}>
            {commentaries.length} events
          </span>
        </div>

        <button className="btn btn-emerald" onClick={onOpenAddCommentary}>
          <Plus size={16} />
          <span>Post Commentary</span>
        </button>
      </div>

      {/* Live Timeline Feed */}
      <CommentaryFeed
        commentaries={commentaries}
        isLoading={isLoadingCommentary}
      />
    </div>
  );
};
