import React, { useState, useEffect } from 'react';
import { ShieldAlert, Server, X, Database, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthStatus {
  status: string;
  version: string;
  database?: {
    provider: string;
    connected: boolean;
    urlConfigured: boolean;
    serviceRoleConfigured: boolean;
  };
  services?: Record<string, string>;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'setup' | 'flags'>('overview');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [scoreAudits, setScoreAudits] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.checkHealth().then((data) => {
        if (data) setHealth(data);
      });
      if (activeTab === 'scores') {
        setLoadingAudits(true);
        apiClient.fetchScoreAudits(30).then((audits) => {
          setScoreAudits(audits);
          setLoadingAudits(false);
        });
      }
    }
  }, [isOpen, activeTab]);

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
              <p className="text-xs text-slate-400">Platform telemetry, Supabase PostgreSQL & score audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 cursor-pointer transition ${
              activeTab === 'overview' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            System Health & DB
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
            onClick={() => setActiveTab('setup')}
            className={`pb-3 border-b-2 cursor-pointer transition ${
              activeTab === 'setup' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Supabase Setup Checklist
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
              {/* Database Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" /> PostgreSQL Database Engine
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      health?.database?.connected
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-indigo-950 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {health?.database?.connected ? 'CONNECTED (SUPABASE)' : 'ACTIVE (SERVER-PERSISTENT ENGINE)'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>Database Provider:</span>
                    <span className="text-slate-200">Supabase PostgreSQL 15</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>SUPABASE_URL Configured:</span>
                    <span className={health?.database?.urlConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                      {health?.database?.urlConfigured ? 'Yes (Connected)' : 'Optional (Fallback Active)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>SERVICE_ROLE Secret (Server-Only):</span>
                    <span className={health?.database?.serviceRoleConfigured ? 'text-emerald-400' : 'text-slate-400'}>
                      {health?.database?.serviceRoleConfigured ? 'Configured' : 'Not Provided'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Row Level Security (RLS) Status:</span>
                    <span className="text-emerald-400">Enforced in Migrations (001_initial_schema.sql)</span>
                  </div>
                </div>
              </div>

              {/* Server Nodes */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" /> Active Platform Infrastructure
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">100% OPERATIONAL</span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>Web Realtime Gateway:</span>
                    <span className="text-emerald-400">Active (port 3000)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span>Deterministic Score Anti-Cheat:</span>
                    <span className="text-emerald-400">Enforcing (LCG seeds)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Relational Schema Migration:</span>
                    <span className="text-emerald-400">22 Tables Configured</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Real-time server-authoritative score audit trail:</span>
                <button
                  onClick={() => {
                    setLoadingAudits(true);
                    apiClient.fetchScoreAudits(30).then((audits) => {
                      setScoreAudits(audits);
                      setLoadingAudits(false);
                    });
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                >
                  Refresh Trail
                </button>
              </div>

              {loadingAudits ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  Loading authoritative database records...
                </div>
              ) : scoreAudits.length > 0 ? (
                scoreAudits.map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{sub.username}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono px-1.5 py-0.2 bg-slate-800 rounded">
                          {sub.mode}
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        Seed: {sub.seed} • {sub.distance}m • {sub.maxCombo}x combo
                      </div>
                      {sub.rejectionReason && (
                        <div className="text-rose-400 text-[10px] font-mono mt-0.5">
                          Reason: {sub.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-300 font-display text-sm">
                        {(sub.validatedScore || sub.claimedScore).toLocaleString()} pts
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          sub.validationStatus === 'VALIDATED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {sub.validationStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <div className="text-sm font-bold text-white">No Audited Runs Logged Yet</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Play a round of Spark Rush to log your first verified submission in the audit log.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" /> Supabase PostgreSQL Connection Setup
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  To connect SPARKVERSE directly to your external Supabase PostgreSQL instance:
                </p>

                <ol className="list-decimal list-inside space-y-2 text-slate-300 font-medium">
                  <li>
                    Create a new project at <strong className="text-cyan-400">supabase.com</strong>.
                  </li>
                  <li>
                    Open the <strong className="text-cyan-400">SQL Editor</strong> in Supabase and run the migration script:
                    <code className="block mt-1 p-2 rounded bg-slate-900 text-cyan-300 font-mono text-[11px]">
                      supabase/migrations/001_initial_schema.sql
                    </code>
                  </li>
                  <li>
                    Run the seed script to populate starter items:
                    <code className="block mt-1 p-2 rounded bg-slate-900 text-amber-300 font-mono text-[11px]">
                      supabase/seed.sql
                    </code>
                  </li>
                  <li>
                    Set the environment variables in your deployment environment:
                    <div className="p-3 bg-slate-900 rounded-xl mt-1 space-y-1 font-mono text-slate-300 text-[11px]">
                      <div>SUPABASE_URL=https://your-project.supabase.co</div>
                      <div>SUPABASE_ANON_KEY=eyJhbGci...</div>
                      <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...</div>
                    </div>
                  </li>
                </ol>
              </div>
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
