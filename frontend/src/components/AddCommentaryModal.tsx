import { useState } from 'react';
import { CreateCommentaryInput, Match } from '../types';
import { X, Send } from 'lucide-react';

interface AddCommentaryModalProps {
  isOpen: boolean;
  match: Match | null;
  onClose: () => void;
  onSubmit: (matchId: number, input: CreateCommentaryInput) => Promise<void>;
}

export const AddCommentaryModal: React.FC<AddCommentaryModalProps> = ({
  isOpen,
  match,
  onClose,
  onSubmit,
}) => {
  const [minute, setMinute] = useState<number>(45);
  const [period, setPeriod] = useState<string>('First Half');
  const [eventType, setEventType] = useState<string>('goal');
  const [actor, setActor] = useState<string>('');
  const [team, setTeam] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [tags, setTags] = useState<string>('highlight');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !match) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Message is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const parsedTags = tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);

      await onSubmit(match.id, {
        minute: Number(minute),
        period,
        eventType,
        actor: actor.trim() || undefined,
        team: team.trim() || undefined,
        message: message.trim(),
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      });

      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post commentary.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Post Live Commentary</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {match.homeTeam} vs {match.awayTeam}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Minute & Period */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Minute
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                }}
              >
                <option value="First Half">First Half</option>
                <option value="Second Half">Second Half</option>
                <option value="Extra Time">Extra Time</option>
                <option value="Penalties">Penalties</option>
                <option value="Full Time">Full Time</option>
              </select>
            </div>
          </div>

          {/* Event Type */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '14px',
              }}
            >
              <option value="goal">Goal ⚽</option>
              <option value="yellow_card">Yellow Card 🟨</option>
              <option value="red_card">Red Card 🟥</option>
              <option value="substitution">Substitution 🔄</option>
              <option value="chance">Big Chance 🔥</option>
              <option value="whistle">Whistle / Break ⏱️</option>
              <option value="commentary">General Update 💬</option>
            </select>
          </div>

          {/* Actor & Team */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Actor / Player
              </label>
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="e.g. Lionel Messi"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Team
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder={`e.g. ${match.homeTeam}`}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0f172a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Commentary Message *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the moment in detail..."
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '14px',
                resize: 'vertical',
              }}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. goal, banger, top-corner"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={isSubmitting}>
              <Send size={15} />
              <span>{isSubmitting ? 'Posting...' : 'Broadcast Live'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
