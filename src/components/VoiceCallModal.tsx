import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, Play, Square, ShieldCheck, Sparkles, Check } from 'lucide-react';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  callerAvatar: string;
  callerRole: 'Driver' | 'Passenger';
  vehicleInfo?: string;
  phoneNumber?: string;
  onSendQuickChat?: (text: string) => void;
}

export default function VoiceCallModal({
  isOpen,
  onClose,
  callerName,
  callerAvatar,
  callerRole,
  vehicleInfo,
  phoneNumber,
  onSendQuickChat,
}: VoiceCallModalProps) {
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
  const [isPlayingSimVoice, setIsPlayingSimVoice] = useState<boolean>(false);

  // Audio Context Ref for ringtone & audio effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Helper to trigger Web Audio synthesizer ringtone
  const playTone = (freq1: number, freq2: number, durationMs: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;
      gain.gain.value = 0.08;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (e) {
          // ignore
        }
      }, durationMs);
    } catch (e) {
      // AudioContext fallback ignored if blocked
    }
  };

  // Ringtone interval
  useEffect(() => {
    if (!isOpen) return;

    setCallState('RINGING');
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(true);
    setIsPlayingSimVoice(false);

    // Initial ring tone
    playTone(440, 480, 800);

    const ringInterval = setInterval(() => {
      playTone(440, 480, 800);
    }, 2200);

    // Auto connect after 2.5s
    const connectTimer = setTimeout(() => {
      clearInterval(ringInterval);
      setCallState('CONNECTED');
      // Connected chime
      playTone(800, 1000, 200);
    }, 2800);

    return () => {
      clearInterval(ringInterval);
      clearTimeout(connectTimer);
    };
  }, [isOpen]);

  // Call duration counter
  useEffect(() => {
    if (callState !== 'CONNECTED') return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  // End call handler
  const handleHangUp = () => {
    playTone(300, 200, 300);
    setCallState('ENDED');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulate simulated driver voice response
  const handlePlayVoiceSim = () => {
    if (isPlayingSimVoice) {
      setIsPlayingSimVoice(false);
      return;
    }
    setIsPlayingSimVoice(true);
    playTone(520, 650, 1500);

    // Auto finish after 4 seconds
    setTimeout(() => {
      setIsPlayingSimVoice(false);
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-6 border border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Uber / Bolt VoIP Badge Header */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-3">
          <span className="flex items-center gap-1 text-emerald-400 font-extrabold uppercase tracking-wider">
            <ShieldCheck size={14} /> ZamTaxi VoIP Call
          </span>
          <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 font-semibold">
            In-App Free Call
          </span>
        </div>

        {/* Avatar & Pulse Wave */}
        <div className="py-2 space-y-4">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {callState === 'RINGING' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
                <div className="absolute -inset-3 rounded-full border border-emerald-500/20 animate-pulse" />
              </>
            )}
            {callState === 'CONNECTED' && (
              <div className="absolute -inset-2 rounded-full border-2 border-emerald-500/60 animate-pulse" />
            )}
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800 shadow-xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{callerName}</h3>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              {callerRole} {vehicleInfo ? `• ${vehicleInfo}` : ''}
            </p>
            {phoneNumber && (
              <p className="text-[10px] font-mono text-zinc-500 mt-1">{phoneNumber}</p>
            )}
          </div>

          {/* Call Status & Timer */}
          <div className="pt-1">
            {callState === 'RINGING' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-extrabold text-amber-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Ringing... Connecting VoIP
              </div>
            )}
            {callState === 'CONNECTED' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs font-mono font-extrabold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected • {formatTime(callDuration)}
              </div>
            )}
            {callState === 'ENDED' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-xs font-extrabold text-rose-400">
                Call Ended
              </div>
            )}
          </div>
        </div>

        {/* Audio Waveform visualizer when connected */}
        {callState === 'CONNECTED' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>VoIP Audio Stream</span>
              <span className="text-emerald-400 font-mono">HD Voice Active</span>
            </div>

            {/* Waveform graphic bars */}
            <div className="flex items-center justify-center gap-1 h-8 px-2">
              {[40, 75, 25, 90, 60, 30, 85, 100, 50, 70, 35, 80, 45, 95, 65].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlayingSimVoice ? 'bg-emerald-400 animate-bounce' : 'bg-emerald-500/40'
                  }`}
                  style={{
                    height: isPlayingSimVoice ? `${Math.max(15, (height * (i % 3 + 1)) % 100)}%` : `${height * 0.4}%`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            {/* Quick Driver/Rider Voice Simulation Button */}
            <button
              type="button"
              onClick={handlePlayVoiceSim}
              className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlayingSimVoice ? (
                <>
                  <Square size={12} className="fill-emerald-300" />
                  Playing Voice Message...
                </>
              ) : (
                <>
                  <Play size={12} className="fill-emerald-300" />
                  Play {callerRole} Voice Message ("I'm at the gate!")
                </>
              )}
            </button>
          </div>
        )}

        {/* Interactive Call Controls */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            disabled={callState !== 'CONNECTED'}
            className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition cursor-pointer ${
              isMuted
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            } ${callState !== 'CONNECTED' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span className="text-[10px] font-bold mt-1">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* Speakerphone */}
          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            disabled={callState !== 'CONNECTED'}
            className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition cursor-pointer ${
              isSpeaker
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            } ${callState !== 'CONNECTED' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isSpeaker ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="text-[10px] font-bold mt-1">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
          </button>

          {/* Switch to Chat */}
          <button
            type="button"
            onClick={() => {
              if (onSendQuickChat) {
                onSendQuickChat("Calling you via in-app chat!");
              }
              handleHangUp();
            }}
            className="flex flex-col items-center justify-center py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <MessageSquare size={20} />
            <span className="text-[10px] font-bold mt-1">Chat Instead</span>
          </button>
        </div>

        {/* Big Red Hang Up Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleHangUp}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-rose-950/50 cursor-pointer"
            id="hangup-voip-call-btn"
          >
            <PhoneOff size={18} />
            {callState === 'ENDED' ? 'Call Ended' : 'Hang Up Call'}
          </button>
        </div>
      </div>
    </div>
  );
}
