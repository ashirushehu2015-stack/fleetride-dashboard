import React, { useState } from 'react';
import { Smartphone, Monitor, Download, ShieldCheck, CheckCircle2, Copy, Sparkles, X, Terminal, Radio, Mic, Globe } from 'lucide-react';

interface AppDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppDeploymentModal({ isOpen, onClose }: AppDeploymentModalProps) {
  const [activeTab, setActiveTab] = useState<'MOBILE' | 'WINDOWS' | 'VOICE_LOCATION'>('MOBILE');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const capacitorSetupCmds = `npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init ZamTaxi com.zamtaxi.app
npm run build
npx cap add android
npx cap open android`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">ZamTaxi Cross-Platform Suite</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/40">
                  Ready for Production
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Google Play Store (Android), Windows Desktop App (PWA/MSIX), & Gemini Voice AI Location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/80">
          <button
            onClick={() => setActiveTab('MOBILE')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'MOBILE'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Smartphone size={15} />
            Google Play Store (Android)
          </button>
          <button
            onClick={() => setActiveTab('WINDOWS')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'WINDOWS'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Monitor size={15} />
            Windows Desktop App
          </button>
          <button
            onClick={() => setActiveTab('VOICE_LOCATION')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'VOICE_LOCATION'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Mic size={15} />
            Voice AI Feature Map
          </button>
        </div>

        {/* TAB 1: Android Play Store */}
        {activeTab === 'MOBILE' && (
          <div className="space-y-4 text-left">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <CheckCircle2 size={16} /> Android PWA & Capacitor TWA Ready
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                The application features a valid PWA Manifest (<code className="text-emerald-300 font-mono">public/manifest.json</code>), Service Worker (<code className="text-emerald-300 font-mono">public/sw.js</code>), and responsive mobile touch UI designed for Google Play Store submission.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                1. Single-Command Capacitor Build for Play Store (.apk / .aab)
              </span>
              <div className="relative bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                <pre>{capacitorSetupCmds}</pre>
                <button
                  onClick={() => copyToClipboard(capacitorSetupCmds, 'Capacitor Commands')}
                  className="absolute top-2.5 right-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} />
                  {copiedCmd === 'Capacitor Commands' ? 'Copied!' : 'Copy Commands'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-medium">
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Package Identifier</span>
                <span className="text-white font-mono font-bold block">com.zamtaxi.app</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Target Platform</span>
                <span className="text-white font-mono font-bold block">Android 14+ (SDK 34)</span>
              </div>
            </div>

            <a
              href="/manifest.json"
              target="_blank"
              download="manifest.json"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
            >
              <Download size={16} />
              Download Android PWA Manifest & App Config
            </a>
          </div>
        )}

        {/* TAB 2: Windows Desktop App */}
        {activeTab === 'WINDOWS' && (
          <div className="space-y-4 text-left">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <Monitor size={16} className="text-emerald-400" /> Windows 10/11 Desktop Installation
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                ZamTaxi can be installed as a native Windows application directly from the browser using Microsoft Edge or Chrome, or bundled via Electron / PWABuilder into a <code className="text-emerald-400 font-mono">.exe</code> / <code className="text-emerald-400 font-mono">.msix</code> installer.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl space-y-2 text-xs">
              <span className="font-extrabold text-white block">Method A: Direct Windows Desktop PWA Install</span>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 font-medium leading-relaxed">
                <li>Open this app link in Microsoft Edge or Google Chrome on Windows.</li>
                <li>Look for the <strong className="text-emerald-400 font-bold">App Available / Install</strong> icon in the browser address bar (right side).</li>
                <li>Click <strong>Install ZamTaxi</strong> to place an official app icon on your Windows Start Menu & Desktop.</li>
              </ol>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl space-y-2 text-xs">
              <span className="font-extrabold text-white block">Method B: Package as Windows Executable (.exe)</span>
              <p className="text-zinc-400 leading-relaxed">
                Use <strong>PWABuilder.com</strong> or <strong>Electron Builder</strong>: submit the live application URL to generate a signed Windows Store MSIX package in 1 click.
              </p>
            </div>

            <button
              onClick={() => {
                alert("To install on Windows: Click the 'Install App' icon located in your browser's address bar or menu!");
              }}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download size={16} className="text-emerald-400" />
              Trigger Browser App Install
            </button>
          </div>
        )}

        {/* TAB 3: Voice AI Location Map */}
        {activeTab === 'VOICE_LOCATION' && (
          <div className="space-y-4 text-left">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Sparkles size={16} /> Where Voice AI Conversation is Located
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The Gemini 3.1 Flash Live API (<code className="text-emerald-300 font-mono">gemini-3.1-flash-live-preview</code>) real-time voice conversation feature is integrated directly into the core ride workflow:
              </p>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                  <Radio size={14} /> 1. Active Trip Header / Phone Call Button (Rider & Driver Modes)
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  During an active ride or driver dispatch, click the <strong>Green VoIP Call / Phone Icon</strong> on the active trip bar. This launches the <strong>VoiceCallModal</strong> with live audio streaming & speech-to-text.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                  <Mic size={14} /> 2. Floating Voice AI Assistant Button (Top Action Toolbar)
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Located in the header toolbar across all panels (Rider, Driver, and Admin Dashboard). Click <strong>"Voice AI"</strong> anytime to speak directly with the Gemini 3.1 assistant.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                  <Globe size={14} /> 3. Backend WebSocket Endpoint (<code className="text-emerald-300 font-mono">/live</code>)
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Powered by <code className="text-emerald-300 font-mono">server.ts</code> running a WebSocket gateway connecting directly to Gemini 3.1 Flash Live API with 16kHz PCM audio input and 24kHz audio output playback.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
