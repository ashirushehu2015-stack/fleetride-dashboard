import React, { useState } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Car,
  User,
  Activity,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Zap,
  Server,
  Layers,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  Award,
  FileText,
  DollarSign,
  Smartphone
} from 'lucide-react';

interface StakeholderPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StakeholderPresentationModal({
  isOpen,
  onClose
}: StakeholderPresentationModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: 'executive-summary',
      badge: 'EXECUTIVE BRIEFING',
      title: 'ZamTaxi: State-Wide Intelligent Urban & Interstate Transit System',
      subtitle: 'A Modern, Real-time Digital Ride-Hailing & Fleet Command Platform for Zamfara State',
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl text-left space-y-3">
            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-700" />
              Vision & System Objective
            </h4>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              ZamTaxi is designed as a centralized, high-efficiency transport management platform tailored for municipal and interstate movement across Zamfara State (Gusau, Kaura Namoda, Talata Mafara, Tsafe, and interstate corridors). The system integrates real-time GPS telemetry, automated fare calculation, multi-role dispatching, secure digital wallets, and administrative oversight to modernize public transit and enhance public safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                <User size={16} />
              </div>
              <h5 className="text-xs font-black text-emerald-950 uppercase">Rider Accessibility</h5>
              <p className="text-[11px] text-emerald-800">Instant ride dispatch, upfront transparent fares, in-app safety tools & live map tracking.</p>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                <Car size={16} />
              </div>
              <h5 className="text-xs font-black text-sky-950 uppercase">Driver Empowerment</h5>
              <p className="text-[11px] text-sky-800">Verified driver onboarding, automated trip matching, flexible payouts & trip telemetry logs.</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                <Shield size={16} />
              </div>
              <h5 className="text-xs font-black text-amber-950 uppercase">State Governance</h5>
              <p className="text-[11px] text-amber-900">Real-time control tower, surge/traffic controls, audited revenue logs & fleet verification.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'stakeholders',
      badge: 'STAKEHOLDER VALUE MATRIX',
      title: 'Multi-Stakeholder Benefits & Operational Roles',
      subtitle: 'Delivering Targeted Solutions for Every Sector of the Transport Ecosystem',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg"><User size={16} /></div>
              <h4 className="text-xs font-black text-zinc-900 uppercase">Passengers (Riders)</h4>
            </div>
            <ul className="text-xs text-zinc-700 space-y-1.5 list-disc list-inside">
              <li><strong>Fair Pricing:</strong> Upfront estimated pricing with clear breakdown (Base + Distance + Time).</li>
              <li><strong>Payment Flexibility:</strong> In-app wallet ledger, card simulation, cash settlement.</li>
              <li><strong>Safety & Comfort:</strong> SOS panic button, driver verification badges, live trip sharing.</li>
            </ul>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-100 text-sky-800 rounded-lg"><Car size={16} /></div>
              <h4 className="text-xs font-black text-zinc-900 uppercase">Fleet Drivers & Operators</h4>
            </div>
            <ul className="text-xs text-zinc-700 space-y-1.5 list-disc list-inside">
              <li><strong>Maximum Fleet Utilization:</strong> Intelligent proximity matching reduces dead mileage.</li>
              <li><strong>Transparent Earnings:</strong> Instant commission payout & daily/weekly performance analytics.</li>
              <li><strong>Simplified Verification:</strong> Fast digital document submission & verification status.</li>
            </ul>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-900 rounded-lg"><Shield size={16} /></div>
              <h4 className="text-xs font-black text-zinc-900 uppercase">Transport Regulators & Admins</h4>
            </div>
            <ul className="text-xs text-zinc-700 space-y-1.5 list-disc list-inside">
              <li><strong>Live Fleet Oversight:</strong> Real-time heatmaps & city-wide driver density visualization.</li>
              <li><strong>Dynamic Policy Controls:</strong> Trigger surge pricing & peak traffic slowdown simulation.</li>
              <li><strong>Auditability:</strong> Complete chronological system audit logs for compliance & safety.</li>
            </ul>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg"><Activity size={16} /></div>
              <h4 className="text-xs font-black text-zinc-900 uppercase">State Economic Impact</h4>
            </div>
            <ul className="text-xs text-zinc-700 space-y-1.5 list-disc list-inside">
              <li><strong>Job Creation:</strong> Formalizing informal transport sector with verified driver opportunities.</li>
              <li><strong>Revenue Efficiency:</strong> Transparent revenue collections & state transport levy tracking.</li>
              <li><strong>Data-Driven Mobility:</strong> Route usage analytics for infrastructure planning.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'rider-workflow',
      badge: 'WORKFLOW DEMONSTRATION',
      title: 'End-to-End Rider Journey',
      subtitle: 'From Location Search to Safe Arrival & Automated Payment Settlement',
      content: (
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">STEP 1</span>
              <h5 className="text-xs font-black text-zinc-900 mt-1">Route & City Selection</h5>
              <p className="text-[11px] text-zinc-600">Choose city (Gusau, Kaura Namoda) & set origin and destination on interactive map.</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">STEP 2</span>
              <h5 className="text-xs font-black text-zinc-900 mt-1">Vehicle Category Choice</h5>
              <p className="text-[11px] text-zinc-600">Select class (Economy ZamTaxi X, Comfort, Luxury SUV) with instant fare calculation.</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">STEP 3</span>
              <h5 className="text-xs font-black text-zinc-900 mt-1">Proximity Driver Dispatch</h5>
              <p className="text-[11px] text-zinc-600">Nearest verified driver accepts, initializing turn-by-turn pickup simulation.</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">STEP 4</span>
              <h5 className="text-xs font-black text-zinc-900 mt-1">Trip Completion & Rating</h5>
              <p className="text-[11px] text-zinc-600">Wallet automated deduction, instant digital receipt generation, and driver rating.</p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Shield className="text-emerald-700 shrink-0" size={24} />
            <div className="text-xs text-emerald-950">
              <strong className="font-black">Safety First Guarantee:</strong> Every active ride includes one-click Emergency SOS broadcast, live location sharing URL simulation, and direct voice call simulation with driver.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'driver-workflow',
      badge: 'OPERATIONS WORKFLOW',
      title: 'Driver Onboarding & Fleet Dispatch Workflow',
      subtitle: 'Empowering Drivers with Smart Dispatching & Transparent Earnings',
      content: (
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black bg-sky-700 text-white px-2 py-0.5 rounded">1. ONBOARDING</span>
                <CheckCircle2 size={16} className="text-sky-700" />
              </div>
              <h5 className="text-xs font-black text-zinc-900">Verification & Registration</h5>
              <p className="text-[11px] text-zinc-600">Drivers register vehicle details, plate number, drivers license, and vehicle inspection badge for admin review.</p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black bg-sky-700 text-white px-2 py-0.5 rounded">2. GO ONLINE</span>
                <Zap size={16} className="text-amber-600" />
              </div>
              <h5 className="text-xs font-black text-zinc-900">Online/Offline Toggle</h5>
              <p className="text-[11px] text-zinc-600">One-click online status broadcasts driver location coordinates onto the central map radar.</p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black bg-sky-700 text-white px-2 py-0.5 rounded">3. RIDE EXECUTION</span>
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <h5 className="text-xs font-black text-zinc-900">Acceptance & Earnings</h5>
              <p className="text-[11px] text-zinc-600">Audio ride request alert, 15-second acceptance window, live GPS navigation, and payout ledger.</p>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
            <span>Automated Platform Split:</span>
            <span className="text-emerald-400 font-bold">85% Driver Payout • 15% ZamTaxi Service & Maintenance Levy</span>
          </div>
        </div>
      )
    },
    {
      id: 'admin-workflow',
      badge: 'GOVERNANCE & TELEMETRY',
      title: 'Administrator Control Tower & System Supervision',
      subtitle: 'State-wide Command Center for Operational Excellence & Traffic Management',
      content: (
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
                <Activity size={15} className="text-amber-600" /> Live Telemetry & Surge Controls
              </h4>
              <p className="text-xs text-zinc-700">
                Admins can dynamically toggle <strong>Surge Pricing (1.8x)</strong> during high demand or <strong>Peak Traffic Slowdown (2x)</strong> to test system response under congested road conditions.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
                <FileText size={15} className="text-emerald-700" /> Real-time System Audit Stream
              </h4>
              <p className="text-xs text-zinc-700">
                Every action (wallet credit, driver suspension, fare change, trip dispatch) is recorded in an immutable chronological audit trail for state compliance.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-1">
            <h5 className="text-xs font-black text-amber-950 uppercase">User & Fleet Management Hub</h5>
            <p className="text-xs text-amber-900">
              Inspect passenger wallets, top up balances, grant or revoke driver verification status, and instantly switch simulation roles for comprehensive testing.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tech-architecture',
      badge: 'TECHNICAL STACK',
      title: 'System Architecture & Technical Infrastructure',
      subtitle: 'Built on Robust, High-Performance Modern Technologies',
      content: (
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase">FRONTEND FRAMEWORK</span>
              <h5 className="text-xs font-black text-zinc-900">React 18 + TypeScript</h5>
              <p className="text-[11px] text-zinc-600">Strict type safety, modular component architecture, and responsive state handlers.</p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase">MAP & TELEMETRY</span>
              <h5 className="text-xs font-black text-zinc-900">Leaflet / Canvas Engine</h5>
              <p className="text-[11px] text-zinc-600">High-FPS vector map rendering, animated vehicle tracking, custom city waypoints.</p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase">PERSISTENCE LAYER</span>
              <h5 className="text-xs font-black text-zinc-900">Firebase Firestore Sync</h5>
              <p className="text-[11px] text-zinc-600">Real-time database synchronization across sessions with local storage fallback.</p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl space-y-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase">DESIGN SYSTEM</span>
              <h5 className="text-xs font-black text-zinc-900">Tailwind CSS + Lucide</h5>
              <p className="text-[11px] text-zinc-600">High-contrast, accessible UI tailored with warm neutrals and custom badges.</p>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-900 text-white rounded-2xl flex items-center justify-between text-xs">
            <span>Security & Data Privacy:</span>
            <span className="text-emerald-400 font-bold">Role-Based Access Control (RBAC) • Audit Trail Logging</span>
          </div>
        </div>
      )
    },
    {
      id: 'real-world-deployment',
      badge: 'PRODUCTION READINESS & ROADMAP',
      title: 'Transitioning from Prototype to Real-World Commercial Operation',
      subtitle: 'Key Hardware, Integration, Infrastructure & Regulatory Requirements for Live Launch',
      content: (
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-1.5">
              <h4 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
                <Smartphone size={15} className="text-emerald-700" /> 1. Native Mobile Apps (iOS & Android)
              </h4>
              <p className="text-xs text-zinc-700">
                Package current logic into Flutter or React Native apps with native background GPS daemons, push notifications (FCM), and low-battery background location tracking for drivers.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-1.5">
              <h4 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
                <Wallet size={15} className="text-sky-700" /> 2. Local Payment & USSD Gateways
              </h4>
              <p className="text-xs text-zinc-700">
                Connect Paystack, Flutterwave, Monnify or NIBSS APIs for instant card funding, bank transfer verification, automated driver payouts, and offline USSD ride booking (*347# simulation).
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-1.5">
              <h4 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
                <Shield size={15} className="text-amber-700" /> 3. Identity & NIN Verification
              </h4>
              <p className="text-xs text-zinc-700">
                Integrate NIMC (National Identity Number) API & Drivers License databases (FRSC) for real-time automated driver background checks before granting verified badges.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-1.5">
              <h4 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
                <Server size={15} className="text-indigo-700" /> 4. Scalable Backend & SMS Engine
              </h4>
              <p className="text-xs text-zinc-700">
                Deploy microservices on AWS/Google Cloud with PostgreSQL/PostGIS spatial indexing, Redis caching, and Termii/Twilio SMS gateways for OTP login and SOS broadcasts.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1">
            <h5 className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1.5">
              <Award size={14} className="text-emerald-700" /> State Government Regulatory & Physical Operations
            </h5>
            <p className="text-xs text-emerald-900">
              Establish physical driver onboarding hubs in Gusau, Kaura Namoda & Talata Mafara for vehicle physical inspection, safety kit installation, and partnership with Zamfara State Ministry of Works and Transport.
            </p>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white border border-[#E5DFD3] rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
        {/* HEADER */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-700 text-white rounded-xl">
              <Presentation size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                {slide.badge} • SLIDE {currentSlide + 1} OF {slides.length}
              </span>
              <h3 className="text-sm font-black text-zinc-900">ZamTaxi Stakeholder System Presentation</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-[#F2EDE4] rounded-xl transition cursor-pointer"
            id="btn-close-presentation-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* SLIDE CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="border-b border-[#E5DFD3] pb-3">
            <h2 className="text-lg sm:text-xl font-black text-zinc-900">{slide.title}</h2>
            <p className="text-xs text-zinc-600 font-semibold mt-0.5">{slide.subtitle}</p>
          </div>

          {slide.content}
        </div>

        {/* FOOTER CONTROLS */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD3] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-white border border-[#E5DFD3] hover:bg-[#F2EDE4] disabled:opacity-40 text-zinc-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-emerald-700' : 'w-2.5 bg-zinc-300 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
