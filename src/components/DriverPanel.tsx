import React, { useState, useEffect } from 'react';
import { UserProfile, Location } from '../types';
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
  Star
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
}: DriverPanelProps) {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [activeOffer, setActiveOffer] = useState<SimulatedOffer | null>(null);
  const [driverState, setDriverState] = useState<'IDLE' | 'PICKING_UP' | 'WAITING_PASSENGER' | 'DRIVING' | 'SUCCESS'>('IDLE');
  const [activeTrip, setActiveTrip] = useState<SimulatedOffer | null>(null);
  const [driveProgress, setDriveProgress] = useState<number>(0);
  const [recentEarnings, setRecentEarnings] = useState<number>(0);

  // 1. Simulate Incoming Ride Offers (when online and idle)
  useEffect(() => {
    if (!isOnline || activeOffer || activeTrip || driverState !== 'IDLE') return;

    // Ping an offer every 10 to 15 seconds
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
      // Driver gets 80% of fare (20% Uber cut)
      const customerPrice = (4.5 + distance * 1.8) * 300;
      const driverFare = parseFloat((customerPrice * 0.8).toFixed(2));

      const newOffer: SimulatedOffer = {
        id: Math.random().toString(36).substr(2, 9),
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
    }, 8000);

    return () => clearInterval(interval);
  }, [isOnline, activeOffer, activeTrip, driverState, city]);

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
  }, [driverState, activeTrip]);

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
    setActiveTrip(null);
    setDriverState('SUCCESS');
  };

  const handleResetToIdle = () => {
    setDriverState('IDLE');
    setRecentEarnings(0);
    setDriverPosition(city.landmarks[0] || null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[85vh] lg:max-h-[90vh]">
      {/* HEADER */}
      <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="bg-white text-black p-1.5 rounded-lg font-black tracking-tighter text-sm">
            Uber
          </div>
          <span className="font-semibold text-zinc-200">Driver Console</span>
        </div>

        {/* Online Badge status */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ONLINE/OFFLINE RADAR ACTUATOR */}
        {driverState === 'IDLE' && (
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={handleToggleOnline}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isOnline ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
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
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Earnings Overview</span>
              <TrendingUp size={16} className="text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Balance</div>
                <div className="text-xl font-black text-zinc-900">${profile.balance.toFixed(2)}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Your Rating</div>
                <div className="text-xl font-black text-zinc-900 flex items-center gap-1">
                  {profile.rating.toFixed(2)}
                  <Star size={16} className="text-yellow-400 fill-yellow-400 inline" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STATE A: WAITING FOR OFFERS RADAR
           ========================================== */}
        {isOnline && driverState === 'IDLE' && !activeOffer && (
          <div className="py-12 border-2 border-dashed border-zinc-150 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="absolute w-16 h-16 rounded-full border-2 border-zinc-950 animate-ping opacity-25" />
              <div className="bg-zinc-900 text-white p-4 rounded-full shadow-lg">
                <Navigation size={28} className="animate-pulse transform rotate-45" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-800">Radar Scanning...</h4>
              <p className="text-xs text-zinc-400 max-w-[200px] mx-auto">
                Waiting for nearby passenger ride pings. Ensure you remain online.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            STATE B: NEW OFFER DETECTED (PING)
           ========================================== */}
        {activeOffer && (
          <div className="bg-amber-500/10 border-2 border-amber-300 rounded-2xl p-4 space-y-4 animate-pulse relative overflow-hidden shadow-lg">
            {/* Header banner */}
            <div className="flex justify-between items-center">
              <span className="bg-amber-400 text-zinc-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="fill-zinc-950" />
                New Ride Offer
              </span>
              {/* Circular countdown counter */}
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-xs font-extrabold text-amber-700 bg-white shadow-sm">
                {activeOffer.countdown}
              </div>
            </div>

            {/* Passenger Credentials */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-100">
              <img
                src={activeOffer.passengerAvatar}
                alt={activeOffer.passengerName}
                className="w-11 h-11 rounded-full object-cover shrink-0 referrer-policy-no-referrer"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-zinc-800 truncate">{activeOffer.passengerName}</h4>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
                  <span>{activeOffer.passengerRating.toFixed(1)} rating</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Estimated Payout</div>
                <div className="text-lg font-black text-emerald-600">₦{activeOffer.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Route details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-500 block text-[10px] uppercase tracking-wider">PICK UP</span>
                  <p className="font-bold text-zinc-800">{activeOffer.origin.label}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-500 block text-[10px] uppercase tracking-wider">DROP OFF</span>
                  <p className="font-bold text-zinc-800">{activeOffer.destination.label}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-zinc-100">
                <span className="text-zinc-400 block text-[9px] font-bold uppercase">Distance</span>
                <span className="font-bold text-zinc-800">{activeOffer.distance} km</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-zinc-100">
                <span className="text-zinc-400 block text-[9px] font-bold uppercase">Estimated Duration</span>
                <span className="font-bold text-zinc-800">{activeOffer.duration} mins</span>
              </div>
            </div>

            {/* Accept / Decline Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                onClick={handleDeclineOffer}
                className="py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition cursor-pointer"
                id="driver-decline-offer-btn"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptOffer}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer"
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
            <div className="bg-zinc-950 text-white p-3.5 rounded-xl border border-zinc-800 flex items-center gap-3">
              <Navigation size={22} className="text-blue-400 animate-pulse shrink-0 transform rotate-45" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Navigation Guide</span>
                <p className="font-semibold text-xs truncate">
                  {driverState === 'PICKING_UP' && `Driving to pick up ${activeTrip.passengerName}`}
                  {driverState === 'WAITING_PASSENGER' && `Arrived! Waiting for ${activeTrip.passengerName} to enter`}
                  {driverState === 'DRIVING' && `Navigating to ${activeTrip.destination.label}`}
                </p>
              </div>
            </div>

            {/* Route Map Card */}
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-150 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Active Leg progress</span>
                <span className="font-bold text-zinc-800">{Math.round(driveProgress * 100)}% Complete</span>
              </div>

              {/* simulated route indicator */}
              <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${driveProgress * 100}%` }}
                />
              </div>

              <div className="space-y-2 text-xs pt-1.5 border-t border-zinc-150">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Destination:</span>
                  <span className="font-bold text-zinc-800">
                    {driverState === 'PICKING_UP' ? activeTrip.origin.label : activeTrip.destination.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payout:</span>
                  <span className="font-bold text-emerald-600 text-sm">₦{activeTrip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Drive Simulation controller - Manual steps or Auto-Tick triggers */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center space-y-3">
              <h4 className="text-xs font-bold text-zinc-700">Trip Progression Trigger</h4>
              <p className="text-[11px] text-zinc-400 max-w-[200px] mx-auto">
                In this simulator, drive times are condensed. Auto-drive progress updates coordinate movements.
              </p>

              {driverState === 'WAITING_PASSENGER' && (
                <button
                  onClick={handleStartRide}
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  id="driver-start-trip-btn"
                >
                  <Car size={14} /> Passenger Onboard - Start Ride
                </button>
              )}

              {driverState === 'DRIVING' && driveProgress >= 1.0 && (
                <button
                  onClick={handleCompletePayout}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md animate-bounce"
                  id="driver-complete-trip-btn"
                >
                  <CircleCheck size={14} /> Arrived - Complete Ride & Collect Payout
                </button>
              )}

              {(driverState === 'PICKING_UP' || driverState === 'DRIVING') && (
                <div className="text-xs text-zinc-500 flex items-center justify-center gap-1 font-mono py-1.5 bg-white rounded-lg border border-zinc-100">
                  <Clock size={12} className="animate-spin" />
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
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner animate-bounce">
              <CircleCheck size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-zinc-800">Trip Completed!</h3>
              <p className="text-xs text-zinc-500">
                You safely deposited the passenger. Payout processed successfully.
              </p>
            </div>

            {/* Receipt receipt statement */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 space-y-2.5 max-w-[280px] mx-auto text-left text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Net Fare Payout:</span>
                <span className="font-extrabold text-zinc-800">₦{recentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Service Fee cut (0% promotional):</span>
                <span className="font-extrabold text-zinc-400">-₦0.00</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-zinc-200">
                <span className="font-bold text-zinc-700">Total Transferred:</span>
                <span className="font-black text-emerald-600 text-sm">₦{recentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={handleResetToIdle}
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              id="driver-payout-dismiss-btn"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-zinc-50 p-2.5 text-center text-[10px] text-zinc-400 border-t border-zinc-150 flex items-center justify-center gap-1 font-mono">
        <span>Instant Cashout synced with Stripe Express</span>
      </div>
    </div>
  );
}
