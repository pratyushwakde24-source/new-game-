import React, { useState } from 'react';
import { ShieldAlert, Activity, CheckCircle, Database, RefreshCw, X, Server } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'flags'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">SPARKVERSE Admin Operations</h2>
              <p className="text-xs text-slate-400">Platform telemetry, score validation & feature flags</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 cursor-pointer transition ${
              activeTab === 'overview' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            System Health & DAU
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`pb-3 border-b-2 cursor-pointer transition ${
              activeTab === 'scores' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Authoritative Score Audit
          </button>
          <button
            onClick={() => setActiveTab('flags')}
            className={`pb-3 border-b-2 cursor-pointer transition ${
              activeTab === 'flags' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Feature Flags
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Metric KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Daily Active (DAU)</div>
                  <div className="text-2xl font-black text-white font-display mt-1">4,812</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">+18% this week</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Runs Completed</div>
                  <div className="text-2xl font-black text-white font-display mt-1">32,490</div>
                  <span className="text-[10px] text-cyan-400 font-semibold">98.2% completion</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Avg FPS Target</div>
                  <div className="text-2xl font-black text-emerald-400 font-display mt-1">59.8</div>
                  <span className="text-[10px] text-slate-400">Zero frame drops</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Plus Subscribers</div>
                  <div className="text-2xl font-black text-amber-300 font-display mt-1">348</div>
                  <span className="text-[10px] text-amber-400 font-semibold">7.2% conversion</span>
                </div>
              </div>

              {/* Server Nodes */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" /> Active Service Infrastructure
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">100% OPERATIONAL</span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>Web Realtime Gateway (Socket.IO):</span>
                    <span className="text-emerald-400">Active (port 3000)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>Deterministic Score Validator:</span>
                    <span className="text-emerald-400">Enforcing (LCG seeds)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>PostgreSQL Migration Schema:</span>
                    <span className="text-emerald-400">22 Tables Configured</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">Recent server score submissions and verification statuses:</div>
              {[
                { id: 'sub_912', user: 'AstroNova', score: 14820, duration: '94s', status: 'VALIDATED', seed: 948271 },
                { id: 'sub_911', user: 'VortexPilot', score: 12450, duration: '82s', status: 'VALIDATED', seed: 948271 },
                { id: 'sub_910', user: 'SpeedDemon_X', score: 999999, duration: '2s', status: 'REJECTED (IMPOSSIBLE_RATE)', seed: 81273 },
                { id: 'sub_909', user: 'CosmicDrifter', score: 10890, duration: '71s', status: 'VALIDATED', seed: 54109 },
              ].map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{sub.user}</div>
                    <div className="text-slate-400 font-mono text-[11px]">Seed: {sub.seed} • Duration: {sub.duration}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cyan-300 font-display text-sm">{sub.score.toLocaleString()} pts</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status.includes('VALIDATED')
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-3">
              {[
                { name: 'MULTIPLAYER_ROOMS_ENABLED', desc: 'Allows players to host and join real-time rooms', active: true },
                { name: 'DAILY_CHALLENGE_SYNC', desc: 'Authoritative global seeded runs for all platforms', active: true },
                { name: 'SPARK_PLUS_CHECKOUT', desc: 'Regional subscription checkout flow', active: true },
                { name: 'PBR_STUDIO_LIGHTING', desc: 'Real-time reflections via RoomEnvironment', active: true },
              ].map((flag) => (
                <div key={flag.name} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-white">{flag.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{flag.desc}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
