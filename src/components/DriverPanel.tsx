import React, { useState, useEffect } from 'react';
import VoiceCallModal from './VoiceCallModal';
import { UserProfile, Location, Trip } from '../types';
import { MOCK_PASSENGERS } from '../data';
import {
  Car,
  Check,
  Navigation,
  X,
  TrendingUp,
  MapPin,
  Clock,
  Award,
  CircleCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Phone,
  MessageSquare,
  Send
} from 'lucide-react';

interface DriverPanelProps {
  city: {
    name: string;
    landmarks: { lat: number; lng: number; label: string }[];
  };
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  driverPosition: { lat: number; lng: number } | null;
  setDriverPosition: (pos: { lat: number; lng: number } | null) => void;
  onAcceptTripByDriver: (tripDetails: {
    id: string;
    passengerName: string;
    passengerAvatar: string;
    passengerRating: number;
    origin: Location;
    destination: Location;
    price: number;
    distance: number;
    duration: number;
  }) => void;
  existingTrip?: Trip | null;
  setExistingTrip?: React.Dispatch<React.SetStateAction<Trip | null>>;
  isDriverOnline?: boolean;
  setIsDriverOnline?: (online: boolean) => void;
}

interface SimulatedOffer {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  origin: Location;
  destination: Location;
  price: number;
  distance: number;
  duration: number;
  countdown: number;
}

