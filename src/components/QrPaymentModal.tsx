import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Scan,
  X,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  Building2,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientName?: string;
  accountNumber?: string;
  bankName?: string;
  onPaymentSuccess: (amount: number, bankAppName: string, reference: string) => void;
}

const SIMULATED_BANK_APPS = [
  { id: 'gtbank', name: 'GTBank Mobile App', color: 'bg-orange-600', icon: '🏦' },
  { id: 'kuda', name: 'Kuda Bank (Kuda MFB)', color: 'bg-purple-600', icon: '🟣' },
  { id: 'zenith', name: 'Zenith Bank Mobile', color: 'bg-rose-600', icon: '🔴' },
  { id: 'opay', name: 'OPay Digital Wallet', color: 'bg-emerald-600', icon: '🟢' },
  { id: 'moniepoint', name: 'Moniepoint MFB', color: 'bg-blue-600', icon: '🔵' },
  { id: 'firstbank', name: 'FirstBank FirstMobile', color: 'bg-amber-600', icon: '🟡' },
  { id: 'uba', name: 'UBA Mobile Banking', color: 'bg-red-700', icon: '🟥' }
];

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  recipientName = 'ZamTaxi Central Management Treasury',
  accountNumber = '3098172654',
  bankName = 'Zenith Bank / FirstBank',
  onPaymentSuccess
}) => {
  const [selectedBankApp, setSelectedBankApp] = useState<string>('gtbank');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0); // 0: idle, 1: scanning, 2: verifying, 3: approved
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [qrRef] = useState<string>(() => `ZAM-NQR-${Math.floor(100000 + Math.random() * 900000)}`);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setScanStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const qrPayload = `nqr://pay?merchant=ZAMTAXI_TREASURY&ref=${qrRef}&amount=${amount}&acc=${accountNumber}&bank=000015&nibss=VERIFIED`;

  const handleSimulateScanAndPay = () => {
    setIsScanning(true);
    setScanStep(1); // Camera scanning

    setTimeout(() => {
      setScanStep(2); // Verifying NIBSS routing
    }, 1200);

    setTimeout(() => {
      setScanStep(3); // Approved
    }, 2400);

    setTimeout(() => {
      const bankObj = SIMULATED_BANK_APPS.find((b) => b.id === selectedBankApp);
      const bankNameLabel = bankObj ? bankObj.name : 'Simulated Bank App';
      onPaymentSuccess(amount, bankNameLabel, qrRef);
      setIsScanning(false);
      setScanStep(0);
      onClose();
    }, 3600);
  };

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText(qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-[#E5DFD3] shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto relative text-zinc-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900">Pay via NQR Code</h3>
              <p className="text-[10px] text-zinc-500 font-medium">NIBSS Verified Merchant QR Checkout</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg transition cursor-pointer"
            id="close-qr-modal-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* SCANNING SIMULATION OVERLAY */}
        {isScanning ? (
          <div className="bg-zinc-950 text-white p-6 rounded-2xl border border-emerald-500/40 text-center space-y-4 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-pulse">
              <Scan size={32} className="text-emerald-400" />
            </div>

            {scanStep === 1 && (
              <div className="space-y-1 animate-fade-in">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Step 1/3</span>
                <h4 className="text-sm font-black text-white">Scanning QR Code via {SIMULATED_BANK_APPS.find(b=>b.id===selectedBankApp)?.name}...</h4>
                <p className="text-[11px] text-zinc-400 font-mono">Reading NIBSS NQR payload parameter string...</p>
              </div>
            )}

            {scanStep === 2 && (
              <div className="space-y-1 animate-fade-in">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">Step 2/3</span>
                <h4 className="text-sm font-black text-white">Verifying Central Treasury Destination</h4>
                <p className="text-[11px] text-zinc-300 font-mono">Routing ₦{amount.toLocaleString()} to {recipientName} ({accountNumber})</p>
              </div>
            )}

            {scanStep === 3 && (
              <div className="space-y-1 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center mx-auto mb-2 font-bold">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Step 3/3 - Complete</span>
                <h4 className="text-sm font-black text-white">Payment Authorized & Received!</h4>
                <p className="text-[11px] text-emerald-200">Funds successfully credited to management treasury.</p>
              </div>
            )}

            {/* Scanner Beam Animation Line */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-full absolute left-0 top-1/2 -translate-y-1/2 animate-bounce opacity-80" />
          </div>
        ) : (
          <>
            {/* Amount & Beneficiary Header Card */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DFD3] text-center space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider">Total Payment Amount</span>
              <div className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="pt-1.5 border-t border-[#E5DFD3]/80 flex flex-col items-center text-[10px] text-zinc-600 font-medium space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-zinc-800">
                  <Building2 size={12} className="text-emerald-700" />
                  <span>{recipientName}</span>
                </div>
                <span className="font-mono text-zinc-500">{bankName} • Account: <strong className="text-zinc-800 font-mono">{accountNumber}</strong></span>
              </div>
            </div>

            {/* Visual SVG QR Code Box */}
            <div className="bg-zinc-950 p-5 rounded-2xl border-2 border-emerald-600/50 shadow-inner flex flex-col items-center justify-center space-y-3 relative group">
              <div className="bg-white p-4 rounded-xl shadow-lg relative flex items-center justify-center">
                {/* Custom SVG 2D Vector Matrix representing NQR Standard */}
                <svg width="170" height="170" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background */}
                  <rect width="170" height="170" rx="8" fill="white" />
                  
                  {/* Finder Pattern 1: Top Left */}
                  <rect x="10" y="10" width="45" height="45" rx="4" fill="#09090b" />
                  <rect x="17" y="17" width="31" height="31" rx="2" fill="white" />
                  <rect x="23" y="23" width="19" height="19" rx="2" fill="#059669" />

                  {/* Finder Pattern 2: Top Right */}
                  <rect x="115" y="10" width="45" height="45" rx="4" fill="#09090b" />
                  <rect x="122" y="17" width="31" height="31" rx="2" fill="white" />
                  <rect x="128" y="23" width="19" height="19" rx="2" fill="#059669" />

                  {/* Finder Pattern 3: Bottom Left */}
                  <rect x="10" y="115" width="45" height="45" rx="4" fill="#09090b" />
                  <rect x="17" y="122" width="31" height="31" rx="2" fill="white" />
                  <rect x="23" y="128" width="19" height="19" rx="2" fill="#059669" />

                  {/* Data Matrix Blocks Grid */}
                  <rect x="65" y="10" width="10" height="10" fill="#09090b" />
                  <rect x="80" y="10" width="10" height="10" fill="#059669" />
                  <rect x="95" y="10" width="10" height="10" fill="#09090b" />
                  
                  <rect x="65" y="25" width="10" height="10" fill="#059669" />
                  <rect x="80" y="25" width="10" height="10" fill="#09090b" />
                  <rect x="95" y="25" width="10" height="10" fill="#09090b" />

                  <rect x="10" y="65" width="10" height="10" fill="#09090b" />
                  <rect x="25" y="65" width="10" height="10" fill="#059669" />
                  <rect x="40" y="65" width="10" height="10" fill="#09090b" />
                  <rect x="55" y="65" width="10" height="10" fill="#09090b" />
                  <rect x="70" y="65" width="10" height="10" fill="#059669" />
                  <rect x="85" y="65" width="10" height="10" fill="#09090b" />
                  <rect x="100" y="65" width="10" height="10" fill="#059669" />
                  <rect x="115" y="65" width="10" height="10" fill="#09090b" />
                  <rect x="130" y="65" width="10" height="10" fill="#09090b" />
                  <rect x="145" y="65" width="10" height="10" fill="#059669" />

                  <rect x="10" y="80" width="10" height="10" fill="#059669" />
                  <rect x="25" y="80" width="10" height="10" fill="#09090b" />
                  <rect x="40" y="80" width="10" height="10" fill="#059669" />
                  <rect x="120" y="80" width="10" height="10" fill="#059669" />
                  <rect x="135" y="80" width="10" height="10" fill="#09090b" />

                  <rect x="10" y="95" width="10" height="10" fill="#09090b" />
                  <rect x="25" y="95" width="10" height="10" fill="#09090b" />
                  <rect x="40" y="95" width="10" height="10" fill="#059669" />
                  <rect x="55" y="95" width="10" height="10" fill="#09090b" />
                  <rect x="70" y="95" width="10" height="10" fill="#09090b" />
                  <rect x="85" y="95" width="10" height="10" fill="#059669" />
                  <rect x="100" y="95" width="10" height="10" fill="#09090b" />
                  <rect x="115" y="95" width="10" height="10" fill="#059669" />
                  <rect x="130" y="95" width="10" height="10" fill="#09090b" />
                  <rect x="145" y="95" width="10" height="10" fill="#09090b" />

                  <rect x="65" y="115" width="10" height="10" fill="#09090b" />
                  <rect x="80" y="115" width="10" height="10" fill="#059669" />
                  <rect x="95" y="115" width="10" height="10" fill="#09090b" />
                  <rect x="110" y="115" width="10" height="10" fill="#09090b" />
                  <rect x="125" y="115" width="10" height="10" fill="#059669" />
                  <rect x="140" y="115" width="10" height="10" fill="#09090b" />

                  <rect x="65" y="130" width="10" height="10" fill="#059669" />
                  <rect x="80" y="130" width="10" height="10" fill="#09090b" />
                  <rect x="95" y="130" width="10" height="10" fill="#059669" />
                  <rect x="110" y="130" width="10" height="10" fill="#059669" />
                  <rect x="125" y="130" width="10" height="10" fill="#09090b" />
                  <rect x="140" y="130" width="10" height="10" fill="#059669" />

                  <rect x="65" y="145" width="10" height="10" fill="#09090b" />
                  <rect x="80" y="145" width="10" height="10" fill="#09090b" />
                  <rect x="95" y="145" width="10" height="10" fill="#059669" />
                  <rect x="110" y="145" width="10" height="10" fill="#09090b" />
                  <rect x="125" y="145" width="10" height="10" fill="#059669" />
                  <rect x="140" y="145" width="10" height="10" fill="#09090b" />

                  {/* Center Badge Overlay */}
                  <rect x="68" y="68" width="34" height="34" rx="6" fill="#047857" stroke="white" strokeWidth="2" />
                  <text x="85" y="89" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">NQR</text>
                </svg>

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-500" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-500" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-500" />
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-300 font-bold">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>REF: {qrRef}</span>
              </div>
            </div>

            {/* Select Bank App Simulator */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider flex items-center justify-between">
                <span>Select Passenger Bank App to Scan</span>
                <span className="text-emerald-700 text-[9px] font-black uppercase">CBN / NIBSS Enabled</span>
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {SIMULATED_BANK_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedBankApp(app.id)}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      selectedBankApp === app.id
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span className="text-sm">{app.icon}</span>
                    <span className="truncate text-[11px] font-bold">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSimulateScanAndPay}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                id="simulate-qr-scan-btn"
              >
                <Scan size={16} />
                Scan QR Code with {SIMULATED_BANK_APPS.find((b) => b.id === selectedBankApp)?.name}
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-extrabold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedPayload ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedPayload ? 'Copied Link!' : 'Copy NQR Payload'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Downloaded NQR Code Image (ZAM-NQR.png) to device.')}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-extrabold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Code</span>
                </button>
              </div>
            </div>

            {/* Management Account Funds Routing Disclosure */}
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[10px] text-emerald-950 leading-relaxed font-medium flex items-start gap-2">
              <Lock size={14} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black text-emerald-900 block uppercase tracking-wider text-[9px]">Direct Treasury Routing</strong>
                Scanning this generated code transfers ₦{amount.toLocaleString()} directly to the Central Management Account (<strong className="font-mono">Zenith Bank 3098172654</strong>) via the NIBSS Switch.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
