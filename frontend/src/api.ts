import { Match, Commentary, CreateMatchInput, CreateCommentaryInput } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${API_BASE_URL}/matches`);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error('Failed to fetch matches');
  }
  const json = await res.json();
  return json.data || [];
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const res = await fetch(`${API_BASE_URL}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to create match');
  }
  return json.match;
}

export async function fetchCommentary(matchId: number): Promise<Commentary[]> {
  const res = await fetch(`${API_BASE_URL}/matches/${matchId}/commentary`);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error('Failed to fetch commentary');
  }
  const json = await res.json();
  return json.data || [];
}

export async function createCommentary(
  matchId: number,
  input: CreateCommentaryInput
): Promise<Commentary> {
  const res = await fetch(`${API_BASE_URL}/matches/${matchId}/commentary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to post commentary');
  }
  return json.commentary;
}
