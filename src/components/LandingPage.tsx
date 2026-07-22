import React, { useState } from 'react';
import { 
  Car, 
  User, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  LogIn, 
  Sparkles, 
  Award, 
  Bike, 
  Users, 
  ShieldAlert, 
  Star, 
  Globe, 
  Shield, 
  HeartHandshake, 
  UserPlus, 
  Phone, 
  Mail,
  HelpCircle,
  ExternalLink,
  Lock,
  Compass,
  DollarSign,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Location, VehicleType, UserProfile } from '../types';
import { CITIES, VEHICLE_CONFIGS } from '../data';
// @ts-ignore
import zamtaxiFront from '../assets/images/zamtaxi_front_1784738289926.jpg';
// @ts-ignore
import zamtaxiBonnet from '../assets/images/zamtaxi_bonnet_1784738306450.jpg';
// @ts-ignore
import zamtaxiDriving from '../assets/images/zamtaxi_driving_1784738322282.jpg';
// @ts-ignore
import greenEvHeroTaxi from '../assets/images/green_ev_hero_taxi_1784738815893.jpg';
// @ts-ignore
import zamtaxiSideProfile from '../assets/images/zamtaxi_side_profile_1784739398677.jpg';
// @ts-ignore
import zamtaxiBoltStyle from '../assets/images/zamtaxi_bolt_style_1784740082968.jpg';
// @ts-ignore
import zamtaxiGreenPainted from '../assets/images/zamtaxi_green_painted_1784740790868.jpg';
// @ts-ignore
import zamtaxiHausaMan from '../assets/images/zamtaxi_hausa_man_1784741007702.jpg';
// @ts-ignore
import zamtaxiBoldGreenFront from '../assets/images/zamtaxi_bold_green_front_1784741222972.jpg';
// @ts-ignore
import airportTransferPassenger from '../assets/images/airport_transfer_passenger_1784740265459.jpg';
// @ts-ignore
import zamtaxiAirportTransferGreen from '../assets/images/zamtaxi_airport_transfer_green_1784740477851.jpg';

interface LandingPageProps {
  passengers: any[];
  setPassengers: React.Dispatch<React.SetStateAction<any[]>>;
  drivers: any[];
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  admins: any[];
  setAdmins: React.Dispatch<React.SetStateAction<any[]>>;
  onLoginSuccess: (role: 'rider' | 'driver' | 'admin', userProfile: UserProfile, activeTabName: 'rider' | 'driver' | 'users' | 'dashboard') => void;
  addAuditLog: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
}

