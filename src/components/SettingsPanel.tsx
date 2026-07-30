import React, { useState } from 'react';
import { UserProfile } from '../types';
import TwoFactorAuthModal from './TwoFactorAuthModal';
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
  Trash2,
  MessageSquare,
  Send,
  Star,
  Smartphone,
  Lock,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { saveFeedbackToFirestore } from '../firebase';

interface SettingsPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onClearHistory?: () => void;
  addAuditLog?: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
}

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

export default function SettingsPanel({
  profile,
  setProfile,
  onClearHistory,
  addAuditLog
}: SettingsPanelProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');

  // Feedback State
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('General');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  // 2FA Security Modal State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [modal2FAMode, setModal2FAMode] = useState<'SETUP' | 'VERIFY'>('SETUP');

  const handleToggle2FA = () => {
    if (profile.is2FAEnabled) {
      if (confirm('Are you sure you want to disable Two-Factor Authentication? Your account security level will be reduced.')) {
        setProfile((prev) => ({
          ...prev,
          is2FAEnabled: false
        }));
        if (addAuditLog) {
          addAuditLog(
            (profile.role ? profile.role.toUpperCase() : 'RIDER') as any,
            `2-Factor Authentication DISABLED for user ${profile.name}.`
          );
        }
      }
    } else {
      setModal2FAMode('SETUP');
      setIs2FAModalOpen(true);
    }
  };

  const handleUpdate2FAState = (isEnabled: boolean, method: 'SMS' | 'TOTP' | 'EMAIL', phone: string) => {
    setProfile((prev) => ({
      ...prev,
      is2FAEnabled: isEnabled,
      twoFactorMethod: method,
      twoFactorPhone: phone || prev.phone || '+234 803 111 2233'
    }));
    if (addAuditLog) {
      addAuditLog(
        (profile.role ? profile.role.toUpperCase() : 'RIDER') as any,
        `2-Factor Authentication ENABLED for user ${profile.name} using ${method} channel.`
      );
    }
  };

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
    alert('User balance reset to default ₦100,000.00!');
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmittingFeedback(true);
    setFeedbackSuccess(false);

    try {
      const feedbackId = `fb-${Date.now()}`;
      const roleLabel = profile.isDriver ? 'Driver' : profile.role === 'admin' ? 'Admin' : 'Rider';
      const commentClean = feedbackText.trim();

      const feedbackData = {
        id: feedbackId,
        userId: profile.id || profile.name,
        userName: profile.name,
        userRole: roleLabel,
        category: feedbackCategory,
        comment: commentClean,
        rating: feedbackRating,
        timestamp: Date.now()
      };

      // 1. Save directly to Firestore persistent collection
      await saveFeedbackToFirestore(feedbackData);

      // 2. Add log entry as 'ADMIN' category log
      if (addAuditLog) {
        addAuditLog(
          'ADMIN',
          `[Feedback Submitted] ${roleLabel} ${profile.name} (${feedbackCategory}): "${commentClean}"`
        );
      }

      setFeedbackSuccess(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to save feedback to Firestore:', err);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
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

      {/* 3.5 Two-Factor Authentication (2FA) Security Control Panel */}
      <div className={`p-4 rounded-xl border space-y-3 transition ${
        profile.is2FAEnabled
          ? 'bg-emerald-50/60 border-emerald-300'
          : 'bg-[#FAF7F2] border-[#E5DFD3]'
      }`}>
        <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${
              profile.is2FAEnabled ? 'bg-emerald-700' : 'bg-zinc-800'
            }`}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-zinc-900">Two-Factor Authentication (2FA)</h4>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  profile.is2FAEnabled
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-zinc-200 text-zinc-700 border-zinc-300'
                }`}>
                  {profile.is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium mt-0.5">
                {profile.is2FAEnabled
                  ? `Active method: ${profile.twoFactorMethod || 'SMS'} • Verified phone ${profile.twoFactorPhone || profile.phone || '+234 803 111 2233'}`
                  : 'Add an extra layer of security to prevent unauthorized access'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle2FA}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer shadow-2xs ${
              profile.is2FAEnabled
                ? 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
            id="toggle-2fa-btn"
          >
            {profile.is2FAEnabled ? 'Disable 2FA' : 'Configure 2FA'}
          </button>
        </div>

        {profile.is2FAEnabled && (
          <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-zinc-700">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <KeyRound size={14} />
              <span>Passcode challenge enforced on login and high-value wallet transactions.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setModal2FAMode('VERIFY');
                setIs2FAModalOpen(true);
              }}
              className="text-emerald-800 underline hover:text-emerald-900 font-black cursor-pointer"
            >
              Test 2FA OTP Code
            </button>
          </div>
        )}
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

      {/* 5. Submit Feedback Section (Saves to Firestore & Logs as ADMIN category) */}
      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-zinc-900" />
            <h4 className="text-xs font-extrabold text-zinc-900">Submit Feedback & Comments</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Firestore Connected
          </span>
        </div>

        <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
          Submit comments as a rider or driver. Feedback is permanently stored in Firestore and logged for ADMIN audit inspection.
        </p>

        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          {/* Category Selector */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-700 mb-1">Feedback Category</label>
            <div className="flex flex-wrap gap-1.5">
              {['General', 'Bug Report', 'Driver Service', 'App Experience', 'Feature Request'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFeedbackCategory(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    feedbackCategory === cat
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-700 border-[#E5DFD3] hover:bg-zinc-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-700 mb-1">Experience Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    size={16}
                    className={star <= feedbackRating ? 'text-amber-500 fill-amber-500' : 'text-zinc-300'}
                  />
                </button>
              ))}
              <span className="text-[11px] font-extrabold text-zinc-700 ml-1.5">{feedbackRating}.0 / 5.0</span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-700 mb-1">Comment / Feedback Message</label>
            <textarea
              rows={3}
              required
              placeholder={`Share your feedback as a ${profile.isDriver ? 'Driver' : 'Rider'}...`}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full bg-white text-xs border border-[#E5DFD3] rounded-lg p-2.5 outline-none focus:border-zinc-900 font-medium text-zinc-900 resize-none shadow-xs"
              id="feedback-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingFeedback || !feedbackText.trim()}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-extrabold py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            id="submit-feedback-btn"
          >
            <Send size={13} />
            {isSubmittingFeedback ? 'Saving to Firestore...' : 'Submit Feedback to Admin'}
          </button>
        </form>

        {feedbackSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-extrabold flex items-center gap-2 animate-fade-in">
            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
            <span>Thank you! Your feedback is saved to Firestore and logged under ADMIN logs.</span>
          </div>
        )}
      </div>

      {/* 6. Utility Reset Actions */}
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

      {/* Two-Factor Authentication Modal */}
      <TwoFactorAuthModal
        isOpen={is2FAModalOpen}
        mode={modal2FAMode}
        userName={profile.name}
        userPhone={profile.twoFactorPhone || profile.phone || '+234 803 111 2233'}
        userEmail={profile.email || `${profile.name.toLowerCase().replace(/\s+/g, '')}@transit.ng`}
        userRole={profile.role || 'Rider'}
        onSuccess={() => {
          if (modal2FAMode === 'SETUP') {
            handleUpdate2FAState(true, 'SMS', profile.twoFactorPhone || profile.phone || '+234 803 111 2233');
          }
          setIs2FAModalOpen(false);
        }}
        onClose={() => setIs2FAModalOpen(false)}
        onUpdate2FAState={handleUpdate2FAState}
        addAuditLog={addAuditLog}
      />
    </div>
  );
}