export default function DriverPanel({
  city,
  profile,
  setProfile,
  driverPosition,
  setDriverPosition,
  onAcceptTripByDriver,
  existingTrip,
  setExistingTrip,
  isDriverOnline,
  setIsDriverOnline,
}: DriverPanelProps) {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [activeOffer, setActiveOffer] = useState<SimulatedOffer | null>(null);
  const [driverState, setDriverState] = useState<'IDLE' | 'PICKING_UP' | 'WAITING_PASSENGER' | 'DRIVING' | 'SUCCESS'>('IDLE');
  const [activeTrip, setActiveTrip] = useState<SimulatedOffer | null>(null);
  const [driveProgress, setDriveProgress] = useState<number>(0);
  const [recentEarnings, setRecentEarnings] = useState<number>(0);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState<boolean>(false);
  const [showDriverChat, setShowDriverChat] = useState<boolean>(false);
  const [driverChatInput, setDriverChatInput] = useState<string>('');
  const [driverMessages, setDriverMessages] = useState<Array<{ id: string; sender: 'driver' | 'rider'; text: string; time: string }>>([
    { id: '1', sender: 'rider', text: "Hello driver, I'm waiting at the pickup spot!", time: 'Just now' }
  ]);

  // Synchronize isOnline state with parent App.tsx so it knows a driver is online
  useEffect(() => {
    if (setIsDriverOnline) {
      setIsDriverOnline(isOnline);
    }
    return () => {
      if (setIsDriverOnline) {
        setIsDriverOnline(false);
      }
    };
  }, [isOnline, setIsDriverOnline]);

  // Synchronize state with existingTrip from parent App.tsx if it exists
  useEffect(() => {
    if (!existingTrip) {
      // If parent trip is cleared, reset driver to IDLE if we were in a synchronized trip
      if (activeTrip && !activeTrip.id.startsWith('simulated-random')) {
        setActiveTrip(null);
        setDriverState('IDLE');
        setDriveProgress(0);
      }
      return;
    }

    // Check if the trip belongs to this driver or if we accepted it
    if (existingTrip.driver && existingTrip.driver.name === profile.name) {
      const mappedTrip: SimulatedOffer = {
        id: existingTrip.id,
        passengerName: existingTrip.passengerName || 'Ashiru Shehu',
        passengerAvatar: existingTrip.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        passengerRating: existingTrip.passengerRating || 4.9,
        origin: existingTrip.origin,
        destination: existingTrip.destination,
        price: existingTrip.price,
        distance: existingTrip.distanceMiles,
        duration: existingTrip.durationMinutes,
        countdown: 0,
      };

      setActiveTrip(mappedTrip);
      setDriveProgress(existingTrip.progress || 0);
      setDriverPosition(existingTrip.currentPosition || null);

      if (existingTrip.status === 'ACCEPTED' || existingTrip.status === 'PICKING_UP') {
        setDriverState('PICKING_UP');
      } else if (existingTrip.status === 'ARRIVED') {
        setDriverState('WAITING_PASSENGER');
      } else if (existingTrip.status === 'TRIP_IN_PROGRESS') {
        setDriverState('DRIVING');
      } else if (existingTrip.status === 'COMPLETED') {
        setDriverState('SUCCESS');
      }
    }
  }, [existingTrip, profile.name]);

  // 1. Detect Existing Trip or Simulate Incoming Ride Offers (when online and idle)
  useEffect(() => {
    if (!isOnline || driverState !== 'IDLE' || activeTrip) return;

    // A. Detect existing trip with SEARCHING status
    if (existingTrip && existingTrip.status === 'SEARCHING') {
      if (activeOffer?.id === existingTrip.id) return;

      const newOffer: SimulatedOffer = {
        id: existingTrip.id,
        passengerName: existingTrip.passengerName || 'Ashiru Shehu',
        passengerAvatar: existingTrip.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        passengerRating: existingTrip.passengerRating || 4.9,
        origin: existingTrip.origin,
        destination: existingTrip.destination,
        price: existingTrip.price,
        distance: existingTrip.distanceMiles,
        duration: existingTrip.durationMinutes,
        countdown: 30, // giving driver 30 seconds to accept
      };
      setActiveOffer(newOffer);
      return;
    }

    // B. Clear existing-trip offer if status is no longer SEARCHING (e.g. cancelled)
    if (activeOffer && existingTrip && activeOffer.id === existingTrip.id && existingTrip.status !== 'SEARCHING') {
      setActiveOffer(null);
      return;
    }

    // If activeOffer is already present (whether existing trip or simulated), do not start simulation interval
    if (activeOffer) return;

    // C. Fallback: Ping simulated offer every 15 seconds if no real trip request is active
    const interval = setInterval(() => {
      // Pick random passenger
      const passenger = MOCK_PASSENGERS[Math.floor(Math.random() * MOCK_PASSENGERS.length)];

      // Pick random pickup and dropoff landmarks
      const lms = [...city.landmarks];
      if (lms.length < 2) return;
      const originIndex = Math.floor(Math.random() * lms.length);
      let destIndex = Math.floor(Math.random() * lms.length);
      while (destIndex === originIndex) {
        destIndex = Math.floor(Math.random() * lms.length);
      }

      const orig = lms[originIndex];
      const dest = lms[destIndex];

      const originLoc: Location = { lat: orig.lat, lng: orig.lng, label: orig.label };
      const destLoc: Location = { lat: dest.lat, lng: dest.lng, label: dest.label };

      // Calculate simple stats
      const distance = parseFloat((Math.hypot(dest.lat - orig.lat, dest.lng - orig.lng) * 60).toFixed(1));
      const duration = Math.round(distance * 1.6 + 2);
      // Driver gets 80% of fare
      const customerPrice = (4.5 + distance * 1.8) * 300;
      const driverFare = parseFloat((customerPrice * 0.8).toFixed(2));

      const newOffer: SimulatedOffer = {
        id: 'simulated-random-' + Math.random().toString(36).substr(2, 5),
        passengerName: passenger.name,
        passengerAvatar: passenger.avatar,
        passengerRating: passenger.rating,
        origin: originLoc,
        destination: destLoc,
        price: driverFare,
        distance,
        duration,
        countdown: 15,
      };

      setActiveOffer(newOffer);
    }, 15000);

    return () => clearInterval(interval);
  }, [isOnline, activeOffer, activeTrip, driverState, city, existingTrip]);

  // 2. Countdown Timer for active offer
  useEffect(() => {
    if (!activeOffer) return;

    const timer = setInterval(() => {
      setActiveOffer((prev) => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          // Offer expired
          return null;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOffer]);

  // 3. Simulated Vehicle Drive (Tick Progress)
  useEffect(() => {
    // Only run local simulated drive if this is NOT a synchronized existingTrip
    if (existingTrip && activeTrip && existingTrip.id === activeTrip.id) return;

    if (driverState !== 'PICKING_UP' && driverState !== 'DRIVING') return;

    const driveInterval = setInterval(() => {
      setDriveProgress((prev) => {
        const next = prev + 0.1;
        if (next >= 1.0) {
          clearInterval(driveInterval);

          // Transition to next step
          if (driverState === 'PICKING_UP') {
            setDriverState('WAITING_PASSENGER');
            setDriverPosition(activeTrip!.origin);
          } else if (driverState === 'DRIVING') {
            setDriverState('SUCCESS');
            setDriverPosition(activeTrip!.destination);
          }
          return 1.0;
        }

        // Interpolate coordinates for visual map movement
        if (activeTrip) {
          const start = driverState === 'PICKING_UP' ? city.landmarks[0] : activeTrip.origin; // approximate start
          const end = driverState === 'PICKING_UP' ? activeTrip.origin : activeTrip.destination;
          const currentLat = start.lat + (end.lat - start.lat) * next;
          const currentLng = start.lng + (end.lng - start.lng) * next;
          setDriverPosition({ lat: currentLat, lng: currentLng });
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(driveInterval);
  }, [driverState, activeTrip, existingTrip]);

  // Go Online/Offline
  const handleToggleOnline = () => {
    if (isOnline) {
      setIsOnline(false);
      setActiveOffer(null);
      setActiveTrip(null);
      setDriverState('IDLE');
      setDriverPosition(null);
    } else {
      setIsOnline(true);
      // Position vehicle at city center initially
      setDriverPosition(city.landmarks[0] || null);
    }
  };

  const handleAcceptOffer = () => {
    if (!activeOffer) return;
    
    onAcceptTripByDriver({
      id: activeOffer.id,
      passengerName: activeOffer.passengerName,
      passengerAvatar: activeOffer.passengerAvatar,
      passengerRating: activeOffer.passengerRating,
      origin: activeOffer.origin,
      destination: activeOffer.destination,
      price: activeOffer.price,
      distance: activeOffer.distance,
      duration: activeOffer.duration,
    });

    const trip = activeOffer;
    setActiveOffer(null);
    setActiveTrip(trip);
    setDriverState('PICKING_UP');
    setDriveProgress(0);
    // Position vehicle at start of route
    setDriverPosition(city.landmarks[0] || null);
  };

  const handleDeclineOffer = () => {
    setActiveOffer(null);
  };

  const handleStartRide = () => {
    if (!activeTrip) return;
    setDriverState('DRIVING');
    setDriveProgress(0);
    setDriverPosition(activeTrip.origin);
  };

  const handleCompletePayout = () => {
    if (!activeTrip) return;

    // Add trip value to user balance
    setProfile((prev) => ({
      ...prev,
      balance: parseFloat((prev.balance + activeTrip.price).toFixed(2)),
    }));
    setRecentEarnings(activeTrip.price);

    // Clear parent trip if synchronized
    if (existingTrip && existingTrip.id === activeTrip.id) {
      if (setExistingTrip) {
        setExistingTrip(null);
      }
    }

    setActiveTrip(null);
    setDriverState('SUCCESS');
  };

  const handleResetToIdle = () => {
    setDriverState('IDLE');
    setRecentEarnings(0);
    setDriverPosition(city.landmarks[0] || null);
    if (existingTrip && setExistingTrip) {
      setExistingTrip(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-[#E5DFD3] max-h-[85vh] lg:max-h-[90vh]">
      {/* HEADER */}
      <div className="p-4 bg-[#FAF7F2] text-zinc-900 flex items-center justify-between border-b border-[#E5DFD3]">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-700 text-white px-2 py-1 rounded-lg font-black tracking-tight text-xs uppercase shadow-xs">
            ZamTaxi
          </div>
          <span className="font-bold text-zinc-900">Driver Console</span>
        </div>

        {/* Online Badge status */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#E5DFD3] shadow-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {/* ONLINE/OFFLINE RADAR ACTUATOR */}
        {driverState === 'IDLE' && (
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={handleToggleOnline}
              className={`w-full py-4 rounded-xl font-extrabold text-sm tracking-wide text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isOnline ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
              id="driver-online-offline-toggle"
            >
              {isOnline ? (
                <>
                  <X size={16} /> Go Offline
                </>
              ) : (
                <>
                  <Play size={16} className="fill-white" /> Go Online to Earn
                </>
              )}
            </button>
          </div>
        )}

        {/* earnings overview */}
        {driverState === 'IDLE' && (
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Earnings Overview</span>
              <TrendingUp size={16} className="text-emerald-700" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-xl border border-[#E5DFD3] shadow-xs">
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Total Balance</div>
                <div className="text-xl font-extrabold text-zinc-900">₦{profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E5DFD3] shadow-xs">
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Your Rating</div>
                <div className="text-xl font-extrabold text-zinc-900 flex items-center gap-1">
                  {profile.rating.toFixed(2)}
                  <Star size={16} className="text-amber-500 fill-amber-500 inline" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STATE A: WAITING FOR OFFERS RADAR
           ========================================== */}
        {isOnline && driverState === 'IDLE' && !activeOffer && (
          <div className="py-12 border-2 border-dashed border-[#E5DFD3] bg-[#FAF7F2]/60 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="absolute w-16 h-16 rounded-full border-2 border-emerald-600 animate-ping opacity-25" />
              <div className="bg-emerald-700 text-white p-4 rounded-full shadow-md">
                <Navigation size={28} className="animate-pulse transform rotate-45" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-zinc-900">Radar Scanning...</h4>
              <p className="text-xs text-zinc-600 font-medium max-w-[200px] mx-auto">
                Waiting for nearby passenger ride pings. Ensure you remain online.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            STATE B: NEW OFFER DETECTED (PING)
           ========================================== */}
        {activeOffer && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-4 animate-pulse relative overflow-hidden shadow-md">
            {/* Header banner */}
            <div className="flex justify-between items-center">
              <span className="bg-amber-400 text-zinc-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="fill-zinc-950" />
                New Ride Offer
              </span>
              {/* Circular countdown counter */}
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-xs font-extrabold text-amber-900 bg-white shadow-xs">
                {activeOffer.countdown}
              </div>
            </div>

            {/* Passenger Credentials */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E5DFD3] shadow-xs">
              <img
                src={activeOffer.passengerAvatar}
                alt={activeOffer.passengerName}
                className="w-11 h-11 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-zinc-900 truncate">{activeOffer.passengerName}</h4>
                <div className="flex items-center gap-1 text-xs text-zinc-600 font-semibold">
                  <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span>{activeOffer.passengerRating.toFixed(1)} rating</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Estimated Payout</div>
                <div className="text-lg font-extrabold text-emerald-700">₦{activeOffer.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Route details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-600 block text-[10px] uppercase tracking-wider">PICK UP</span>
                  <p className="font-extrabold text-zinc-900">{activeOffer.origin.label}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-600 block text-[10px] uppercase tracking-wider">DROP OFF</span>
                  <p className="font-extrabold text-zinc-900">{activeOffer.destination.label}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-[#E5DFD3]">
                <span className="text-zinc-600 block text-[9px] font-bold uppercase">Distance</span>
                <span className="font-extrabold text-zinc-900">{activeOffer.distance} km</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E5DFD3]">
                <span className="text-zinc-600 block text-[9px] font-bold uppercase">Estimated Duration</span>
                <span className="font-extrabold text-zinc-900">{activeOffer.duration} mins</span>
              </div>
            </div>

            {/* Accept / Decline Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                onClick={handleDeclineOffer}
                className="py-3 bg-white border border-[#E5DFD3] hover:bg-[#FAF7F2] text-zinc-800 font-extrabold rounded-xl text-xs transition cursor-pointer"
                id="driver-decline-offer-btn"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptOffer}
                className="py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
                id="driver-accept-offer-btn"
              >
                <Check size={14} /> Accept Offer
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            STATE C: DRIVER NAVIGATION & ROUTE GUIDES
           ========================================== */}
        {activeTrip && (
          <div className="space-y-4">
            {/* Nav Banner header */}
            <div className="bg-zinc-900 text-white p-3.5 rounded-xl border border-zinc-800 flex items-center gap-3">
              <Navigation size={22} className="text-emerald-400 animate-pulse shrink-0 transform rotate-45" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Navigation Guide</span>
                <p className="font-bold text-xs truncate text-zinc-100">
                  {driverState === 'PICKING_UP' && `Driving to pick up ${activeTrip.passengerName}`}
                  {driverState === 'WAITING_PASSENGER' && `Arrived! Waiting for ${activeTrip.passengerName} to enter`}
                  {driverState === 'DRIVING' && `Navigating to ${activeTrip.destination.label}`}
                </p>
              </div>
            </div>

            {/* Route Map Card */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DFD3] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-wider">Active Leg progress</span>
                <span className="font-extrabold text-zinc-900">{Math.round(driveProgress * 100)}% Complete</span>
              </div>

              {/* simulated route indicator */}
              <div className="w-full bg-[#F2EDE4] rounded-full h-2.5 overflow-hidden border border-[#E5DFD3]">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${driveProgress * 100}%` }}
                />
              </div>

              <div className="space-y-2 text-xs pt-1.5 border-t border-[#E5DFD3]">
                <div className="flex justify-between">
                  <span className="text-zinc-600 font-medium">Destination:</span>
                  <span className="font-extrabold text-zinc-900">
                    {driverState === 'PICKING_UP' ? activeTrip.origin.label : activeTrip.destination.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 font-medium">Payout:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">₦{activeTrip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Passenger Contact & Communication Card */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E5DFD3] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeTrip.passengerAvatar}
                    alt={activeTrip.passengerName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5DFD3]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-extrabold text-xs text-zinc-900">{activeTrip.passengerName}</h5>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-600 font-semibold">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>{activeTrip.passengerRating.toFixed(1)} Passenger</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDriverChat(!showDriverChat)}
                    className="p-2 bg-white hover:bg-zinc-100 border border-[#E5DFD3] rounded-lg text-zinc-900 transition cursor-pointer"
                    title="Chat Passenger"
                    id="driver-chat-passenger-btn"
                  >
                    <MessageSquare size={15} />
                  </button>
                  <button
                    onClick={() => setIsVoiceCallOpen(true)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    id="driver-call-passenger-btn"
                  >
                    <Phone size={13} /> Call Passenger
                  </button>
                </div>
              </div>

              {/* Driver-Passenger Chat Box */}
              {showDriverChat && (
                <div className="bg-white rounded-xl border border-[#E5DFD3] overflow-hidden text-xs space-y-2 p-3 mt-2 shadow-sm">
                  <div className="flex items-center justify-between font-bold border-b border-zinc-100 pb-1.5 text-zinc-800">
                    <span>Chatting with {activeTrip.passengerName}</span>
                    <button onClick={() => setShowDriverChat(false)} className="text-zinc-400 hover:text-zinc-900">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 py-1">
                    {driverMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.sender === 'driver' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                            m.sender === 'driver'
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Driver Quick Reply Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                    {[
                      "I've arrived at pickup point 📍",
                      "I'm in traffic, 2 mins away ⏱️",
                      "Where are you standing? 🔍",
                      "I'm outside in the blue car 🚘"
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDriverMessages((prev) => [
                            ...prev,
                            { id: Date.now().toString(), sender: 'driver', text: pill, time: 'Just now' }
                          ]);
                        }}
                        className="shrink-0 px-2 py-0.5 bg-zinc-50 hover:bg-zinc-200 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-700"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!driverChatInput.trim()) return;
                      setDriverMessages((prev) => [
                        ...prev,
                        { id: Date.now().toString(), sender: 'driver', text: driverChatInput.trim(), time: 'Just now' }
                      ]);
                      setDriverChatInput('');
                    }}
                    className="flex gap-1.5 pt-1"
                  >
                    <input
                      type="text"
                      placeholder="Type reply..."
                      value={driverChatInput}
                      onChange={(e) => setDriverChatInput(e.target.value)}
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-[11px] outline-none font-medium"
                    />
                    <button type="submit" className="bg-zinc-900 text-white px-2.5 py-1 rounded-lg text-xs">
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Drive Simulation controller - Manual steps or Auto-Tick triggers */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] text-center space-y-3">
              <h4 className="text-xs font-extrabold text-zinc-900">Trip Progression Trigger</h4>
              <p className="text-[11px] text-zinc-600 font-medium max-w-[200px] mx-auto">
                In this simulator, drive times are condensed. Auto-drive progress updates coordinate movements.
              </p>

              {driverState === 'WAITING_PASSENGER' && (
                <button
                  onClick={handleStartRide}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  id="driver-start-trip-btn"
                >
                  <Car size={14} /> Passenger Onboard - Start Ride
                </button>
              )}

              {driverState === 'DRIVING' && driveProgress >= 1.0 && (
                <button
                  onClick={handleCompletePayout}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md animate-bounce"
                  id="driver-complete-trip-btn"
                >
                  <CircleCheck size={14} /> Arrived - Complete Ride & Collect Payout
                </button>
              )}

              {(driverState === 'PICKING_UP' || driverState === 'DRIVING') && (
                <div className="text-xs text-zinc-700 font-bold flex items-center justify-center gap-1 font-mono py-1.5 bg-white rounded-lg border border-[#E5DFD3]">
                  <Clock size={12} className="animate-spin text-emerald-600" />
                  <span>GPS Auto-driving vehicle...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            STATE D: TRIP SUCCESS & PAYOUT SUMMARY
           ========================================== */}
        {driverState === 'SUCCESS' && recentEarnings > 0 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-xs animate-bounce">
              <CircleCheck size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-zinc-900">Trip Completed!</h3>
              <p className="text-xs text-zinc-600 font-medium">
                You safely deposited the passenger. Payout processed successfully.
              </p>
            </div>

            {/* Receipt receipt statement */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] space-y-2.5 max-w-[280px] mx-auto text-left text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600 font-medium">Net Fare Payout:</span>
                <span className="font-extrabold text-zinc-900">₦{recentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 font-medium">Service Fee cut (0% promotional):</span>
                <span className="font-extrabold text-zinc-500">-₦0.00</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-[#E5DFD3]">
                <span className="font-bold text-zinc-800">Total Transferred:</span>
                <span className="font-extrabold text-emerald-700 text-sm">₦{recentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={handleResetToIdle}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              id="driver-payout-dismiss-btn"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#FAF7F2] p-2.5 text-center text-[10px] text-zinc-600 border-t border-[#E5DFD3] flex items-center justify-center gap-1 font-mono font-semibold">
        <span>Instant Cashout synced with Stripe Express</span>
      </div>

      {/* Driver VoIP Call Modal */}
      {activeTrip && (
        <VoiceCallModal
          isOpen={isVoiceCallOpen}
          onClose={() => setIsVoiceCallOpen(false)}
          callerName={activeTrip.passengerName}
          callerAvatar={activeTrip.passengerAvatar}
          callerRole="Passenger"
          phoneNumber="+234 803 123 4567"
          onSendQuickChat={(txt) => {
            setDriverMessages((prev) => [
              ...prev,
              { id: Date.now().toString(), sender: 'driver', text: txt, time: 'Just now' }
            ]);
            setShowDriverChat(true);
          }}
        />
      )}
    </div>
  );
}
