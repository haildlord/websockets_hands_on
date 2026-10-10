import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Match, Commentary, CreateMatchInput, CreateCommentaryInput } from './types';
import { fetchMatches, createMatch, fetchCommentary, createCommentary } from './api';
import { useWebSocket } from './hooks/useWebSocket';
import { Header } from './components/Header';
import { MatchList } from './components/MatchList';
import { MatchDetail } from './components/MatchDetail';
import { CreateMatchModal } from './components/CreateMatchModal';
import { AddCommentaryModal } from './components/AddCommentaryModal';

export const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);
  const [isLoadingCommentary, setIsLoadingCommentary] = useState<boolean>(false);

  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState<boolean>(false);
  const [isAddCommentaryOpen, setIsAddCommentaryOpen] = useState<boolean>(false);

  const selectedMatchRef = useRef<Match | null>(null);
  selectedMatchRef.current = selectedMatch;

  // Real-time WebSocket event handlers
  const handleMatchCreated = useCallback((newMatch: Match) => {
    setMatches((prev) => {
      // Avoid duplicate insertion
      if (prev.some((m) => m.id === newMatch.id)) return prev;
      return [newMatch, ...prev];
    });
  }, []);

  const handleCommentaryCreated = useCallback((newCommentary: Commentary) => {
    // If this commentary belongs to currently active match, prepend it!
    if (selectedMatchRef.current && Number(selectedMatchRef.current.id) === Number(newCommentary.matchId)) {
      setCommentaries((prev) => {
        if (prev.some((c) => c.id === newCommentary.id)) return prev;
        return [newCommentary, ...prev];
      });

      // Update score in local match state if it's a goal or score event
      if (newCommentary.eventType?.toLowerCase() === 'goal') {
        setMatches((prevMatches) =>
          prevMatches.map((m) => {
            if (m.id === selectedMatchRef.current?.id) {
              const isHome =
                newCommentary.team &&
                m.homeTeam.toLowerCase().includes(newCommentary.team.toLowerCase());
              return {
                ...m,
                homeScore: isHome ? m.homeScore + 1 : m.homeScore,
                awayScore: !isHome ? m.awayScore + 1 : m.awayScore,
              };
            }
            return m;
          })
        );
      }
    }
  }, []);

  const { isConnected, subscribeToMatch, unsubscribeFromMatch } = useWebSocket({
    onMatchCreated: handleMatchCreated,
    onCommentaryCreated: handleCommentaryCreated,
  });

  // Load matches on start
  const loadMatches = useCallback(async () => {
    try {
      setIsLoadingMatches(true);
      const data = await fetchMatches();
      setMatches(data);
      if (data.length > 0 && !selectedMatchRef.current) {
        setSelectedMatch(data[0]);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Load commentary and subscribe to match on selection
  useEffect(() => {
    if (!selectedMatch) {
      setCommentaries([]);
      return;
    }

    const matchId = selectedMatch.id;
    subscribeToMatch(matchId);

    const loadCommentaryData = async () => {
      try {
        setIsLoadingCommentary(true);
        const data = await fetchCommentary(matchId);
        setCommentaries(data);
      } catch (err) {
        console.error('Failed to load commentary:', err);
        setCommentaries([]);
      } finally {
        setIsLoadingCommentary(false);
      }
    };

    loadCommentaryData();

    return () => {
      unsubscribeFromMatch(matchId);
    };
  }, [selectedMatch?.id, subscribeToMatch, unsubscribeFromMatch]);

  const handleCreateMatchSubmit = async (input: CreateMatchInput) => {
    const created = await createMatch(input);
    setMatches((prev) => [created, ...prev]);
    setSelectedMatch(created);
  };

  const handleCreateCommentarySubmit = async (matchId: number, input: CreateCommentaryInput) => {
    const created = await createCommentary(matchId, input);
    setCommentaries((prev) => [created, ...prev]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        isConnected={isConnected}
        onOpenCreateMatch={() => setIsCreateMatchOpen(true)}
      />

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <MatchList
          matches={matches}
          selectedMatch={selectedMatch}
          onSelectMatch={(m) => setSelectedMatch(m)}
          onRefresh={loadMatches}
          isLoading={isLoadingMatches}
        />

        <MatchDetail
          match={selectedMatch}
          commentaries={commentaries}
          isLoadingCommentary={isLoadingCommentary}
          onOpenAddCommentary={() => setIsAddCommentaryOpen(true)}
        />
      </main>

      {/* Modals */}
      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        onSubmit={handleCreateMatchSubmit}
      />

      <AddCommentaryModal
        isOpen={isAddCommentaryOpen}
        match={selectedMatch}
        onClose={() => setIsAddCommentaryOpen(false)}
        onSubmit={handleCreateCommentarySubmit}
      />
    </div>
  );
};

export default App;
