import React, { useState, useEffect } from 'react';
import VoiceCallModal from './VoiceCallModal';
import SafetyToolkitModal from './SafetyToolkitModal';
import DriverOnboardingModal from './DriverOnboardingModal';
import { UserProfile, Location, Trip } from '../types';
import { MOCK_PASSENGERS } from '../data';
import { saveTripToFirestore } from '../firebase';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Car,
  Check,
  CheckCheck,
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
  Send,
  ShieldCheck,
  BarChart3,
  LineChart,
  Calendar,
  DollarSign,
  Zap,
  CalendarClock,
  CheckCircle2,
  Radio,
  Smartphone,
  Satellite,
  Info,
  Gauge,
  Wifi,
  WifiOff
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
  onReplayTrip?: (trip: Trip) => void;
  allTrips?: Trip[];
  addAuditLog?: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
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

// Helper function to generate last 7 days driver earnings
const getInitialWeeklyEarnings = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const list = [];
  const baseEarnings = [18500, 24200, 15800, 32000, 28400, 21000, 35600];
  const baseTrips = [6, 9, 5, 12, 10, 7, 14];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayName = i === 0 ? 'Today' : days[d.getDay()];
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const idx = (d.getDay() + 3) % 7;
    const fare = baseEarnings[idx];
    const tips = Math.round(fare * 0.08);

    list.push({
      day: dayName,
      date: dateFormatted,
      fare,
      tips,
      earnings: fare + tips,
      trips: baseTrips[idx],
      isToday: i === 0
    });
  }
  return list;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950 text-white border border-zinc-800 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-1">
          <span className="font-mono text-zinc-400 font-extrabold uppercase text-[10px]">{data.date} ({data.day})</span>
          {data.isToday && (
            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
              Today
            </span>
          )}
        </div>
        <div className="text-sm font-black text-emerald-400">
          ₦{data.earnings.toLocaleString()}
        </div>
        <div className="flex items-center justify-between gap-4 text-[11px] text-zinc-300 font-medium">
          <span>Fares: ₦{data.fare.toLocaleString()}</span>
          <span>Tips: ₦{data.tips.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-zinc-400 pt-0.5">
          {data.trips} completed trips
        </div>
      </div>
    );
  }
  return null;
};

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
  onReplayTrip,
  allTrips,
  addAuditLog,
}: DriverPanelProps) {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [activeOffer, setActiveOffer] = useState<SimulatedOffer | null>(null);
  const [driverState, setDriverState] = useState<'IDLE' | 'PICKING_UP' | 'WAITING_PASSENGER' | 'DRIVING' | 'SUCCESS'>('IDLE');
  const [activeTrip, setActiveTrip] = useState<SimulatedOffer | null>(null);
  const [driveProgress, setDriveProgress] = useState<number>(0);
  const [recentEarnings, setRecentEarnings] = useState<number>(0);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState<boolean>(false);
  const [isSafetyToolkitOpen, setIsSafetyToolkitOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [showDriverChat, setShowDriverChat] = useState<boolean>(false);
  const [driverChatInput, setDriverChatInput] = useState<string>('');
  const [weeklyEarnings, setWeeklyEarnings] = useState(getInitialWeeklyEarnings);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Option A: Smartphone Live GPS Telematics State
  const [useLiveDeviceGps, setUseLiveDeviceGps] = useState<boolean>(true);
  const [isOptionAGuideOpen, setIsOptionAGuideOpen] = useState<boolean>(false);
  const [gpsTelemetry, setGpsTelemetry] = useState<{
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    status: 'IDLE' | 'SEARCHING' | 'LOCK' | 'ERROR';
    errorMsg: string | null;
    lastUpdated: string | null;
  }>({
    lat: null,
    lng: null,
    accuracy: null,
    speed: null,
    heading: null,
    status: 'IDLE',
    errorMsg: null,
    lastUpdated: null
  });

  const [driverMessages, setDriverMessages] = useState<Array<{ id: string; sender: 'driver' | 'rider'; text: string; time: string; status?: 'sent' | 'delivered' | 'read' }>>([
    { id: '1', sender: 'rider', text: "Hello driver, I'm waiting at the pickup spot!", time: 'Just now', status: 'read' }
  ]);

  // Option A: Live Geolocation Watcher (Smartphone GPS Telematics)
  useEffect(() => {
    if (!isOnline || !useLiveDeviceGps) {
      setGpsTelemetry((prev) => ({ ...prev, status: 'IDLE', errorMsg: null }));
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsTelemetry({
        lat: null,
        lng: null,
        accuracy: null,
        speed: null,
        heading: null,
        status: 'ERROR',
        errorMsg: 'Geolocation API is not supported by this browser/device.',
        lastUpdated: null
      });
      return;
    }

    setGpsTelemetry((prev) => ({ ...prev, status: 'SEARCHING', errorMsg: null }));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        const formattedTime = new Date().toLocaleTimeString();

        setGpsTelemetry({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ? Math.round(accuracy) : 5,
          speed: speed ? Math.round(speed * 3.6) : 0,
          heading: heading ? Math.round(heading) : 0,
          status: 'LOCK',
          errorMsg: null,
          lastUpdated: formattedTime
        });

        // Broadcast current live smartphone coordinates to platform driver position
        setDriverPosition({ lat: latitude, lng: longitude });

        if (addAuditLog && Math.random() < 0.05) {
          addAuditLog('DRIVER', `Option A Live GPS Telemetry: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (±${Math.round(accuracy)}m accuracy)`);
        }
      },
      (err) => {
        setGpsTelemetry({
          lat: null,
          lng: null,
          accuracy: null,
          speed: null,
          heading: null,
          status: 'ERROR',
          errorMsg: err.message || 'Location access denied or unavailable.',
          lastUpdated: new Date().toLocaleTimeString()
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, useLiveDeviceGps, setDriverPosition, addAuditLog]);

  const sendDriverMessage = (text: string) => {
    if (!text.trim()) return;
    const msgId = Date.now().toString();
    setDriverMessages((prev) => [
      ...prev,
      { id: msgId, sender: 'driver', text: text.trim(), time: 'Just now', status: 'sent' }
    ]);

    setTimeout(() => {
      setDriverMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: 'delivered' } : m))
      );
    }, 600);

    setTimeout(() => {
      setDriverMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: 'read' } : m))
      );
    }, 1300);
  };

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

    // Update weekly earnings today
    setWeeklyEarnings((prev) =>
      prev.map((item) =>
        item.isToday
          ? {
              ...item,
              fare: item.fare + activeTrip.price,
              earnings: item.earnings + activeTrip.price,
              trips: item.trips + 1,
            }
          : item
      )
    );

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

  const handleClaimScheduledTrip = (scheduledTrip: Trip) => {
    const claimedTrip: Trip = {
      ...scheduledTrip,
      status: 'ACCEPTED',
      driver: {
        name: profile.name,
        rating: profile.rating || 5.0,
        vehicleType: profile.vehicleType || 'X',
        vehicleName: profile.vehicleName || 'ZamTaxi EV Sedan',
        plateNumber: profile.plateNumber || 'ZMF-001',
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        phone: profile.phone || '+234 800 000 0000',
        completedTrips: profile.completedTrips || 0
      }
    };

    // 1. Update in Firestore
    saveTripToFirestore(claimedTrip);

    // 2. Pass to parent onAcceptTripByDriver
    onAcceptTripByDriver({
      id: claimedTrip.id,
      passengerName: claimedTrip.passengerName || 'Ashiru Shehu',
      passengerAvatar: claimedTrip.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      passengerRating: claimedTrip.passengerRating || 4.9,
      origin: claimedTrip.origin,
      destination: claimedTrip.destination,
      price: claimedTrip.price,
      distance: claimedTrip.distanceMiles,
      duration: claimedTrip.durationMinutes,
    });

    // 3. Set driver panel active trip
    const mappedOffer: SimulatedOffer = {
      id: claimedTrip.id,
      passengerName: claimedTrip.passengerName || 'Ashiru Shehu',
      passengerAvatar: claimedTrip.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      passengerRating: claimedTrip.passengerRating || 4.9,
      origin: claimedTrip.origin,
      destination: claimedTrip.destination,
      price: claimedTrip.price,
      distance: claimedTrip.distanceMiles,
      duration: claimedTrip.durationMinutes,
      countdown: 0
    };

    setActiveTrip(mappedOffer);
    setDriverState('PICKING_UP');
    setDriveProgress(0);
    setDriverPosition(city.landmarks[0] || null);

    if (addAuditLog) {
      addAuditLog('DRIVER', `Driver ${profile.name} claimed upcoming pickup #${claimedTrip.id} scheduled for ${claimedTrip.scheduledDate} @ ${claimedTrip.scheduledTime}`);
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
        {/* OPTION A: SMARTPHONE GPS TELEMATICS CONTROL & LIVE FEED */}
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-3.5 space-y-3 text-left shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-xs text-zinc-900">Option A: Smartphone GPS Telematics</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-300 uppercase tracking-wider">
                    Software Tracking
                  </span>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium">
                  Tracks vehicle position live via driver smartphone (Zero extra hardware cost)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOptionAGuideOpen(true)}
                className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-[#E5DFD3] text-zinc-800 rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Info size={13} className="text-emerald-700" />
                <span>How Option A Works</span>
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#E5DFD3] shadow-2xs">
                <input
                  type="checkbox"
                  checked={useLiveDeviceGps}
                  onChange={(e) => setUseLiveDeviceGps(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 h-3.5 w-3.5 cursor-pointer"
                />
                <span className="text-[11px] font-extrabold text-zinc-800">Live Phone GPS</span>
              </label>
            </div>
          </div>

          {/* Telemetry Stats Grid */}
          {isOnline && useLiveDeviceGps && (
            <div className="bg-white p-3 rounded-xl border border-[#E5DFD3] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shadow-2xs">
              <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E5DFD3]/60">
                <div className="text-[9px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                  <Satellite size={11} className={gpsTelemetry.status === 'LOCK' ? 'text-emerald-600 animate-pulse' : 'text-amber-500'} />
                  Signal Status
                </div>
                <div className="font-black text-zinc-900 font-mono text-[11px] mt-0.5 truncate">
                  {gpsTelemetry.status === 'LOCK' ? (
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping inline-block" />
                      3D GPS Lock
                    </span>
                  ) : gpsTelemetry.status === 'SEARCHING' ? (
                    <span className="text-amber-600 font-bold">Acquiring...</span>
                  ) : gpsTelemetry.status === 'ERROR' ? (
                    <span className="text-rose-600 font-bold">Error</span>
                  ) : (
                    <span className="text-zinc-500">Standby</span>
                  )}
                </div>
              </div>

              <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E5DFD3]/60">
                <div className="text-[9px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                  <MapPin size={11} className="text-sky-600" />
                  Live Coordinates
                </div>
                <div className="font-mono text-[10px] font-bold text-zinc-900 mt-0.5 truncate">
                  {gpsTelemetry.lat && gpsTelemetry.lng ? (
                    `${gpsTelemetry.lat.toFixed(4)}°, ${gpsTelemetry.lng.toFixed(4)}°`
                  ) : (
                    <span className="text-zinc-400">Gusau Center</span>
                  )}
                </div>
              </div>

              <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E5DFD3]/60">
                <div className="text-[9px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                  <Gauge size={11} className="text-purple-600" />
                  Speed & Bearing
                </div>
                <div className="font-mono text-[11px] font-bold text-zinc-900 mt-0.5">
                  {gpsTelemetry.speed ?? 0} km/h • {gpsTelemetry.heading ?? 0}°
                </div>
              </div>

              <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E5DFD3]/60">
                <div className="text-[9px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                  <Radio size={11} className="text-emerald-600" />
                  Accuracy
                </div>
                <div className="font-mono text-[11px] font-bold text-emerald-800 mt-0.5">
                  {gpsTelemetry.accuracy ? `±${gpsTelemetry.accuracy} meters` : 'High Precision'}
                </div>
              </div>
            </div>
          )}

          {gpsTelemetry.errorMsg && useLiveDeviceGps && isOnline && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-700 shrink-0" />
              <span>{gpsTelemetry.errorMsg} (Falling back to simulated location)</span>
            </div>
          )}
        </div>

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

        {/* ZAMFARA STATE EV FINANCING & ONBOARDING CARD */}
        {driverState === 'IDLE' && (
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-zinc-950 p-4 rounded-2xl text-white border border-emerald-500/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Zap size={14} />
                </div>
                <div>
                  <span className="block text-xs font-black uppercase tracking-wider text-white">
                    Commercial EV Financing Portal
                  </span>
                  <span className="block text-[9.5px] text-emerald-300 font-medium">
                    Zamfara State 30% Govt Micro-Financing Scheme
                  </span>
                </div>
              </div>

              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE SCHEME
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-black/30 p-2.5 rounded-xl border border-white/10 font-mono">
              <div>
                <span className="block text-zinc-400 text-[8.5px] uppercase">Subsidy Rate</span>
                <span className="block text-emerald-400 font-bold">30% Grant</span>
              </div>
              <div>
                <span className="block text-zinc-400 text-[8.5px] uppercase">Daily Micro-Pay</span>
                <span className="block text-white font-bold">₦3,500/day</span>
              </div>
              <div>
                <span className="block text-zinc-400 text-[8.5px] uppercase">NIN/BVN Status</span>
                <span className="block text-emerald-400 font-bold">Verified ✅</span>
              </div>
            </div>

            <button
              onClick={() => setIsOnboardingModalOpen(true)}
              className="w-full bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              id="open-driver-financing-portal-btn"
            >
              <Award size={14} className="text-emerald-700" />
              Manage EV Vehicle Financing & Document Uploads
            </button>
          </div>
        )}

        {/* UPCOMING SCHEDULED RIDES (ADVANCE DRIVER CLAIMS ENGINE) */}
        {driverState === 'IDLE' && (
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CalendarClock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                    Upcoming Pending Scheduled Pickups
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Advance claims engine — reserve upcoming rides for guaranteed payout
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                {(allTrips || []).filter((t) => t.status === 'Pending' || (t.status === 'SCHEDULED' && (!t.driver || t.driver.plateNumber === 'PENDING' || t.driver.name === 'Pending Assignment'))).length} Available
              </span>
            </div>

            {((allTrips || []).filter((t) => t.status === 'Pending' || (t.status === 'SCHEDULED' && (!t.driver || t.driver.plateNumber === 'PENDING' || t.driver.name === 'Pending Assignment')))).length === 0 ? (
              <div className="text-center py-5 space-y-1 bg-white p-4 rounded-xl border border-dashed border-[#E5DFD3]">
                <Clock size={24} className="mx-auto text-zinc-400" />
                <p className="text-xs font-extrabold text-zinc-700">No Pending Scheduled Pickups</p>
                <p className="text-[10px] text-zinc-500">When riders pre-book rides in Gusau or inter-state, they will appear here for advance driver claims.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {((allTrips || []).filter((t) => t.status === 'Pending' || (t.status === 'SCHEDULED' && (!t.driver || t.driver.plateNumber === 'PENDING' || t.driver.name === 'Pending Assignment')))).map((pendingTrip) => (
                  <div
                    key={pendingTrip.id}
                    className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-2.5 hover:border-emerald-400 transition"
                  >
                    {/* Header: Time & Price */}
                    <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-2">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <CalendarClock size={13} className="text-emerald-700" />
                        <span>{pendingTrip.scheduledDate || 'Tomorrow'} @ {pendingTrip.scheduledTime || '08:30'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Guaranteed Fare</span>
                        <span className="text-xs font-black text-emerald-800">
                          ₦{(pendingTrip.price || 3500).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-1 text-xs font-medium bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E5DFD3]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span className="font-bold text-zinc-900 truncate">{pendingTrip.origin.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                        <span className="font-bold text-zinc-900 truncate">{pendingTrip.destination.label}</span>
                      </div>
                    </div>

                    {/* Rider info & Notes */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={pendingTrip.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={pendingTrip.passengerName}
                          className="w-6 h-6 rounded-full object-cover border border-zinc-300"
                        />
                        <span className="font-bold text-zinc-800">{pendingTrip.passengerName || 'Ashiru Shehu'}</span>
                      </div>
                      {pendingTrip.notes && (
                        <span className="text-zinc-500 italic max-w-[150px] truncate">
                          "{pendingTrip.notes}"
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleClaimScheduledTrip(pendingTrip)}
                      disabled={!isOnline}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm ${
                        isOnline
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                          : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                      }`}
                      id={`claim-trip-btn-${pendingTrip.id}`}
                    >
                      <CheckCircle2 size={14} />
                      {isOnline ? 'Claim Pickup & Assign Driver' : 'Go Online to Claim Pickup'}
                    </button>
                  </div>
                ))}
              </div>
            )}
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

            {/* 7-Day Visual Analytics Chart */}
            <div className="pt-3 border-t border-[#E5DFD3] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-700" />
                  <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                    Last 7 Days Performance
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white border border-[#E5DFD3] p-0.5 rounded-lg shadow-2xs">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      chartType === 'bar' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                    title="Bar Chart"
                    id="driver-chart-type-bar"
                  >
                    <BarChart3 size={12} /> Bar
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      chartType === 'area' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                    title="Area Trend"
                    id="driver-chart-type-area"
                  >
                    <LineChart size={12} /> Trend
                  </button>
                </div>
              </div>

              {/* 7-Day Summary Chips */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-white p-2 rounded-lg border border-[#E5DFD3] shadow-2xs">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">7-Day Total</span>
                  <span className="text-xs font-black text-emerald-700">₦{weeklyEarnings.reduce((a, b) => a + b.earnings, 0).toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E5DFD3] shadow-2xs">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Daily Avg</span>
                  <span className="text-xs font-black text-zinc-800">₦{Math.round(weeklyEarnings.reduce((a, b) => a + b.earnings, 0) / 7).toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E5DFD3] shadow-2xs">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Trips Done</span>
                  <span className="text-xs font-black text-zinc-800">{weeklyEarnings.reduce((a, b) => a + b.trips, 0)} rides</span>
                </div>
              </div>

              {/* Chart Visual Surface */}
              <div className="bg-white p-3 rounded-xl border border-[#E5DFD3] shadow-xs space-y-2">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={weeklyEarnings} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EDE4" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#71717A', fontWeight: 700 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: '#A1A1AA' }}
                          tickFormatter={(val) => `₦${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="earnings" radius={[6, 6, 0, 0]} animationDuration={800}>
                          {weeklyEarnings.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.isToday ? '#047857' : '#10B981'}
                              opacity={entry.isToday ? 1 : 0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={weeklyEarnings} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                        <defs>
                          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EDE4" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#71717A', fontWeight: 700 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: '#A1A1AA' }}
                          tickFormatter={(val) => `₦${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#047857"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#earningsGrad)"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-2 border-t border-[#F2EDE4]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 inline-block" /> Dark green = Today
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 inline-block" /> Past 6 Days
                  </span>
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

                <div className="flex items-center gap-1.5">
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
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-xs"
                    id="driver-call-passenger-btn"
                  >
                    <Phone size={13} /> Call
                  </button>
                  <button
                    onClick={() => setIsSafetyToolkitOpen(true)}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer shadow-xs"
                    title="Safety Toolkit"
                    id="driver-safety-toolkit-btn"
                  >
                    <ShieldCheck size={15} className="text-emerald-400" />
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
                          <p>{m.text}</p>
                          {m.sender === 'driver' && (
                            <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px]">
                              {m.status === 'read' ? (
                                <span className="flex items-center text-emerald-400 font-bold gap-0.5" title="Seen by passenger">
                                  <CheckCheck size={11} className="stroke-[2.5]" />
                                  <span className="text-[7.5px] uppercase">Seen</span>
                                </span>
                              ) : m.status === 'delivered' ? (
                                <span className="flex items-center text-zinc-300 gap-0.5" title="Delivered">
                                  <CheckCheck size={11} />
                                </span>
                              ) : (
                                <span className="flex items-center text-zinc-400 gap-0.5" title="Sent">
                                  <Check size={11} />
                                </span>
                              )}
                            </div>
                          )}
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
                        onClick={() => sendDriverMessage(pill)}
                        className="shrink-0 px-2 py-0.5 bg-zinc-50 hover:bg-zinc-200 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-700 cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendDriverMessage(driverChatInput);
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
                    <button type="submit" className="bg-zinc-900 text-white px-2.5 py-1 rounded-lg text-xs cursor-pointer">
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-[280px] mx-auto">
              {onReplayTrip && activeTrip && (
                <button
                  type="button"
                  onClick={() => onReplayTrip({
                    id: activeTrip.id,
                    origin: activeTrip.origin,
                    destination: activeTrip.destination,
                    vehicleType: 'X',
                    price: activeTrip.price,
                    distanceMiles: activeTrip.distance,
                    durationMinutes: activeTrip.duration,
                    driver: {
                      name: 'You (Driver)',
                      rating: 4.9,
                      vehicleType: 'X',
                      vehicleName: 'Toyota Corolla',
                      plateNumber: 'KJA-889-XA',
                      avatar: '',
                      phone: '+234 803 123 4567',
                      completedTrips: 142
                    },
                    status: 'COMPLETED',
                    progress: 1,
                    routePoints: [],
                    currentPosition: activeTrip.destination,
                    timestamp: new Date().toISOString()
                  })}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  id="driver-replay-route-btn"
                >
                  <Play size={13} className="fill-white" /> Replay Route
                </button>
              )}

              <button
                onClick={handleResetToIdle}
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                id="driver-payout-dismiss-btn"
              >
                Back to Dashboard
              </button>
            </div>
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

      {/* Safety Toolkit & Ride Check Modal */}
      <SafetyToolkitModal
        isOpen={isSafetyToolkitOpen}
        onClose={() => setIsSafetyToolkitOpen(false)}
        trip={activeTrip ? {
          id: activeTrip.id,
          origin: activeTrip.origin,
          destination: activeTrip.destination,
          vehicleType: 'X',
          price: activeTrip.price,
          distanceMiles: activeTrip.distanceMiles,
          durationMinutes: activeTrip.durationMinutes,
          driver: {
            name: 'You (Driver)',
            rating: 4.9,
            vehicleType: 'X',
            vehicleName: 'Toyota Corolla',
            plateNumber: 'KJA-889-XA',
            avatar: '',
            phone: '+234 803 123 4567',
            completedTrips: 142
          },
          status: 'TRIP_IN_PROGRESS',
          progress: driveProgress / 100,
          routePoints: [],
          currentPosition: activeTrip.origin,
          timestamp: new Date().toISOString()
        } : null}
      />

      {/* Driver EV Onboarding & Financing Portal Modal */}
      <DriverOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onCompleteOnboarding={(updatedData) => {
          setIsOnboardingModalOpen(false);
        }}
      />

      {/* Option A: Smartphone Telematics Guide Modal */}
      {isOptionAGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E5DFD3] text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">Option A: Smartphone GPS Telematics</h3>
                  <p className="text-xs text-zinc-500 font-medium">How to track vehicles without hardware installation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOptionAGuideOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700 leading-relaxed">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  No Hardwired Trackers or Car Alterations Required
                </div>
                <p className="text-[11px] text-emerald-800">
                  With Option A, each car is tracked directly through the driver's smartphone running the official <strong>ZamTaxi Driver App</strong>. The phone's internal high-precision GPS sensor acts as the vehicle telematics unit.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-zinc-900 uppercase tracking-wider text-[11px]">
                  Required Equipment for Vehicle Drivers:
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-[#3A352E]">
                  <li><strong>Android or iOS Smartphone</strong> with GPS/Location services enabled.</li>
                  <li><strong>Dashboard Phone Mount / Cradle</strong> fixed firmly on the vehicle dashboard.</li>
                  <li><strong>12V Car Charger / USB Cable</strong> kept plugged in so the battery stays at 100%.</li>
                  <li><strong>SIM Card with Active Data Plan</strong> (MTN, Airtel, Glo, or 9mobile 4G/5G).</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-zinc-900 uppercase tracking-wider text-[11px]">
                  How Location Telemetry Streams to the Platform:
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-[#3A352E]">
                  <li className="pl-1">
                    <strong>Go Online in Driver Console:</strong> The driver toggles "Online" when starting their shift.
                  </li>
                  <li className="pl-1">
                    <strong>Live Coordinate Streaming:</strong> The device sends latitude, longitude, speed, and heading to the platform every 2 seconds via WebSockets/Firestore.
                  </li>
                  <li className="pl-1">
                    <strong>Admin Dispatch Map Visibility:</strong> Fleet managers view all active vehicles moving live on the Gusau/Zamfara GIS map in real time.
                  </li>
                  <li className="pl-1">
                    <strong>Rider Live Tracking:</strong> Passengers see their assigned driver approaching their pickup point and along the ride.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl flex items-center justify-between text-[11px]">
                <span className="font-bold text-zinc-800">Active Telemetry Status:</span>
                <span className="font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  {useLiveDeviceGps ? 'ENABLED (Phone Sensor Active)' : 'SIMULATION MODE'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOptionAGuideOpen(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-xl cursor-pointer transition shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
