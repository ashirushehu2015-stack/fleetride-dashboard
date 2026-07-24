import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car,
  CheckCircle2,
  FileText,
  Upload,
  ShieldCheck,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Scan,
  Download,
  User,
  Phone,
  MapPin,
  Check,
  Lock,
  Award,
  Zap,
  Briefcase
} from 'lucide-react';
import { VEHICLE_CONFIGS } from '../data';
import { UserProfile } from '../types';

interface DriverOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteOnboarding: (newDriverData: any) => void;
  addAuditLog?: (category: 'SYSTEM' | 'RIDER' | 'DRIVER' | 'ADMIN', details: string) => void;
}

const FINANCING_VEHICLES = [
  {
    id: 'ev-sedan',
    name: 'ZamTaxi Green EV Sedan',
    passengers: '4 Passengers',
    originalPrice: 12500000,
    subsidyRate: 0.30, // 30% Govt subsidy
    netPrice: 8750000,
    range: '380 km / charge',
    chargingTime: '35 mins fast charge',
    idealFor: 'Intra-city Gusau rides & Airport Transfers',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ev-shuttle',
    name: 'ZamTaxi Executive EV Minibus',
    passengers: '8 Passengers',
    originalPrice: 18000000,
    subsidyRate: 0.30,
    netPrice: 12600000,
    range: '420 km / charge',
    chargingTime: '45 mins fast charge',
    idealFor: 'Interstate Corridors (Gusau-Sokoto-Kano)',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'ev-trike',
    name: 'ZamTaxi Freight EV Cargo Trike',
    passengers: '2 Passengers + 800kg Freight',
    originalPrice: 6500000,
    subsidyRate: 0.30,
    netPrice: 4550000,
    range: '220 km / charge',
    chargingTime: '25 mins fast charge',
    idealFor: 'Market Freight & Agricultural Logistics',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600'
  }
];

