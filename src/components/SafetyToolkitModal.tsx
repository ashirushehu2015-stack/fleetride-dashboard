import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Share2,
  Mic,
  MicOff,
  PhoneCall,
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Info,
  AlertTriangle,
  Radio,
  MapPin,
  Lock
} from 'lucide-react';
import { Trip } from '../types';

interface SafetyToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onTriggerEmergency?: () => void;
}

export default function SafetyToolkitModal({
  isOpen,
  onClose,
  trip,
  onTriggerEmergency,
}: SafetyToolkitModalProps) {
  const [activeTab, setActiveTab] = useState<'TOOLKIT' | 'RIDE_CHECK' | 'SHARE_DETAILS'>('TOOLKIT');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [emergencyCalling, setEmergencyCalling] = useState(false);
  const [emergencyConnected, setEmergencyConnected] = useState(false);
  const [showRideCheckInfo, setShowRideCheckInfo] = useState(false);

  // Recording timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const shareableUrl = trip
    ? `https://zamtaxi.app/track/trip-${trip.id.substring(0, 8)}`
    : 'https://zamtaxi.app/track/active-ride';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCallEmergency = () => {
    setEmergencyCalling(true);
    setTimeout(() => {
      setEmergencyConnected(true);
      if (onTriggerEmergency) onTriggerEmergency();
    }, 1500);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={20} />
            <h3 className="text-base font-extrabold text-white tracking-tight">Safety toolkit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            id="close-safety-toolkit-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'TOOLKIT' && (
            <>
              {/* Ride Check Prominent Banner */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">
                      AUTOMATED PROTECTION
                    </span>
                    <h4 className="text-lg font-black text-white">Ride Check</h4>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <Radio size={18} className="animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  This functionality allows us to detect any unexpected and excessively long stops during rides.
                </p>
                <button
                  onClick={() => setShowRideCheckInfo(true)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  id="ride-check-learn-more-btn"
                >
                  Learn more
                </button>
              </div>

              {/* Action 1: Emergency Assist */}
              <div className="space-y-2">
                <div
                  onClick={handleCallEmergency}
                  className="bg-zinc-900/90 hover:bg-zinc-800/90 border border-rose-900/40 hover:border-rose-700/60 p-4 rounded-2xl transition cursor-pointer flex items-center justify-between group shadow-xs"
                  id="safety-emergency-assist-btn"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldAlert size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-rose-400 group-hover:text-rose-300 transition">
                        Emergency assist
                      </h5>
                      <p className="text-xs text-zinc-400">Call to local authority & share GPS</p>
                    </div>
                  </div>
                  <PhoneCall size={18} className="text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Emergency Call Modal Overlay */}
                {emergencyCalling && (
                  <div className="p-4 bg-rose-950/80 border border-rose-800/80 rounded-2xl space-y-3 animate-fade-in text-center">
                    <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-sm">
                      <ShieldAlert size={18} className="animate-spin" />
                      {emergencyConnected ? 'Connected to Emergency Dispatch (112)' : 'Dialing Local Authority (112)...'}
                    </div>
                    <p className="text-xs text-rose-200/80">
                      Sharing your live vehicle location: {trip ? `${trip.origin.label} ➔ ${trip.destination.label}` : 'Active coordinates'}
                    </p>
                    <button
                      onClick={() => {
                        setEmergencyCalling(false);
                        setEmergencyConnected(false);
                      }}
                      className="text-xs font-bold text-white bg-rose-800 hover:bg-rose-700 px-4 py-1.5 rounded-lg"
                    >
                      Cancel Emergency Call
                    </button>
                  </div>
                )}
              </div>

              {/* Action 2: Share trip details / Share location */}
              <div
                onClick={() => setActiveTab('SHARE_DETAILS')}
                className="bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 p-4 rounded-2xl transition cursor-pointer flex items-center justify-between group shadow-xs"
                id="safety-share-trip-btn"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shrink-0 group-hover:scale-105 transition-transform">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-zinc-100">Share trip details</h5>
                    <p className="text-xs text-zinc-400">Let your friends track your ride</p>
                  </div>
                </div>
                <ExternalLink size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
              </div>

              {/* Action 3: Audio recording */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isRecording
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {isRecording ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-zinc-100">Audio recording</h5>
                      <p className="text-xs text-zinc-400">Record your current ride safely</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    id="toggle-audio-recording-btn"
                  >
                    {isRecording ? 'Stop Recording' : 'Start'}
                  </button>
                </div>

                {isRecording && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Recording Encrypted Audio ({formatTimer(recordingSeconds)})</span>
                    </div>
                    <Lock size={13} className="text-emerald-400/80" />
                  </div>
                )}
              </div>

              {/* Security Disclaimer Notice */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-zinc-500 leading-normal italic px-2">
                  Please note that for security reasons, your trip may be recorded by the driver.
                </p>
              </div>
            </>
          )}

          {/* Tab View: SHARE TRIP DETAILS */}
          {activeTab === 'SHARE_DETAILS' && (
            <div className="space-y-4 animate-fade-in">
              <button
                onClick={() => setActiveTab('TOOLKIT')}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                ← Back to Safety toolkit
              </button>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">Share location & vehicle info</h4>
                <p className="text-xs text-zinc-400">
                  Send the car's make, model, registration number, and live location to friends or family via a shareable link. All trips are also tracked and recorded.
                </p>
              </div>

              {trip ? (
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Driver & Vehicle</span>
                      <p className="text-xs font-bold text-white mt-0.5">{trip.driver.name} • {trip.driver.vehicleName}</p>
                    </div>
                    <span className="bg-zinc-800 text-emerald-400 font-mono text-xs px-2.5 py-1 rounded-lg font-bold border border-zinc-700">
                      {trip.driver.plateNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      <span className="font-semibold truncate">From: {trip.origin.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-rose-400 shrink-0" />
                      <span className="font-semibold truncate">To: {trip.destination.label}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 italic text-center">
                  Share link generated for current active session
                </div>
              )}

              {/* Shareable Link Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Shareable Live Tracking Link</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 px-3">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 bg-transparent text-xs text-zinc-300 outline-none font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    id="copy-share-trip-link-btn"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Track my ride live: ${shareableUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition"
                >
                  <Share2 size={14} /> Share to WhatsApp
                </a>
                <a
                  href={`sms:?body=${encodeURIComponent(`Track my ride live: ${shareableUrl}`)}`}
                  className="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition border border-zinc-700"
                >
                  <Share2 size={14} /> Send via SMS
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Info Modal Overlay for Ride Check */}
        {showRideCheckInfo && (
          <div className="absolute inset-0 bg-zinc-950/95 z-20 p-6 flex flex-col justify-between animate-fade-in overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Automated Ride Check System
                </span>
                <button
                  onClick={() => setShowRideCheckInfo(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-xl font-black text-white">How Ride Check Keeps You Safe</h3>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <Radio size={14} className="text-emerald-400" /> Unexpected Stop Detection
                  </span>
                  <p>If your vehicle stops unexpectedly or pulls off route for over 3 minutes, Ride Check automatically pings both rider and driver to verify safety.</p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-400" /> Automated Safety Check-in
                  </span>
                  <p>If you don't respond to the prompt within 60 seconds, our 24/7 Safety Command team is alerted and can dispatch assistance.</p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <Lock size={14} className="text-blue-400" /> Encrypted Audit Logs
                  </span>
                  <p>GPS coordinates, speed logs, and route variations are encrypted and recorded for security review.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRideCheckInfo(false)}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold py-3 rounded-xl transition text-xs mt-4"
            >
              Got it, thanks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
