import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';
import { useGameStore } from '../stores/useGameStore.ts';
import { useUserStore } from '../stores/useUserStore.ts';
import { ShieldCheck, Users, Copy, X, Loader2, Trophy, Play, Plus, Check } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'global' | 'friends'>('global');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [roomCode, setRoomCode] = useState<string>('SPARK-4829');
  const [roomSeed, setRoomSeed] = useState<number>(948271);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const { startGame } = useGameStore();
  const { profile } = useUserStore();

  // Load real server-validated scores from database
  useEffect(() => {
    if (isOpen && tab === 'global') {
      setIsLoading(true);
      apiClient
        .fetchLeaderboard(selectedMode, 25)
        .then((data) => {
          setEntries(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, tab, selectedMode]);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    const result = await apiClient.createMultiplayerRoom(profile.id, profile.username);
    if (result?.roomCode) {
      setRoomCode(result.roomCode);
      if (result.seed) setRoomSeed(result.seed);
    }
    setIsCreatingRoom(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoinAndLaunch = async () => {
    const code = inputJoinCode.trim().toUpperCase();
    if (!code) {
      setJoinError('Please enter a 6-10 character room code.');
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    const room = await apiClient.joinMultiplayerRoom(code, profile.id, profile.username);
    setIsJoining(false);

    if (room && room.seed) {
      onClose();
      startGame('friend', room.seed);
    } else {
      setJoinError('Room not found. Check code and try again.');
      setTimeout(() => setJoinError(null), 3500);
    }
  };

  const handleLaunchHostFlight = () => {
    onClose();
    startGame('friend', roomSeed);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white font-display">Galactic Leaderboards</h2>
            <p className="text-xs text-slate-400">Server-validated scores backed by PostgreSQL</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6">
          <button
            onClick={() => setTab('global')}
            className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
              tab === 'global' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Hall of Fame
          </button>
          <button
            onClick={() => setTab('friends')}
            className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
              tab === 'friends' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Friend Challenge Rooms
          </button>
        </div>

        {/* Mode filter pills */}
        {tab === 'global' && (
          <div className="flex items-center gap-2 px-6 pt-4 pb-1 overflow-x-auto text-xs font-semibold">
            {['all', 'endless', 'timetrial', 'daily', 'pattern'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-3 py-1 rounded-xl transition cursor-pointer capitalize ${
                  selectedMode === m
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1">
          {tab === 'global' ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
                <span className="text-xs">Connecting to PostgreSQL database...</span>
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-2.5">
                {entries.map((entry) => {
                  return (
                    <div
                      key={entry.userId + '_' + entry.rank}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                        entry.rank === 1
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : entry.rank === 2
                          ? 'bg-slate-800/40 border-slate-600/40'
                          : entry.rank === 3
                          ? 'bg-amber-900/10 border-amber-700/30'
                          : 'bg-slate-950/40 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                            entry.rank === 1
                              ? 'bg-amber-500 text-slate-950'
                              : entry.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : entry.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {entry.rank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{entry.username}</span>
                            {entry.isPlus && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950">
                                Plus
                              </span>
                            )}
                            <span title="Server Validated">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{entry.mode}</span>
                            <span>•</span>
                            <span>{entry.maxCombo}x combo</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-cyan-300 font-display">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">{entry.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white font-display">No Recorded Scores Yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
                  Complete your first flight to set a verified server record on the galactic leaderboard!
                </p>
              </div>
            )
          ) : (
            <div className="space-y-6">
              {/* Host Challenge Room Section */}
              <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white font-display mb-1">Host a Challenge Room</h4>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  Share your challenge code with friends so everyone flies the exact same procedural track and obstacles!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <div className="px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-cyan-300 font-black tracking-widest text-base shadow-inner">
                    {roomCode}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5 text-xs cursor-pointer border border-slate-700"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      disabled={isCreatingRoom}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5 text-xs cursor-pointer border border-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingRoom ? 'Generating...' : 'New Room'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/20 max-w-sm mx-auto">
                  <button
                    onClick={handleLaunchHostFlight}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Flight on Room Seed ({roomCode})</span>
                  </button>
                </div>
              </div>

              {/* Join Friend's Room Section */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                <h4 className="text-sm font-bold text-white font-display mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Join Friend's Room Code</span>
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Enter the 6-character room code given by your friend to sync tracks:
                </p>

                {joinError && (
                  <div className="mb-3 px-3 py-2 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                    {joinError}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputJoinCode}
                    onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SPARK-9482"
                    maxLength={14}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400 uppercase"
                  />
                  <button
                    onClick={handleJoinAndLaunch}
                    disabled={isJoining}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {isJoining ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                    <span>Join & Fly</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
