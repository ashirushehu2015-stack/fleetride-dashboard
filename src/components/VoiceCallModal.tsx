import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, Play, Square, ShieldCheck, Sparkles, Radio, Activity } from 'lucide-react';

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

// Convert 32-bit Float PCM to 16-bit Int PCM Base64
function pcmToBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  let binary = '';
  const bytes = new Uint8Array(int16Array.buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);
  const [isPlayingSimVoice, setIsPlayingSimVoice] = useState<boolean>(false);

  // Live API States
  const [useLiveApi, setUseLiveApi] = useState<boolean>(true);
  const [liveStatus, setLiveStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'SPEAKING' | 'ERROR'>('DISCONNECTED');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Refs for Web Audio & WebSockets
  const audioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Helper to trigger Web Audio synthesizer ringtone / chime
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

  // Play audio chunk received from Gemini Live API at 24kHz
  const playAudioChunk = (base64Pcm: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Pcm);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
      }

      const buffer = ctx.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

      setLiveStatus('SPEAKING');
      setAudioLevel(0.8);
      setTimeout(() => {
        setAudioLevel(0.3);
      }, (buffer.duration * 1000) || 500);
    } catch (e) {
      console.error('[Live API] Playback error:', e);
    }
  };

  // Connect to Gemini Live API WebSocket endpoint
  const startLiveSession = async () => {
    try {
      setLiveStatus('CONNECTING');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('[Live API Client] WebSocket open');
        setLiveStatus('CONNECTED');

        // Request microphone access for audio input
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const inputCtx = new AudioCtx({ sampleRate: 16000 });

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          source.connect(processor);
          processor.connect(inputCtx.destination);

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current) return;
            const float32 = e.inputBuffer.getChannelData(0);

            // Compute volume energy
            let sum = 0;
            for (let i = 0; i < float32.length; i += 10) {
              sum += float32[i] * float32[i];
            }
            const rms = Math.sqrt(sum / (float32.length / 10));
            setAudioLevel(Math.min(1, rms * 5));

            const base64Pcm = pcmToBase64(float32);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ audio: base64Pcm }));
            }
          };
        } catch (micErr) {
          console.warn('[Live API] Microphone access denied or unavailable:', micErr);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            playAudioChunk(data.audio);
          } else if (data.type === 'text' && data.text) {
            setLiveTranscript((prev) => (prev + ' ' + data.text).slice(-180));
          } else if (data.type === 'interrupted') {
            nextStartTimeRef.current = 0;
            setLiveStatus('CONNECTED');
          } else if (data.type === 'error') {
            setLiveStatus('ERROR');
          }
        } catch (err) {
          console.error('[Live API Client] Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[Live API Client] WS error:', err);
        setLiveStatus('ERROR');
      };

      ws.onclose = () => {
        setLiveStatus('DISCONNECTED');
      };
    } catch (err) {
      console.error('[Live API Client] Connection error:', err);
      setLiveStatus('ERROR');
    }
  };

  // Close Live Session and cleanup audio nodes
  const stopLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setLiveStatus('DISCONNECTED');
    setAudioLevel(0);
  };

  // Ringtone interval
  useEffect(() => {
    if (!isOpen) {
      stopLiveSession();
      return;
    }

    setCallState('RINGING');
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(true);
    setIsPlayingSimVoice(false);
    setLiveTranscript('');
    setUserTranscript('');

    // Initial ring tone
    playTone(440, 480, 800);

    const ringInterval = setInterval(() => {
      playTone(440, 480, 800);
    }, 2200);

    // Auto connect after 2.5s
    const connectTimer = setTimeout(() => {
      clearInterval(ringInterval);
      setCallState('CONNECTED');
      playTone(800, 1000, 200);

      // Connect to Gemini 3.1 Flash Live API
      if (useLiveApi) {
        startLiveSession();
      }
    }, 2800);

    return () => {
      clearInterval(ringInterval);
      clearTimeout(connectTimer);
      stopLiveSession();
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
    stopLiveSession();
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

  // Simulate fallback driver voice response
  const handlePlayVoiceSim = () => {
    if (isPlayingSimVoice) {
      setIsPlayingSimVoice(false);
      return;
    }
    setIsPlayingSimVoice(true);
    playTone(520, 650, 1500);

    setTimeout(() => {
      setIsPlayingSimVoice(false);
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-6 border border-zinc-800 shadow-2xl space-y-5 relative overflow-hidden text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-3">
          <span className="flex items-center gap-1 text-emerald-400 font-extrabold uppercase tracking-wider">
            <ShieldCheck size={14} /> ZamTaxi VoIP Call
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <Sparkles size={11} /> Gemini 3.1 Live AI
          </span>
        </div>

        {/* Avatar & Pulse Wave */}
        <div className="py-1 space-y-3">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {callState === 'RINGING' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
                <div className="absolute -inset-3 rounded-full border border-emerald-500/20 animate-pulse" />
              </>
            )}
            {callState === 'CONNECTED' && (
              <div
                className="absolute -inset-2 rounded-full border-2 border-emerald-500/60 transition-all duration-300"
                style={{ transform: `scale(${1 + audioLevel * 0.25})` }}
              />
            )}
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-20 h-20 rounded-full object-cover border-4 border-zinc-800 shadow-xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{callerName}</h3>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              {callerRole} {vehicleInfo ? `• ${vehicleInfo}` : ''}
            </p>
            {phoneNumber && (
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{phoneNumber}</p>
            )}
          </div>

          {/* Call Status & Timer */}
          <div>
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

        {/* Gemini Live API Real-Time Voice Waveform */}
        {callState === 'CONNECTED' && (
          <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl space-y-2.5 text-left">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                Live API Stream (gemini-3.1-flash-live-preview)
              </span>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">
                {liveStatus === 'SPEAKING' ? 'AI Speaking' : liveStatus === 'CONNECTED' ? 'Listening...' : liveStatus}
              </span>
            </div>

            {/* Audio Waveform visualizer */}
            <div className="flex items-center justify-center gap-1 h-9 px-2 bg-black/40 rounded-xl border border-zinc-800">
              {[35, 75, 25, 90, 60, 30, 85, 100, 50, 70, 35, 80, 45, 95, 65].map((height, i) => {
                const activeHeight = liveStatus === 'SPEAKING' || audioLevel > 0.1
                  ? Math.max(20, (height * (audioLevel + 0.5)) % 100)
                  : 15;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      liveStatus === 'SPEAKING'
                        ? 'bg-emerald-400'
                        : audioLevel > 0.1
                        ? 'bg-amber-400'
                        : 'bg-zinc-700'
                    }`}
                    style={{
                      height: `${activeHeight}%`,
                    }}
                  />
                );
              })}
            </div>

            {/* Real-time Transcription Stream */}
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 min-h-[44px] text-xs font-medium text-zinc-300 space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider flex items-center gap-1">
                <Activity size={10} className="text-emerald-400" /> Real-time Transcription
              </span>
              {liveTranscript ? (
                <p className="text-emerald-300 text-[11px] leading-relaxed italic">"{liveTranscript}"</p>
              ) : (
                <p className="text-zinc-500 text-[11px] italic">Speak into your microphone to talk with Gemini 3.1 Voice AI...</p>
              )}
            </div>

            {/* Simulation Voice Trigger */}
            <button
              type="button"
              onClick={handlePlayVoiceSim}
              className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlayingSimVoice ? (
                <>
                  <Square size={12} className="fill-emerald-300" />
                  Playing Audio Response...
                </>
              ) : (
                <>
                  <Play size={12} className="fill-emerald-300" />
                  Test Simulated {callerRole} Chime ("I'm arriving!")
                </>
              )}
            </button>
          </div>
        )}

        {/* Interactive Call Controls */}
        <div className="grid grid-cols-3 gap-3 pt-1">
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
        <div className="pt-1">
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
