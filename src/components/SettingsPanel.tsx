import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Key,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Award,
  DollarSign,
  Map,
  BadgePercent,
  CheckCircle,
  HelpCircle,
  Trash2
} from 'lucide-react';

interface SettingsPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onClearHistory?: () => void;
}

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

export default function SettingsPanel({ profile, setProfile, onClearHistory }: SettingsPanelProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'UBERFREE') {
      setProfile((prev) => ({
        ...prev,
        balance: parseFloat((prev.balance + 50.0).toFixed(2)),
      }));
      setPromoApplied(true);
      setPromoCode('');
    } else if (code === 'VIP99') {
      setProfile((prev) => ({
        ...prev,
        rating: 5.0,
      }));
      setPromoApplied(true);
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try "UBERFREE" or "VIP99"!');
    }
  };

  const handleResetEarnings = () => {
    setProfile((prev) => ({
      ...prev,
      balance: 100.0,
    }));
    alert('User balance reset to default $100.00!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#E5DFD3] p-5 space-y-5 text-zinc-900 max-h-[85vh] overflow-y-auto">
      {/* 1. Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5DFD3]">
        <div className="p-2 bg-zinc-900 text-white rounded-xl">
          <Key size={18} />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-zinc-900">Integration & Settings</h3>
          <p className="text-[11px] text-zinc-600 font-medium">Configure credentials and profile parameters</p>
        </div>
      </div>

      {/* 2. Google Maps API Key Connection Diagnostic Status */}
      <div className={`p-4 rounded-xl border ${hasValidKey ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'} space-y-3`}>
        <div className="flex items-start gap-2.5">
          {hasValidKey ? (
            <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="text-amber-700 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-extrabold text-xs text-zinc-900">Google Maps Platform API Status</h4>
            <p className="text-[11px] text-zinc-700 font-medium mt-0.5 leading-relaxed">
              {hasValidKey
                ? 'Your Google Maps API Key is active. The application is pulling real coordinate routers and live Google Maps vector frames.'
                : 'No Google Maps API key provided. The application is running in fully simulated City Canvas mode.'}
            </p>
          </div>
        </div>

        {/* Quick Instructions on entering Secrets */}
        {!hasValidKey && (
          <div className="bg-white p-3 rounded-xl border border-[#E5DFD3] text-[11px] text-zinc-700 space-y-1.5 leading-relaxed shadow-xs">
            <span className="font-extrabold text-zinc-900 block">How to attach your Google Maps Key:</span>
            <ol className="list-decimal pl-4 space-y-1 text-zinc-600 font-medium">
              <li>
                Get a key from the{' '}
                <a
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold underline hover:text-emerald-800"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>
                Click the <b>Settings</b> (⚙️ gear icon in the top-right corner of the editor)
              </li>
              <li>
                Select <b>Secrets</b>, click <b>Add Secret</b>
              </li>
              <li>
                Set the Name to <code className="bg-[#FAF7F2] border border-[#E5DFD3] px-1 py-0.5 rounded text-zinc-900 font-bold">GOOGLE_MAPS_PLATFORM_KEY</code>
              </li>
              <li>Paste your API key as the Value, and press Enter!</li>
            </ol>
            <p className="text-[10px] text-zinc-500 font-semibold italic mt-1 font-sans">
              *The simulator will rebuild automatically once the secret is applied.
            </p>
          </div>
        )}
      </div>

      {/* 3. Driver Profile Details */}
      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] space-y-3">
        <h4 className="text-xs font-extrabold text-zinc-900">Account Profile details</h4>

        <div className="flex items-center gap-3">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-11 h-11 rounded-full object-cover border border-[#E5DFD3]"
          />
          <div>
            <h5 className="font-extrabold text-xs text-zinc-900">{profile.name}</h5>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono mt-0.5 font-bold">
              <span>RIDER RATING: {profile.rating.toFixed(2)} ★</span>
              <span>•</span>
              <span>ROLE: {profile.isDriver ? 'Driver Partner' : 'Passenger'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mock Balances / Promo codes */}
      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] space-y-3">
        <h4 className="text-xs font-extrabold text-zinc-900">Promo codes & Mock Tokens</h4>

        <form onSubmit={handleApplyPromo} className="flex gap-1.5">
          <input
            type="text"
            placeholder="e.g. UBERFREE"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-white text-xs border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 outline-none focus:border-zinc-900 font-mono font-bold text-zinc-900"
            id="promo-code-input"
          />
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer"
            id="apply-promo-btn"
          >
            Apply
          </button>
        </form>

        {promoApplied && (
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle size={10} /> Promo applied successfully!
          </div>
        )}

        {promoError && <div className="text-[10px] text-rose-600 font-bold">{promoError}</div>}

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E5DFD3] text-zinc-600 leading-relaxed font-semibold">
          <span>Useful Codes:</span>
          <div className="flex gap-1.5 font-mono text-[10px]">
            <span className="bg-zinc-900 text-white px-1.5 py-0.5 rounded font-bold">UBERFREE</span>
            <span className="bg-zinc-900 text-white px-1.5 py-0.5 rounded font-bold">VIP99</span>
          </div>
        </div>
      </div>

      {/* 5. Utility Reset Actions */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={handleResetEarnings}
          className="w-full py-2 bg-white border border-[#E5DFD3] hover:bg-[#FAF7F2] text-zinc-900 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          id="reset-balance-btn"
        >
          <DollarSign size={14} /> Reset Cash Balance to ₦100,000.00
        </button>

        {onClearHistory && (
          <button
            onClick={() => {
              onClearHistory();
              alert('Simulation booking logs cleared!');
            }}
            className="w-full py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            id="clear-logs-btn"
          >
            <Trash2 size={14} /> Clear Active Simulation Logs
          </button>
        )}
      </div>
    </div>
  );
}