export default function LandingPage({
  passengers,
  setPassengers,
  drivers,
  setDrivers,
  admins,
  setAdmins,
  onLoginSuccess,
  addAuditLog
}: LandingPageProps) {
  // Navigation active anchors
  const [activeNav, setActiveNav] = useState('home');
  
  // Selected City ID for Municipal Networks dropdown
  const [selectedCityId, setSelectedCityId] = useState('gusau');
  
  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'rider' | 'driver' | 'admin'>('rider');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Quick Estimates Form State
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('X');
  const [estimatedDistance, setEstimatedDistance] = useState<number>(5.5); // in km
  const [selectedEstimateCity, setSelectedEstimateCity] = useState(CITIES[0].id);
  const [travelMode, setTravelMode] = useState<'municipal' | 'interstate'>('municipal');
  const [selectedOriginCity, setSelectedOriginCity] = useState(CITIES[0].id);
  const [selectedDestCity, setSelectedDestCity] = useState(CITIES[1].id);

  // Sign In Selected Preset State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Custom Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBalance, setRegBalance] = useState('50000');
  
  // Driver Specific Registration Fields
  const [regVehicleModel, setRegVehicleModel] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regVehicleType, setRegVehicleType] = useState<VehicleType>('X');

  // FAQ Accordion Active Index
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Legal Modal States
  const [legalModalType, setLegalModalType] = useState<'tos' | 'privacy' | 'safety' | null>(null);

  // Handle preset selection
  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    if (loginRole === 'rider') {
      const match = passengers.find(p => p.id === id);
      if (match) {
        setRegName(match.name);
        setRegEmail(match.email || '');
        setRegPhone(match.phone || '');
      }
    } else if (loginRole === 'driver') {
      const match = drivers.find(d => d.id === id);
      if (match) {
        setRegName(match.name);
        setRegPhone(match.phone || '');
        setRegVehicleModel(match.vehicleName || '');
        setRegPlate(match.plateNumber || '');
        setRegVehicleType(match.vehicleType || 'X');
      }
    } else {
      const match = admins.find(a => a.id === id);
      if (match) {
        setRegName(match.name);
        setRegEmail(match.email || '');
      }
    }
  };

  // Perform Sign In
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginRole === 'rider') {
      const targetId = selectedPresetId || passengers[0]?.id;
      const passenger = passengers.find(p => p.id === targetId) || passengers[0];
      
      if (passenger) {
        const uProfile: UserProfile = {
          name: passenger.name,
          rating: passenger.rating || 5.0,
          balance: passenger.balance || 50000.0,
          isDriver: false,
          avatar: passenger.avatar,
          role: 'rider'
        };
        addAuditLog('RIDER', `${passenger.name} successfully authenticated as Active Rider via Secure Login.`);
        onLoginSuccess('rider', uProfile, 'rider');
        setIsLoginOpen(false);
      }
    } else if (loginRole === 'driver') {
      const targetId = selectedPresetId || drivers[0]?.id;
      const driver = drivers.find(d => d.id === targetId) || drivers[0];
      
      if (driver) {
        const uProfile: UserProfile = {
          name: driver.name,
          rating: driver.rating || 4.8,
          balance: 0.0, // Earnings are accumulated dynamically
          isDriver: true,
          avatar: driver.avatar,
          role: 'driver'
        };
        addAuditLog('DRIVER', `Driver ${driver.name} connected live container console. GPS verification complete.`);
        onLoginSuccess('driver', uProfile, 'driver');
        setIsLoginOpen(false);
      }
    } else {
      const targetId = selectedPresetId || admins[0]?.id;
      const admin = admins.find(a => a.id === targetId) || admins[0];
      
      if (admin) {
        const uProfile: UserProfile = {
          name: admin.name,
          rating: 5.0,
          balance: 250000.0, // Admin buffer balance
          isDriver: false,
          avatar: admin.avatar,
          role: 'admin'
        };
        addAuditLog('ADMIN', `Administrator ${admin.name} entered Super Admin workspace. Access token dispatched.`);
        onLoginSuccess('admin', uProfile, 'users');
        setIsLoginOpen(false);
      }
    }
  };

  // Perform Registration / Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    if (loginRole === 'rider') {
      const newRider = {
        id: `rider-${Date.now()}`,
        name: regName,
        rating: 5.0,
        balance: parseFloat(regBalance) || 5000.0,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`,
        completedTrips: 0,
        status: 'ACTIVE',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        email: regEmail || `${regName.toLowerCase().replace(/\s+/g, '')}@transit.ng`,
        phone: regPhone || '+234 803 ' + Math.floor(1000000 + Math.random() * 9000000)
      };

      setPassengers(prev => [newRider, ...prev]);
      
      const uProfile: UserProfile = {
        name: newRider.name,
        rating: 5.0,
        balance: newRider.balance,
        isDriver: false,
        avatar: newRider.avatar,
        role: 'rider'
      };

      addAuditLog('RIDER', `New Rider Account Registered: ${newRider.name}. Account credited with ₦${newRider.balance}.`);
      onLoginSuccess('rider', uProfile, 'rider');
    } else if (loginRole === 'driver') {
      const plates = ['LAG', 'ABJ', 'ENU', 'PHC', 'KAN', 'KDS', 'GSU'];
      const randomPrefix = plates[Math.floor(Math.random() * plates.length)];
      const newDriver = {
        id: `driver-${Date.now()}`,
        name: regName,
        rating: 5.0,
        vehicleType: regVehicleType,
        vehicleName: regVehicleModel || 'Toyota Corolla',
        plateNumber: regPlate || `${randomPrefix}-${Math.floor(100 + Math.random() * 899)}-NG`,
        avatar: `https://images.unsplash.com/photo-${1510000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`,
        phone: regPhone || '+234 816 ' + Math.floor(1000000 + Math.random() * 9000000),
        completedTrips: 0,
        isVerified: true,
        status: 'ACTIVE',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setDrivers(prev => [newDriver, ...prev]);

      const uProfile: UserProfile = {
        name: newDriver.name,
        rating: 5.0,
        balance: 0.0,
        isDriver: true,
        avatar: newDriver.avatar,
        role: 'driver'
      };

      addAuditLog('DRIVER', `New Driver Registered and Verified: ${newDriver.name} driving ${newDriver.vehicleName} [${newDriver.plateNumber}]`);
      onLoginSuccess('driver', uProfile, 'driver');
    } else {
      // Create Admin
      const newAdmin = {
        id: `admin-${Date.now()}`,
        name: regName,
        avatar: `https://images.unsplash.com/photo-${1480000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`,
        role: 'Fleet Manager',
        status: 'ACTIVE',
        email: regEmail || `${regName.toLowerCase().replace(/\s+/g, '')}.admin@nigeria.gov.ng`,
        actionsCount: 0
      };

      setAdmins(prev => [newAdmin, ...prev]);

      const uProfile: UserProfile = {
        name: newAdmin.name,
        rating: 5.0,
        balance: 100000.0,
        isDriver: false,
        avatar: newAdmin.avatar,
        role: 'admin'
      };

      addAuditLog('ADMIN', `New Administrator Access Generated for ${newAdmin.name} (${newAdmin.role})`);
      onLoginSuccess('admin', uProfile, 'users');
    }
    setIsLoginOpen(false);
  };

  // Switch role and reset selected presets
  const selectLoginRole = (role: 'rider' | 'driver' | 'admin') => {
    setLoginRole(role);
    setSelectedPresetId('');
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegVehicleModel('');
    setRegPlate('');
  };

  const getInterstateDistance = (fromId: string, toId: string) => {
    const fromCity = CITIES.find(c => c.id === fromId);
    const toCity = CITIES.find(c => c.id === toId);
    if (!fromCity || !toCity || fromId === toId) return 0;
    
    // Calculate Haversine distance in km
    const R = 6371; // radius of Earth in km
    const dLat = (toCity.center.lat - fromCity.center.lat) * Math.PI / 180;
    const dLon = (toCity.center.lng - fromCity.center.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(fromCity.center.lat * Math.PI / 180) * Math.cos(toCity.center.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    // Adjust with route multiplier coefficient (e.g., 1.35x for actual road route curves)
    return Math.max(45, Math.round(d * 1.35));
  };

  // Pricing math helper
  const calculateEstimatedPrice = () => {
    const config = VEHICLE_CONFIGS.find(v => v.id === selectedVehicle) || VEHICLE_CONFIGS[0];
    if (travelMode === 'municipal') {
      const baseFare = 400; // base flat Naira
      const perKmRate = 120; // Naira per km
      const result = (baseFare + (estimatedDistance * perKmRate)) * config.multiplier;
      return Math.round(result);
    } else {
      const dist = getInterstateDistance(selectedOriginCity, selectedDestCity);
      const baseFare = 12000; // inter-state base
      const perKmRate = 180; // inter-state rate per km
      const result = (baseFare + (dist * perKmRate)) * config.multiplier;
      return Math.round(result);
    }
  };

  const FAQS = [
    {
      q: "How does the double-sided simulation system operate?",
      a: "The Uber Simulator is a double-sided urban workspace. When you book a ride in 'Rider Mode', the simulator server routes the request to your dynamic driver fleet. It matches verified, active drivers in real-time, displays live coordinate travel sequences on our interactive vector maps, and processes dynamic credit-debit account balances upon safe arrival."
    },
    {
      q: "Which states and regions are covered by the operations?",
      a: "We currently cover 17 key states and commercial hubs across Nigeria—including Lagos, Abuja FCT, Rivers (Port Harcourt), Kano, Enugu, Kaduna, Sokoto, Kebbi, Katsina, Niger, Nasarawa, Jigawa, Gombe, Borno, Adamawa, Yobe, and Zamfara (Gusau). Both intrastate (intra-city) and interstate (cross-country) travel corridors are fully active."
    },
    {
      q: "How do Intrastate and Interstate bookings differ?",
      a: "Intrastate bookings cover fast, localized intra-city trips within any covered state sector. Interstate bookings connect major state terminals and hubs with highway distance routing, state border clearance fees, and dedicated cross-state vehicle classes."
    },
    {
      q: "How can I register as a driver and accumulate earnings?",
      a: "Simply click 'Get Started' or 'Sign In', select the 'Driver' tab, and choose 'Create Account'. You can register custom vehicle specifications, define a license plate number, and select vehicle classes (such as ZamTaxi Standard, Comfort, or Premium). Once registered, your profile is added to the simulation loop and can be summoned dynamically."
    },
    {
      q: "What safety protocols are implemented for commuters?",
      a: "Our console includes background audit logs, multi-factor credential pre-authorizations, real-time vehicle route status trackers, and an instantaneous system-wide 'Surge Switch' to manage extreme weather, heavy congestion, or safety contingencies gracefully."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-zinc-900 flex flex-col font-sans selection:bg-zinc-300 selection:text-zinc-900 relative overflow-x-hidden" id="landing-page-root">
      
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* STICKY TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DFD3] px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black tracking-tighter text-xl shadow-xs">
              U
            </div>
            <div>
              <span className="text-zinc-900 font-extrabold text-base tracking-tight block">Uber Nigeria</span>
              <span className="text-emerald-700 text-[9px] uppercase font-bold tracking-widest block -mt-0.5">
                National Fleet Simulator
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-600">
            <a 
              href="#hero" 
              onClick={() => setActiveNav('home')}
              className={`transition hover:text-zinc-900 ${activeNav === 'home' ? 'text-zinc-900 border-b-2 border-emerald-700 pb-1' : ''}`}
            >
              Home
            </a>
            <a 
              href="#pricing" 
              onClick={() => {
                setActiveNav('pricing');
                setTravelMode('municipal');
              }}
              className={`transition hover:text-zinc-900 ${activeNav === 'pricing' ? 'text-zinc-900 border-b-2 border-emerald-700 pb-1' : ''}`}
            >
              Intrastate
            </a>
            <a 
              href="#pricing" 
              onClick={() => {
                setActiveNav('interstate');
                setTravelMode('interstate');
              }}
              className={`transition hover:text-zinc-900 ${activeNav === 'interstate' ? 'text-zinc-900 border-b-2 border-emerald-700 pb-1' : ''}`}
            >
              Interstate
            </a>
            <a 
              href="#cities" 
              onClick={() => setActiveNav('cities')}
              className={`transition hover:text-zinc-900 ${activeNav === 'cities' ? 'text-zinc-900 border-b-2 border-emerald-700 pb-1' : ''}`}
            >
              Active Cities
            </a>
            <a 
              href="#faq" 
              onClick={() => setActiveNav('faq')}
              className={`transition hover:text-zinc-900 ${activeNav === 'faq' ? 'text-zinc-900 border-b-2 border-emerald-700 pb-1' : ''}`}
            >
              Help & FAQ
            </a>
          </div>

          {/* Nav Right CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { selectLoginRole('rider'); setAuthMode('signin'); setIsLoginOpen(true); }}
              className="text-xs font-extrabold text-zinc-800 hover:text-zinc-950 px-3.5 py-2 transition rounded-lg hover:bg-white border border-transparent hover:border-[#E5DFD3] cursor-pointer"
              id="landing-signin-btn"
            >
              Sign In
            </button>
            <button 
              onClick={() => { selectLoginRole('rider'); setAuthMode('signup'); setIsLoginOpen(true); }}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              id="landing-getstarted-btn"
            >
              Get Started
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-12 md:pt-20 pb-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold tracking-wider uppercase">
            <Sparkles size={11} className="animate-pulse" />
            Double-Sided Urban Ride-Share Console
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-none">
            Beat the Traffic. <br />
            <span className="text-emerald-700">
              Enjoy the Ride.
            </span>
          </h2>

          <p className="text-zinc-700 font-medium text-sm md:text-base max-w-xl leading-relaxed">
            Experience state-of-the-art dispatch simulation across all covered states in Nigeria. Seamlessly book intrastate city runs and long-distance interstate routes, manage live verified vehicle fleets, monitor GPS coordinate updates, and experience true admin control.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 py-3 border-y border-[#E5DFD3] max-w-lg">
            <div>
              <span className="block text-xl font-extrabold text-zinc-900 tracking-tight">17 States</span>
              <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Covered Regions</span>
            </div>
            <div>
              <span className="block text-xl font-extrabold text-zinc-900 tracking-tight">Intra & Inter</span>
              <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Route Modes</span>
            </div>
            <div>
              <span className="block text-xl font-extrabold text-emerald-700 tracking-tight">{drivers.length} Active</span>
              <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Verified Drivers</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => { selectLoginRole('rider'); setAuthMode('signin'); setIsLoginOpen(true); }}
              className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-extrabold px-6 py-3.5 rounded-xl transition shadow-lg shadow-white/5 flex items-center gap-2 cursor-pointer"
              id="hero-book-ride-cta"
            >
              <User size={14} />
              Book a Ride (Rider Mode)
            </button>
            <button
              onClick={() => { selectLoginRole('driver'); setAuthMode('signin'); setIsLoginOpen(true); }}
              className="bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-xs font-extrabold px-6 py-3.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
              id="hero-driver-mode-cta"
            >
              <Car size={14} />
              Earn on the Road (Driver Mode)
            </button>
          </div>

          <p className="text-[11px] text-zinc-600 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" />
            No credit card required. Preloaded simulation balances.
          </p>
        </div>

        {/* HERO RIGHT: 100% ELECTRIC ZAMTAXI VEHICLE */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-3xl blur opacity-30" />
          
          <div className="relative bg-zinc-900 text-white border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            
            {/* Bold Full-Bleed ZAMTAXI Vehicle Showcase - No inner frame, edge-to-edge */}
            <div className="relative w-full overflow-hidden group bg-zinc-950">
              <img
                src={zamtaxiBoldGreenFront}
                alt="Official ZAMTAXI 100% Electric Taxi"
                className="w-full h-auto aspect-[16/10] sm:aspect-[16/9] object-cover group-hover:scale-103 transition duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== zamtaxiFront) {
                    target.src = zamtaxiFront;
                  }
                }}
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xl border border-emerald-400/40 z-10">
                ZAMTAXI • 100% ELECTRIC
              </div>
            </div>

            <div className="p-6 space-y-2 text-center bg-zinc-900 border-t border-zinc-800/80">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold font-mono px-3.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                Official State Transport Fleet
              </div>
              <h3 className="text-3xl font-black text-white tracking-wider">
                ZAMTAXI
              </h3>
              <p className="text-xs text-zinc-300 font-medium max-w-sm mx-auto leading-relaxed">
                Zamfara State Transport • 100% Electric • Intrastate & Interstate
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* OFFICIAL ZAMTAXI 100% ELECTRIC FLEET SHOWCASE */}
      <section id="fleet" className="bg-[#FAF7F2] border-y border-[#E5DFD3] py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">OFFICIAL STATE FLEET</span>
            <h3 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
              100% Electric ZamTaxi Vehicles
            </h3>
            <p className="text-zinc-700 font-medium text-xs leading-relaxed">
              Deployed across Zamfara State and 17 covered state corridors. Clean energy, zero emissions, and modern passenger comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Photo 1: Front view */}
            <div className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative h-56 overflow-hidden bg-zinc-900">
                <img
                  src={zamtaxiFront}
                  alt="ZamTaxi Green Electric Car Front View"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Front View • BWR-22EM
                </div>
              </div>
              <div className="p-5 space-y-2 text-left">
                <h4 className="font-extrabold text-base text-zinc-900">Official State Taxi (Abuja & Gusau)</h4>
                <p className="text-zinc-600 text-xs font-medium leading-relaxed">
                  Modern green electric sedan deployed across Gusau, Talata Mafara, and Kaura Namoda. Equipped with GPS telematics and climate control.
                </p>
              </div>
            </div>

            {/* Photo 2: Bonnet branding */}
            <div className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative h-56 overflow-hidden bg-zinc-900">
                <img
                  src={zamtaxiBonnet}
                  alt="ZamTaxi Hood Livery 100% Electric"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  100% Electric Hood Wrap
                </div>
              </div>
              <div className="p-5 space-y-2 text-left">
                <h4 className="font-extrabold text-base text-zinc-900">Zamfara State Transport Livery</h4>
                <p className="text-zinc-600 text-xs font-medium leading-relaxed">
                  Distinctive green livery with "ZamTaxi 100% Electric" logo and checkered decal trim. Zero emissions transport for all commuters.
                </p>
              </div>
            </div>

            {/* Photo 3: Driving on road */}
            <div className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative h-56 overflow-hidden bg-zinc-900">
                <img
                  src={zamtaxiDriving}
                  alt="ZamTaxi Driving in Transit"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Active Dispatch
                </div>
              </div>
              <div className="p-5 space-y-2 text-left">
                <h4 className="font-extrabold text-base text-zinc-900">Intrastate & Interstate Routes</h4>
                <p className="text-zinc-600 text-xs font-medium leading-relaxed">
                  In active transit connecting city terminals and highway corridors across all 17 covered state sectors with real-time driver dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED INTERACTIVE FARE & DISPATCH ESTIMATOR SECTION */}
      <section id="pricing" className="bg-zinc-900/40 border-y border-zinc-900 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Info & Fare Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">FARE CALCULATOR</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Simulated Cost Estimation
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Choose a vehicle tier and adjust the slide bar to estimate dynamic fares. Our simulation runs on accurate state multipliers calibrated for local fuel indexes and road distance segments.
              </p>
            </div>

            {/* Vehicle Selection Carousel List */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Select Vehicle Class</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {VEHICLE_CONFIGS.map((config) => {
                  const isSelected = selectedVehicle === config.id;
                  return (
                    <button
                      key={config.id}
                      onClick={() => setSelectedVehicle(config.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected 
                          ? 'bg-white text-zinc-950 border-white shadow-lg' 
                          : 'bg-zinc-950/80 text-zinc-400 border-zinc-850 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-900 text-zinc-400'}`}>
                          {config.id === 'Black' ? <Award size={16} /> : config.id === 'Comfort' ? <Sparkles size={16} /> : <Car size={16} />}
                        </div>
                        <div>
                          <span className={`block font-bold text-xs ${isSelected ? 'text-zinc-950' : 'text-white'}`}>{config.name}</span>
                          <span className="block text-[9px] opacity-75">{config.description}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-mono text-xs font-black">{config.multiplier}x</span>
                        <span className="block text-[9px] opacity-75">Cap: {config.capacity} pax</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Interactive Slider and Quote Output Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-950 border border-zinc-850 p-6 md:p-8 rounded-3xl space-y-6">
              
              {/* Active Travel Mode Indicator & Separation Switcher */}
              <div className="flex items-center justify-between border border-zinc-850/80 p-3 rounded-2xl bg-zinc-900/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {travelMode === 'municipal' ? 'Intrastate (Intra-City)' : 'Interstate (Inter-City)'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextMode = travelMode === 'municipal' ? 'interstate' : 'municipal';
                    setTravelMode(nextMode);
                    setActiveNav(nextMode === 'municipal' ? 'pricing' : 'interstate');
                  }}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 cursor-pointer"
                >
                  {travelMode === 'municipal' ? 'Switch to Interstate' : 'Switch to Intrastate'}
                  <ArrowRight size={11} />
                </button>
              </div>

              {travelMode === 'municipal' ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-white font-extrabold text-lg">Calculate Route Cost</h4>
                      <p className="text-zinc-500 text-xs">Simulated pricing for intrastate travel segments</p>
                    </div>
                    
                    {/* City Select */}
                    <select
                      value={selectedEstimateCity}
                      onChange={(e) => setSelectedEstimateCity(e.target.value)}
                      className="bg-zinc-900 text-zinc-300 text-xs border border-zinc-800 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                    >
                      {CITIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Slider Input */}
                  <div className="space-y-4 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-850/60">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-400">Total Distance Sector</span>
                      <span className="text-white bg-zinc-800 px-3 py-1 rounded-lg font-mono text-xs">{estimatedDistance.toFixed(1)} km</span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="35"
                      step="0.5"
                      value={estimatedDistance}
                      onChange={(e) => setEstimatedDistance(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-zinc-850 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>1 km (Short local run)</span>
                      <span>15 km</span>
                      <span>35 km (Cross-commute)</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-lg">Calculate Interstate Journey</h4>
                    <p className="text-zinc-500 text-xs">Simulated pricing for long-distance out of state segments</p>
                  </div>

                  {/* Origin & Destination Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850/60">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Departure State / City
                      </label>
                      <select
                        value={selectedOriginCity}
                        onChange={(e) => {
                          setSelectedOriginCity(e.target.value);
                          if (e.target.value === selectedDestCity) {
                            // Automatically switch destination to avoid duplicates
                            const next = CITIES.find(c => c.id !== e.target.value);
                            if (next) setSelectedDestCity(next.id);
                          }
                        }}
                        className="w-full bg-zinc-950 text-zinc-300 text-xs border border-zinc-800 rounded-xl px-3.5 py-3 outline-none focus:border-emerald-500"
                      >
                        {CITIES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Destination State / City
                      </label>
                      <select
                        value={selectedDestCity}
                        onChange={(e) => {
                          setSelectedDestCity(e.target.value);
                          if (e.target.value === selectedOriginCity) {
                            const next = CITIES.find(c => c.id !== e.target.value);
                            if (next) setSelectedOriginCity(next.id);
                          }
                        }}
                        className="w-full bg-zinc-950 text-zinc-300 text-xs border border-zinc-800 rounded-xl px-3.5 py-3 outline-none focus:border-emerald-500"
                      >
                        {CITIES.map(c => (
                          <option key={c.id} value={c.id} disabled={c.id === selectedOriginCity}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculated Highway Route details */}
                  <div className="flex items-center justify-between p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Compass size={14} className="text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Simulated Highway Route Corridor</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">
                      {getInterstateDistance(selectedOriginCity, selectedDestCity)} km
                    </span>
                  </div>
                </>
              )}

              {/* Fare Summary Output Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="md:col-span-2 space-y-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold tracking-wider uppercase">
                    Immediate Dispatch Quote
                  </span>
                  <div className="text-zinc-400 text-xs">
                    {travelMode === 'municipal' ? (
                      <>
                        Estimated fare for <span className="text-white font-bold">{estimatedDistance} km</span> via <span className="text-emerald-400 font-bold">{VEHICLE_CONFIGS.find(v=>v.id===selectedVehicle)?.name}</span> within <span className="text-white font-bold">{CITIES.find(c=>c.id===selectedEstimateCity)?.name}</span>.
                      </>
                    ) : (
                      <>
                        Estimated fare for <span className="text-white font-bold">{getInterstateDistance(selectedOriginCity, selectedDestCity)} km</span> via <span className="text-emerald-400 font-bold">{VEHICLE_CONFIGS.find(v=>v.id===selectedVehicle)?.name}</span> from <span className="text-white font-bold">{CITIES.find(c=>c.id===selectedOriginCity)?.name.split(' (')[0]}</span> to <span className="text-white font-bold">{CITIES.find(c=>c.id===selectedDestCity)?.name.split(' (')[0]}</span>.
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {travelMode === 'municipal' 
                      ? "Includes local base fuel tax, safety surcharges, and intrastate licensing."
                      : "Includes state border toll clearance, highway safety patrol levies, and fuel index surcharges."
                    }
                  </div>
                </div>

                <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Estimated Fare</span>
                  <span className="text-3xl font-black text-white block tracking-tighter">
                    ₦{calculateEstimatedPrice().toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">Ready for simulation</span>
                </div>
              </div>

              {/* Booking Trigger CTA */}
              <button
                onClick={() => { selectLoginRole('rider'); setAuthMode('signin'); setIsLoginOpen(true); }}
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
              >
                Sign In to Book This Ride Now
                <ArrowRight size={14} />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* ACTIVE CITIES CONTAINER SHIFT CARD */}
      <section id="cities" className="max-w-7xl mx-auto py-16 px-6 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">COVERED STATES & NETWORKS</span>
          <h3 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            17 States & Federal Operational Sectors
          </h3>
          <p className="text-zinc-700 font-medium text-xs">
            Our navigation engine integrates 17 major state capitals and economic hubs across Nigeria for both intrastate (city-wide) and interstate (cross-boundary) travel.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          <div className="relative">
            <label className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">
              Select Operating Network:
            </label>
            <div className="relative max-w-md mx-auto">
              <select
                id="select-operational-sector"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-semibold rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:border-emerald-500 transition cursor-pointer pr-10 text-sm"
              >
                {CITIES.map((city) => (
                  <option key={city.id} value={city.id} className="bg-zinc-950 text-white py-2">
                    {city.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(() => {
              const city = CITIES.find(c => c.id === selectedCityId) || CITIES[0];
              return (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
                >
                  {/* Top / Main Image Showcase: Full Bleed Wide Side Profile matching Bolt photo composition */}
                  <div className="relative w-full overflow-hidden group bg-zinc-950">
                    <img
                      src={zamtaxiHausaMan}
                      alt="Official ZAMTAXI Electric Car with Hausa Gentleman"
                      className="w-full h-auto aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.2/1] object-cover group-hover:scale-103 transition duration-700"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== zamtaxiGreenPainted) {
                          target.src = zamtaxiGreenPainted;
                        }
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Bottom Action Area */}
                  <div className="p-5 sm:p-6 bg-zinc-900 text-left border-t border-zinc-800">
                    <button 
                      onClick={() => { selectLoginRole('rider'); setAuthMode('signin'); setIsLoginOpen(true); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 uppercase tracking-wider"
                    >
                      Access {city.name.split(' ')[0]} Dispatch Desk
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </section>

      {/* AIRPORTS TRANSFER SHOWCASE SECTION */}
      <section className="bg-zinc-950/80 border-t border-zinc-900 py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          
          {/* Left: Complete Size Portrait Image with Slider Controls */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[380px] bg-zinc-900 p-2 rounded-[2rem] shadow-2xl border border-zinc-800/80 overflow-hidden group">
              <div className="relative aspect-[3/4] w-full rounded-[1.6rem] overflow-hidden bg-zinc-950">
                <img
                  src={zamtaxiAirportTransferGreen}
                  alt="ZAMTAXI Green Electric Airport Express Taxi"
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-700"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== airportTransferPassenger) {
                      target.src = airportTransferPassenger;
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-700/60 text-[11px] font-extrabold text-white tracking-wider uppercase">
                  Airport Express
                </div>
              </div>
            </div>

            {/* Slider Dots & Navigation Controls */}
            <div className="flex items-center gap-6 mt-6">
              <button 
                type="button"
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
                aria-label="Previous slide"
              >
                <ArrowLeft size={16} />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="w-2 h-2 rounded-full bg-zinc-700 hover:bg-zinc-600 cursor-pointer" />
                <span className="w-2 h-2 rounded-full bg-zinc-700 hover:bg-zinc-600 cursor-pointer" />
              </div>

              <button 
                type="button"
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                aria-label="Next slide"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: Airports Description & Action */}
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="space-y-3">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Airports
              </h3>
              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                Enjoy a seamless transfer to and from 100+ airports nationwide and internationally, including Gusau Municipal, Kano, and Abuja.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => { selectLoginRole('rider'); setAuthMode('signin'); setIsLoginOpen(true); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-950/30 inline-flex items-center gap-2.5"
              >
                View all airport transfers
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* DOUBLE-SIDED CAPABILITIES LIST (Rider, Driver, Admin views) */}
      <section className="bg-zinc-900/20 border-t border-zinc-900 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">TRIPLE CORE ARCHITECTURE</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              An Operations Console For Everyone
            </h3>
            <p className="text-zinc-400 text-xs">
              This simulated workspace caters to all user scenarios. Select your specific access credential above or simulate operations across roles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Rider Column */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                <User size={18} className="text-emerald-400" />
              </div>
              <h4 className="text-white font-extrabold text-base">Rider Workspace</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Book swift coordinates. Input start and end pin points or drop selectors on our live canvas. Estimate distances, select vehicle pricing, chat with active en-route drivers, and review overall ride metrics.
              </p>
              <ul className="space-y-2 text-zinc-500 text-xs pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Preloaded dynamic wallet system</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> AI-guided driver chat dialogue</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Star ratings and detailed reviews</li>
              </ul>
            </div>

            {/* Driver Column */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                <Car size={18} className="text-emerald-400" />
              </div>
              <h4 className="text-white font-extrabold text-base">Driver Operations</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Take command of vehicle mechanics. Toggle online availability states, monitor dynamic coordinate positioning, accept summoned bookings, receive live customer notifications, and accumulate trip revenue.
              </p>
              <ul className="space-y-2 text-zinc-500 text-xs pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Customizable positioning and status</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Instant passenger pickup alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Verified plate and vehicle stats</li>
              </ul>
            </div>

            {/* Admin Column */}
            <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                <ShieldCheck size={18} className="text-emerald-400" />
              </div>
              <h4 className="text-white font-extrabold text-base">System Administrator</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Oversee entire operations. Verify or suspend drivers instantly, allocate commuter balance buffers, inspect secure background system logs, and control intrastate surge configurations.
              </p>
              <ul className="space-y-2 text-zinc-500 text-xs pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Background Audit Trail logs</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Fleet dynamic verification switches</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Multi-factor account creations</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* HELP & FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto py-16 px-6 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">QUESTIONS & ANSWERS</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Help Desk
          </h3>
          <p className="text-zinc-400 text-xs">
            Learn more about the state workspace features, booking mechanisms, and administrative audit procedures.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className="bg-zinc-900/60 border border-zinc-850 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between text-xs font-bold text-white hover:text-emerald-400 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={15} className={`transition-all ${isOpen ? 'text-emerald-400 rotate-180' : 'text-zinc-500'}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-zinc-400 text-xs leading-relaxed border-t border-zinc-850/50 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPACT FOOTER WITH LEGAL LINKS & ACKNOWLEDGEMENTS */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="bg-white text-zinc-950 w-8 h-8 rounded-xl flex items-center justify-center font-black tracking-tighter text-lg">
              U
            </div>
            <div>
              <span className="text-white font-extrabold text-xs block">Uber Nigeria</span>
              <span className="text-zinc-500 text-[9px] uppercase font-mono block">
                © 2026 NIGERIAN FEDERAL TRANSIT AUTHORITY
              </span>
            </div>
          </div>

          {/* Legal and Support Links */}
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-zinc-500">
            <button 
              onClick={() => setLegalModalType('tos')} 
              className="hover:text-white transition cursor-pointer"
              id="link-tos"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => setLegalModalType('privacy')} 
              className="hover:text-white transition cursor-pointer"
              id="link-privacy"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setLegalModalType('safety')} 
              className="hover:text-white transition cursor-pointer"
              id="link-safety"
            >
              Safety Guidelines
            </button>
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-400 font-mono flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" />
              SECURE BLUEPRINT v2.5
            </span>
          </div>

        </div>
      </footer>


      {/* DYNAMIC SIGN IN / REGISTRATION OVERLAY PORTAL */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              id="auth-modal-panel"
            >
              {/* Header tab choice */}
              <div className="bg-zinc-950 border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-emerald-400" />
                  <span className="text-xs uppercase font-extrabold text-white tracking-widest">
                    Authentication Hub
                  </span>
                </div>
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="text-zinc-500 hover:text-white text-xs font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Role Switches */}
              <div className="grid grid-cols-3 bg-zinc-950/40 border-b border-zinc-800/80 p-2 gap-1 text-center">
                <button
                  type="button"
                  onClick={() => selectLoginRole('rider')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    loginRole === 'rider'
                      ? 'bg-white text-zinc-950 font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                  id="auth-role-rider"
                >
                  <User size={13} />
                  Passenger
                </button>
                <button
                  type="button"
                  onClick={() => selectLoginRole('driver')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    loginRole === 'driver'
                      ? 'bg-white text-zinc-950 font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                  id="auth-role-driver"
                >
                  <Car size={13} />
                  Driver
                </button>
                <button
                  type="button"
                  onClick={() => selectLoginRole('admin')}
                  className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    loginRole === 'admin'
                      ? 'bg-white text-zinc-950 font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                  id="auth-role-admin"
                >
                  <ShieldCheck size={13} />
                  Admin
                </button>
              </div>

              {/* Inner Auth Workspace */}
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                
                {/* Mode Selector Tab (Sign In / Register) */}
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-zinc-900 text-white border border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Quick Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-zinc-900 text-white border border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Create Simulated Profile
                  </button>
                </div>

                {/* SIGN IN FORM (Using Presets) */}
                {authMode === 'signin' ? (
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Select Sandbox Credentials
                      </label>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {loginRole === 'rider' && passengers.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePresetSelect(p.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                              selectedPresetId === p.id || (!selectedPresetId && p.id === passengers[0]?.id)
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                                : 'bg-zinc-950/60 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                              <div>
                                <span className="block text-xs font-bold text-white">{p.name}</span>
                                <span className="block text-[9px] opacity-75">{p.email || `${p.name.replace(/\s+/g, '').toLowerCase()}@transit.ng`}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block font-mono text-xs font-black text-emerald-400">₦{p.balance.toLocaleString()}</span>
                              <span className="block text-[9px] opacity-75">Commuter</span>
                            </div>
                          </button>
                        ))}

                        {loginRole === 'driver' && drivers.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handlePresetSelect(d.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                              selectedPresetId === d.id || (!selectedPresetId && d.id === drivers[0]?.id)
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                                : 'bg-zinc-950/60 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={d.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                              <div>
                                <span className="block text-xs font-bold text-white">{d.name}</span>
                                <span className="block text-[9px] opacity-75">{d.vehicleName} • [{d.plateNumber}]</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold font-mono text-white">★ {d.rating}</span>
                              <span className="block text-[9px] opacity-75">{d.vehicleType} Tier</span>
                            </div>
                          </button>
                        ))}

                        {loginRole === 'admin' && admins.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handlePresetSelect(a.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                              selectedPresetId === a.id || (!selectedPresetId && a.id === admins[0]?.id)
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                                : 'bg-zinc-950/60 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={a.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                              <div>
                                <span className="block text-xs font-bold text-white">{a.name}</span>
                                <span className="block text-[9px] opacity-75">{a.email}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] uppercase font-bold text-emerald-400">{a.role}</span>
                              <span className="block text-[9px] opacity-75">{a.actionsCount} actions</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      id="submit-auth-signin"
                    >
                      <LogIn size={14} />
                      Unseal & Launch Portal
                    </button>
                  </form>
                ) : (
                  
                  /* REGISTRATION / SIGN UP FORM */
                  <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 gap-4">
                      
                      {/* Name field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aminu Kano Gusau"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Phone Number and Email Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Phone Contact</label>
                          <input
                            type="tel"
                            placeholder="+234 803 000 0000"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Email Address</label>
                          <input
                            type="email"
                            placeholder="username@transit.ng"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Rider Specific: Starting balance */}
                      {loginRole === 'rider' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Initial Commuter Balance (₦)</label>
                          <select
                            value={regBalance}
                            onChange={(e) => setRegBalance(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                          >
                            <option value="5000">₦5,000 (Local commute buffer)</option>
                            <option value="15000">₦15,000 (Comfortable cruiser)</option>
                            <option value="50000">₦50,000 (Executive commuter)</option>
                            <option value="150000">₦150,000 (VIP Unlimited)</option>
                          </select>
                        </div>
                      )}

                      {/* Driver Specific: Vehicle setup */}
                      {loginRole === 'driver' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Vehicle Model</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Silver Honda Accord"
                                value={regVehicleModel}
                                onChange={(e) => setRegVehicleModel(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">License Plate</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. ZMF-882-GSU"
                                value={regPlate}
                                onChange={(e) => setRegPlate(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-white outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Select Dispatch Category</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {VEHICLE_CONFIGS.map(v => (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => setRegVehicleType(v.id)}
                                  className={`p-2.5 rounded-lg border text-center font-bold text-[10px] transition cursor-pointer ${
                                    regVehicleType === v.id
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                                      : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-800'
                                  }`}
                                >
                                  {v.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                      id="submit-auth-signup"
                    >
                      <UserPlus size={14} />
                      Create Simulated Profile & Enter Console
                    </button>
                  </form>
                )}

                {/* Subtext warning */}
                <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                  By connecting, you authorize the simulated node container to load profile balances, calibrate mock GPS coords, and dispatch en-route logs. Check our <button onClick={() => { setIsLoginOpen(false); setLegalModalType('tos'); }} className="text-emerald-500 hover:underline">Terms</button> and <button onClick={() => { setIsLoginOpen(false); setLegalModalType('privacy'); }} className="text-emerald-500 hover:underline">Privacy Policies</button>.
                </p>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEGAL / DOCUMENTATION MODAL POPUP */}
      <AnimatePresence>
        {legalModalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalModalType(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  {legalModalType === 'tos' ? 'Terms of Service Framework' : legalModalType === 'privacy' ? 'Data Privacy & Security Protocols' : 'Commuter Safety Guidelines'}
                </h4>
                <button 
                  onClick={() => setLegalModalType(null)}
                  className="text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl transition text-xs font-mono cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 text-xs text-zinc-400 leading-relaxed pr-2">
                {legalModalType === 'tos' && (
                  <>
                    <p className="font-bold text-white text-sm">1. Terms of the Simulation</p>
                    <p>Welcome to the Nigeria Ride-Sharing Operations Simulator. By entering our simulated console workspace, you agree to comply with the protocols set forth herein. All balances are fully simulated and do not correspond to physical fiat assets.</p>
                    <p className="font-bold text-white text-sm">2. Account Balances & Crediting</p>
                    <p>Commuters are credited with starting balance tokens (ranging from ₦5,000 to ₦150,000) for testing fare-calculation accuracy across different vehicle multipliers. These cannot be redeemed or traded outside this container environment.</p>
                    <p className="font-bold text-white text-sm">3. Dispatch Authority</p>
                    <p>The system retains authority to match any requested origin/destination pin point within the boundaries of Lagos, Abuja, Port Harcourt, Kano, Enugu, Gusau, Kaduna, Sokoto, Kebbi, Katsina, Niger, Nasarawa, Jigawa, Gombe, Borno, Adamawa, and Yobe to available en-route drivers in order to sustain active dispatch queues.</p>
                  </>
                )}

                {legalModalType === 'privacy' && (
                  <>
                    <p className="font-bold text-white text-sm">1. Coordinate Collection Policies</p>
                    <p>We process mock geographic coordinate data (including exact latitude and longitude pin selectors) inside the browser's `localStorage` buffer to ensure instant persistent state loads during successive turns.</p>
                    <p className="font-bold text-white text-sm">2. Chat Dialog Retention</p>
                    <p>To simulate realistic driver-rider interactions, en-route chat logs are cached locally in state variables. No personal dialogue is routed to external servers or marketing data grids.</p>
                    <p className="font-bold text-white text-sm">3. LocalStorage Sanitization</p>
                    <p>Users may fully sanitize, clear, or reset all credentials, histories, balances, and driver en-route sequences at any time by navigating to the Settings panel inside the main console.</p>
                  </>
                )}

                {legalModalType === 'safety' && (
                  <>
                    <p className="font-bold text-white text-sm">1. Driver Verification Protocols</p>
                    <p>Every en-route driver undergoes strict background simulation checks. Drivers carry verified digital credentials and explicit vehicle metadata parameters (plate registration, vehicle status) to ensure reliable urban dispatching.</p>
                    <p className="font-bold text-white text-sm">2. Surge Switch Emergency Management</p>
                    <p>In cases of simulated extreme road blockages or weather, the central console permits super administrators to engage the Surge Switch, allowing instant dispatching priority adjustments and safety alerts.</p>
                    <p className="font-bold text-white text-sm">3. Simulated Help Desks</p>
                    <p>Active en-route chat provides a direct lifeline to en-route drivers to communicate parking directions, landmark adjustments, or dispatch updates safely and efficiently.</p>
                  </>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-4 text-right">
                <button 
                  onClick={() => setLegalModalType(null)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition text-xs cursor-pointer"
                >
                  I Understand & Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