export default function DriverOnboardingModal({
  isOpen,
  onClose,
  onCompleteOnboarding,
  addAuditLog
}: DriverOnboardingModalProps) {
  const [step, setStep] = useState<number>(1);

  // Step 1: Identity Form State
  const [fullName, setFullName] = useState<string>('Aminu Kano Gusau');
  const [phone, setPhone] = useState<string>('+234 803 892 1042');
  const [email, setEmail] = useState<string>('aminu.gusau@transit.ng');
  const [address, setAddress] = useState<string>('No. 42 Canteen Road, Gusau, Zamfara State');
  const [ninNumber, setNinNumber] = useState<string>('48291038591');
  const [bvnNumber, setBvnNumber] = useState<string>('22498103948');
  const [isNinVerified, setIsNinVerified] = useState<boolean>(true);
  const [verifyingNin, setVerifyingNin] = useState<boolean>(false);

  // Step 2: Vehicle & Financing Calculator State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('ev-sedan');
  const [downPayment, setDownPayment] = useState<number>(0); // ₦0 down
  const [tenureMonths, setTenureMonths] = useState<number>(24); // 24 Months

  // Step 3: Document Uploads & OCR Verification
  const [licenseDoc, setLicenseDoc] = useState<string | null>('license_front_scanned.pdf');
  const [zarotaDoc, setZarotaDoc] = useState<string | null>('zarota_clearance_2026.pdf');
  const [residenceDoc, setResidenceDoc] = useState<string | null>('utility_bill_gusau.pdf');
  const [isOcrScanning, setIsOcrScanning] = useState<boolean>(false);
  const [ocrVerified, setOcrVerified] = useState<boolean>(true);

  // Step 4: Guarantor & Corridor
  const [guarantorName, setGuarantorName] = useState<string>('Alhaji Kabir Bello');
  const [guarantorPhone, setGuarantorPhone] = useState<string>('+234 802 331 4400');
  const [guarantorNin, setGuarantorNin] = useState<string>('88291049281');
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([
    'Gusau Metro',
    'Gusau - Talata Mafara Highway',
    'Airport Express'
  ]);

  // Step 5: Final Submission Certificate State
  const [applicationId] = useState<string>(`ZMF-EV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [submittedDate] = useState<string>(new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }));

  if (!isOpen) return null;

  const currentVehicle = FINANCING_VEHICLES.find(v => v.id === selectedVehicleId) || FINANCING_VEHICLES[0];
  const loanAmount = Math.max(0, currentVehicle.netPrice - downPayment);
  // Assume 26 working days per month
  const workingDays = tenureMonths * 26;
  const dailyRepayment = Math.round(loanAmount / workingDays);

  const handleVerifyNin = () => {
    setVerifyingNin(true);
    setTimeout(() => {
      setVerifyingNin(false);
      setIsNinVerified(true);
    }, 1200);
  };

  const handleRunOcrScan = () => {
    setIsOcrScanning(true);
    setTimeout(() => {
      setIsOcrScanning(false);
      setOcrVerified(true);
    }, 1500);
  };

  const toggleCorridor = (corridor: string) => {
    if (selectedCorridors.includes(corridor)) {
      setSelectedCorridors(prev => prev.filter(c => c !== corridor));
    } else {
      setSelectedCorridors(prev => [...prev, corridor]);
    }
  };

  const handleFinalSubmit = () => {
    const newDriverObj = {
      id: `driver-${Date.now()}`,
      name: fullName,
      rating: 5.0,
      vehicleType: selectedVehicleId === 'ev-shuttle' ? 'EXECUTIVE_EV' : selectedVehicleId === 'ev-trike' ? 'COMMUTER_GREEN' : 'LUXURY_SUV',
      vehicleName: `${currentVehicle.name}`,
      plateNumber: `ZMF-${Math.floor(100 + Math.random() * 899)}-EV`,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      phone: phone,
      completedTrips: 0,
      isVerified: true, // Pre-approved via State EV financing scheme
      status: 'ACTIVE',
      joinedDate: submittedDate,
      financing: {
        applicationId,
        vehicleName: currentVehicle.name,
        netLoan: loanAmount,
        dailyDeduction: dailyRepayment,
        tenureMonths,
        guarantor: guarantorName
      }
    };

    if (addAuditLog) {
      addAuditLog(
        'DRIVER',
        `Commercial EV Financing Pre-Approved for ${fullName}. Net Loan: ₦${loanAmount.toLocaleString()} (₦${dailyRepayment.toLocaleString()}/day). App ID: ${applicationId}`
      );
    }

    onCompleteOnboarding(newDriverObj);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-emerald-950 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Zamfara State Commercial EV Initiative
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                  Government Financed
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Driver Micro-Financing & Documentation Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800/80 px-6 py-3 shrink-0">
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
            <button
              onClick={() => setStep(1)}
              className={`pb-1 border-b-2 transition ${
                step === 1 ? 'border-emerald-400 text-emerald-400 font-black' : step > 1 ? 'border-emerald-600 text-emerald-600' : 'border-zinc-800 text-zinc-500'
              }`}
            >
              1. Identity & BVN
            </button>
            <button
              onClick={() => setStep(2)}
              className={`pb-1 border-b-2 transition ${
                step === 2 ? 'border-emerald-400 text-emerald-400 font-black' : step > 2 ? 'border-emerald-600 text-emerald-600' : 'border-zinc-800 text-zinc-500'
              }`}
            >
              2. EV Loan Calculator
            </button>
            <button
              onClick={() => setStep(3)}
              className={`pb-1 border-b-2 transition ${
                step === 3 ? 'border-emerald-400 text-emerald-400 font-black' : step > 3 ? 'border-emerald-600 text-emerald-600' : 'border-zinc-800 text-zinc-500'
              }`}
            >
              3. Document Verification
            </button>
            <button
              onClick={() => setStep(4)}
              className={`pb-1 border-b-2 transition ${
                step === 4 ? 'border-emerald-400 text-emerald-400 font-black' : step > 4 ? 'border-emerald-600 text-emerald-600' : 'border-zinc-800 text-zinc-500'
              }`}
            >
              4. Guarantor & Route
            </button>
            <button
              onClick={() => setStep(5)}
              className={`pb-1 border-b-2 transition ${
                step === 5 ? 'border-emerald-400 text-emerald-400 font-black' : 'border-zinc-800 text-zinc-500'
              }`}
            >
              5. Approval Status
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* STEP 1: PERSONAL & BVN IDENTITY */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Step 1: Driver Personal & Govt Identity Check</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    Provide your full legal details as registered on your National Identity Number (NIN) and Bank Verification Number (BVN) for automatic credit profiling.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">Full Legal Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-3 text-white outline-none focus:border-emerald-500"
                      placeholder="e.g. Aminu Kano Gusau"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">Phone Number (+234)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-3 text-white outline-none focus:border-emerald-500"
                      placeholder="+234 803 000 0000"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                    placeholder="driver@transit.ng"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">Residential Address (Zamfara)</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-3 text-white outline-none focus:border-emerald-500"
                      placeholder="e.g. Canteen Road, Gusau"
                    />
                  </div>
                </div>
              </div>

              {/* NIN & BVN Verification Box */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Lock size={14} className="text-emerald-400" /> Identity Database Cross-Check
                  </span>
                  {isNinVerified ? (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={12} /> NIN & BVN Verified
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/30">
                      Verification Pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">11-Digit NIN Number</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">11-Digit BVN Number</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={bvnNumber}
                      onChange={(e) => setBvnNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyNin}
                  disabled={verifyingNin || isNinVerified}
                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                    isNinVerified
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  }`}
                >
                  {verifyingNin ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      Pinging NIMC & NIBSS Verification Server...
                    </>
                  ) : isNinVerified ? (
                    <>
                      <CheckCircle2 size={14} /> Identity Match Confirmed with NIMC Database
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} /> Verify Identity Credentials
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EV VEHICLE FINANCING CALCULATOR */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                <CreditCard size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Step 2: Select Commercial EV & Micro-Financing Plan</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    Zamfara State Government covers <strong>30% of the vehicle cost</strong> as a clean energy subsidy. Repayments are micro-deducted directly from daily ride earnings.
                  </p>
                </div>
              </div>

              {/* Vehicle Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FINANCING_VEHICLES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      selectedVehicleId === v.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="relative h-24 rounded-xl overflow-hidden mb-3 border border-zinc-800 bg-zinc-900">
                        <img src={v.image} alt={v.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-2 left-2 bg-emerald-600/90 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                          30% State Subsidy
                        </span>
                      </div>
                      <span className="block font-black text-xs text-white leading-tight">{v.name}</span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">{v.passengers}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500 line-through">₦{(v.originalPrice / 1000000).toFixed(1)}M</span>
                        <span className="text-emerald-400 font-extrabold text-xs">₦{(v.netPrice / 1000000).toFixed(2)}M</span>
                      </div>
                      <span className="block text-[9px] text-zinc-400 font-mono">{v.range}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Calculator Box */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-4">
                <h5 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" /> Interactive Micro-Financing Loan Calculator
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Down Payment Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400">Initial Down Payment</label>
                    <select
                      value={downPayment}
                      onChange={(e) => setDownPayment(parseInt(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-emerald-500"
                    >
                      <option value={0}>₦0 (Zero Down Payment - 100% Financed)</option>
                      <option value={50000}>₦50,000 (Commitment Deposit)</option>
                      <option value={100000}>₦100,000 (Reduced Daily Rate)</option>
                      <option value={250000}>₦250,000 (Express Fast-Track)</option>
                    </select>
                  </div>

                  {/* Loan Tenure */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400">Loan Tenure / Duration</label>
                    <select
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(parseInt(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-emerald-500"
                    >
                      <option value={12}>12 Months (Rapid Payoff)</option>
                      <option value={24}>24 Months (Recommended Standard)</option>
                      <option value={36}>36 Months (Ultra-Low Daily Repayment)</option>
                    </select>
                  </div>
                </div>

                {/* Live Repayment Calculations */}
                <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-zinc-400">Government Net Loan</span>
                    <span className="block font-mono text-sm font-extrabold text-white">₦{loanAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-emerald-300">Daily Micro-Deduction</span>
                    <span className="block font-mono text-base font-black text-emerald-400">₦{dailyRepayment.toLocaleString()} / day</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-zinc-400">Est. Net Daily Profit</span>
                    <span className="block font-mono text-sm font-extrabold text-white">₦{(22000 - dailyRepayment).toLocaleString()} / day</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENT UPLOADS & AI OCR */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                <FileText size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Step 3: Official Documentation & AI OCR Verification</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    Upload your Commercial Driver's License and Zamfara State Transport Authority (ZAROTA) clearance permit for AI document recognition.
                  </p>
                </div>
              </div>

              {/* Document Upload Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* License */}
                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl space-y-2 text-center">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-emerald-400">
                    <CreditCard size={16} />
                  </div>
                  <span className="block font-extrabold text-white text-[11px]">Commercial Driver's License</span>
                  <span className="block text-[9px] text-zinc-500">Class E or F Commercial Permit</span>
                  <div className="bg-zinc-900/80 border border-dashed border-zinc-800 p-2 rounded-xl text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> {licenseDoc}
                  </div>
                </div>

                {/* ZAROTA */}
                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl space-y-2 text-center">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-emerald-400">
                    <Building2 size={16} />
                  </div>
                  <span className="block font-extrabold text-white text-[11px]">ZAROTA Transport Clearance</span>
                  <span className="block text-[9px] text-zinc-500">Zamfara Road Transport Permit</span>
                  <div className="bg-zinc-900/80 border border-dashed border-zinc-800 p-2 rounded-xl text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> {zarotaDoc}
                  </div>
                </div>

                {/* Residence */}
                <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl space-y-2 text-center">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-emerald-400">
                    <MapPin size={16} />
                  </div>
                  <span className="block font-extrabold text-white text-[11px]">Proof of Residence</span>
                  <span className="block text-[9px] text-zinc-500">Utility Bill or LGA Certificate</span>
                  <div className="bg-zinc-900/80 border border-dashed border-zinc-800 p-2 rounded-xl text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> {residenceDoc}
                  </div>
                </div>
              </div>

              {/* Scanner Box */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <Scan size={16} /> AI Computer Vision Document Verification
                </div>

                {isOcrScanning ? (
                  <div className="py-6 space-y-2">
                    <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="block text-xs font-mono text-emerald-400 animate-pulse">
                      Scanning OCR Text, Document Seals, & Driver Photo ID...
                    </span>
                  </div>
                ) : ocrVerified ? (
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <span className="block text-xs font-extrabold text-white">AI Document Scan Passed (100% Legitimacy Match)</span>
                        <span className="block text-[10px] text-zinc-400">Driver License Class F verified with Zamfara Road Safety Database</span>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      PASSED
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunOcrScan}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Scan size={16} /> Run Instant AI OCR Scan
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: GUARANTOR & CORRIDORS */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                <Briefcase size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Step 4: Guarantor Endorsement & Operating Corridors</h4>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    Provide one recognized guarantor in Zamfara State and select your primary commercial transit routes.
                  </p>
                </div>
              </div>

              {/* Guarantor Details */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  Primary Guarantor Form
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Guarantor Name</label>
                    <input
                      type="text"
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Guarantor Phone</label>
                    <input
                      type="tel"
                      value={guarantorPhone}
                      onChange={(e) => setGuarantorPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Guarantor NIN</label>
                    <input
                      type="text"
                      value={guarantorNin}
                      onChange={(e) => setGuarantorNin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Corridors */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                  Select Operating Corridors (Zamfara & Inter-State)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Gusau Metro',
                    'Gusau - Talata Mafara Highway',
                    'Airport Express',
                    'Gusau - Sokoto Cross-State',
                    'Kaura Namoda Corridor',
                    'Gusau Market Freight Route'
                  ].map((corridor) => {
                    const isSelected = selectedCorridors.includes(corridor);
                    return (
                      <button
                        key={corridor}
                        type="button"
                        onClick={() => toggleCorridor(corridor)}
                        className={`p-2.5 rounded-xl border text-left font-bold text-[10px] transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span>{corridor}</span>
                        {isSelected && <Check size={12} className="text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: APPROVAL STATUS & CERTIFICATE */}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
                <Award size={32} />
              </div>

              <div>
                <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 inline-block mb-2">
                  Financing Pre-Approved 🎉
                </span>
                <h3 className="font-extrabold text-white text-xl">
                  Zamfara State Commercial EV Financing Certificate
                </h3>
                <p className="text-zinc-400 text-xs mt-1 max-w-lg mx-auto">
                  Congratulations <strong>{fullName}</strong>! Your application for the <strong>{currentVehicle.name}</strong> under the Zamfara Commercial EV Initiative has been pre-approved.
                </p>
              </div>

              {/* Printable Certificate Card */}
              <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-emerald-500/40 p-5 rounded-3xl text-left space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-zinc-500">Certificate Reference ID</span>
                    <span className="block font-mono font-black text-sm text-emerald-400">{applicationId}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase font-bold text-zinc-500">Status</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      PRE-APPROVED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="block text-[9px] font-bold text-zinc-500">Allocated EV</span>
                    <span className="block font-extrabold text-white">{currentVehicle.name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-zinc-500">Govt Net Loan</span>
                    <span className="block font-mono font-extrabold text-emerald-400">₦{loanAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-zinc-500">Daily Repayment</span>
                    <span className="block font-mono font-extrabold text-white">₦{dailyRepayment.toLocaleString()}/day</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-zinc-500">Inspection Depot</span>
                    <span className="block font-extrabold text-white">Gusau EV Central Depot</span>
                  </div>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-400" />
                    <span>Physical Vehicle Handover Inspection: <strong>Tomorrow, 09:00 AM</strong></span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">Depot Bay #4</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-zinc-950 border-t border-zinc-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              Continue <ArrowRight size={14} />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={() => setStep(5)}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Award size={14} /> Submit Application for Approval
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Car size={16} /> Complete & Launch Driver Console
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
