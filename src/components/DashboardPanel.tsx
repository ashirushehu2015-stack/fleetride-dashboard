import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Car,
  Star,
  Activity,
  Zap,
  Leaf,
  Plus,
  Play,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { Trip, VehicleType } from '../types';
import { VEHICLE_CONFIGS, MOCK_DRIVERS, MOCK_PASSENGERS } from '../data';

export type NavSection =
  | 'all'
  | 'overview'
  | 'revenue'
  | 'duration'
  | 'distance'
  | 'fleet'
  | 'simulator'
  | 'trips';

interface DashboardPanelProps {
  completedTrips: Trip[];
  onTriggerRandomTrip: (trip: Trip) => void;
  isSurgeActive: boolean;
  setIsSurgeActive: (val: boolean) => void;
  isPeakTraffic?: boolean;
  setIsPeakTraffic?: (val: boolean) => void;
  currentCity: {
    id: string;
    name: string;
    center: { lat: number; lng: number };
    zoom: number;
    landmarks: { lat: number; lng: number; label: string }[];
  };
  onReplayTrip?: (trip: Trip) => void;
  activeSection?: NavSection;
  onSelectSection?: (section: NavSection) => void;
}

// Initial realistic data for charts
export const BASE_DAILY_DATA = [
  { day: 'Mon', revenue: 126000, rides: 28 },
  { day: 'Tue', revenue: 153000, rides: 34 },
  { day: 'Wed', revenue: 144000, rides: 31 },
  { day: 'Thu', revenue: 192000, rides: 42 },
  { day: 'Fri', revenue: 267000, rides: 58 },
  { day: 'Sat', revenue: 336000, rides: 74 },
  { day: 'Sun', revenue: 285000, rides: 62 }
];

export default function DashboardPanel({
  completedTrips,
  onTriggerRandomTrip,
  isSurgeActive,
  setIsSurgeActive,
  isPeakTraffic = false,
  setIsPeakTraffic,
  currentCity,
  onReplayTrip,
  activeSection: controlledSection,
  onSelectSection
}: DashboardPanelProps) {
  const [internalSection, setInternalSection] = useState<NavSection>('all');
  const activeSection = controlledSection !== undefined ? controlledSection : internalSection;

  const setActiveSection = (sec: NavSection) => {
    setInternalSection(sec);
    if (onSelectSection) {
      onSelectSection(sec);
    }
  };

  // Helper to generate a random simulated trip
  const triggerRandomBookingSimulation = () => {
    const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    const randomVehicle = VEHICLE_CONFIGS[Math.floor(Math.random() * VEHICLE_CONFIGS.length)];

    const landmarks =
      currentCity.landmarks && currentCity.landmarks.length > 0
        ? currentCity.landmarks
        : [
            { lat: 9.0625, lng: 7.4912, label: 'Abuja National Mosque' },
            { lat: 6.4381, lng: 3.4423, label: 'Lekki Toll Plaza' },
            { lat: 4.8214, lng: 7.026, label: 'PH Pleasure Park' }
          ];

    const pickup = landmarks[Math.floor(Math.random() * landmarks.length)];
    let dropoff = landmarks[Math.floor(Math.random() * landmarks.length)];
    while (dropoff.label === pickup.label) {
      dropoff = landmarks[Math.floor(Math.random() * landmarks.length)];
    }

    const distance = parseFloat((Math.max(0.6, Math.random() * 8.5)).toFixed(1));
    const baseFare = (4.5 + distance * 1.8) * randomVehicle.multiplier;
    const finalFare = isSurgeActive
      ? parseFloat((baseFare * 1.8).toFixed(2))
      : parseFloat(baseFare.toFixed(2));
    const duration = Math.round(distance * 1.5 + 2);

    const ratings = [5, 5, 5, 4, 4, 3];
    const rating = ratings[Math.floor(Math.random() * ratings.length)];

    const mockTrip: Trip = {
      id: `sim-${Math.random().toString(36).substring(2, 9)}`,
      origin: { lat: pickup.lat, lng: pickup.lng, label: pickup.label },
      destination: { lat: dropoff.lat, lng: dropoff.lng, label: dropoff.label },
      vehicleType: randomVehicle.id as VehicleType,
      price: finalFare,
      distanceMiles: distance,
      durationMinutes: duration,
      driver: {
        name: randomDriver.name,
        rating: randomDriver.rating,
        vehicleType: randomVehicle.id as VehicleType,
        vehicleName: `${randomVehicle.name} • ${randomDriver.vehicleName}`,
        plateNumber: randomDriver.plateNumber,
        avatar: randomDriver.avatar,
        phone: randomDriver.phone,
        completedTrips: randomDriver.completedTrips + 1
      },
      status: 'COMPLETED',
      progress: 1.0,
      routePoints: [],
      currentPosition: { lat: dropoff.lat, lng: dropoff.lng },
      rating,
      review: 'Satisfactory, smooth simulated dispatch.',
      timestamp: new Date().toISOString()
    };

    onTriggerRandomTrip(mockTrip);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-[#E5DFD3]">
      {/* HEADER BANNER */}
      <div className="p-3.5 bg-[#FAF7F2] text-zinc-900 flex items-center justify-between gap-3 border-b border-[#E5DFD3] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-700 text-white p-2 rounded-xl shadow-xs shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-zinc-900 tracking-tight">Admin & Fleet Control</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Sync
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 font-semibold block">
              Zamfara Operations & Dispatch Control Panel
            </span>
          </div>
        </div>
      </div>

      {/* CONTROL NAVIGATION SIDEBAR */}
      <div className="flex-1 p-3.5 bg-[#FAF7F2] overflow-y-auto space-y-4 text-left">
        {/* NAV LINKS HEADER */}
        <div>
          <div className="px-1 py-1 text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider flex items-center justify-between border-b border-[#E5DFD3] pb-2 mb-2">
            <span>Admin Navigation</span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-800 font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active
            </span>
          </div>

          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveSection('all')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-all"
            >
              <div className="flex items-center gap-2.5">
                <Layers size={15} className={activeSection === 'all' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Master Overview</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'all' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>All</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-overview"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={15} className={activeSection === 'overview' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>KPI Metrics</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'overview' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>4 Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('revenue')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'revenue'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-revenue"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp size={15} className={activeSection === 'revenue' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Revenue Analytics</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'revenue' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>Charts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('duration')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'duration'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-duration"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 size={15} className={activeSection === 'duration' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Trip Duration</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'duration' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>Bar Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('distance')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'distance'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-distance"
            >
              <div className="flex items-center gap-2.5">
                <PieIcon size={15} className={activeSection === 'distance' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Distance Breakdown</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'distance' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>Pie Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('fleet')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'fleet'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-fleet"
            >
              <div className="flex items-center gap-2.5">
                <Car size={15} className={activeSection === 'fleet' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Fleet Categories</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'fleet' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>3 Classes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('simulator')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'simulator'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-simulator"
            >
              <div className="flex items-center gap-2.5">
                <Zap size={15} className={activeSection === 'simulator' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Live Simulator</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'simulator' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('trips')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer ${
                activeSection === 'trips'
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800'
                  : 'bg-white text-zinc-700 border border-[#E5DFD3] hover:bg-[#F2EDE4]'
              }`}
              id="admin-nav-trips"
            >
              <div className="flex items-center gap-2.5">
                <Clock size={15} className={activeSection === 'trips' ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>Trips & Audit Logs</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                activeSection === 'trips' ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}>{completedTrips.length}</span>
            </button>
          </nav>
        </div>

        {/* QUICK ACTION SIMULATION DISPATCH */}
        <div className="pt-3 border-t border-[#E5DFD3] space-y-2">
          <div className="px-1 text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>Quick Dispatch</span>
            <span className="text-[9px] text-emerald-800 font-bold">Action</span>
          </div>

          <button
            type="button"
            onClick={triggerRandomBookingSimulation}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold px-3 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            id="trigger-random-trip-sim-btn"
          >
            <Plus size={14} /> Add Simulated Ride
          </button>
        </div>

        {/* SIMULATION CONTROLS & ACTUATORS */}
        <div className="pt-3 border-t border-[#E5DFD3] space-y-2">
          <div className="px-1 text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>Simulation Parameters</span>
            <span className="text-[9px] text-amber-700 font-bold">Actuators</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPeakTraffic?.(!isPeakTraffic)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer border ${
              isPeakTraffic
                ? 'bg-red-600 text-white border-red-700 shadow-xs animate-pulse'
                : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
            }`}
            id="toggle-dashboard-peak-traffic-btn"
          >
            <div className="flex items-center gap-2">
              <Clock size={14} className={isPeakTraffic ? 'animate-spin' : ''} />
              <span>Peak Traffic</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black ${
              isPeakTraffic ? 'bg-red-950 text-red-200' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {isPeakTraffic ? '2.0x SLOW' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsSurgeActive(!isSurgeActive)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-between cursor-pointer border ${
              isSurgeActive
                ? 'bg-amber-400 text-zinc-950 border-amber-500 shadow-xs'
                : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
            }`}
            id="toggle-dashboard-surge-btn"
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className={isSurgeActive ? 'fill-zinc-950' : ''} />
              <span>Surge Pricing</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black ${
              isSurgeActive ? 'bg-amber-950 text-amber-300' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {isSurgeActive ? '1.8x ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* STATUS CARD */}
        <div className="p-3 bg-white border border-[#E5DFD3] rounded-xl text-left space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-zinc-900">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Control Pane Connected</span>
          </div>
          <p className="text-[9px] text-zinc-500 font-semibold leading-tight">
            Clicking any navigation link above updates the Main Display Screen on the right.
          </p>
        </div>
      </div>
    </div>
  );
}

{/* EXPORTED DISPLAY SCREEN COMPONENT FOR THE MAIN DISPLAY CANVAS (RIGHT COLUMN) */}
export function DashboardDisplayScreen({
  activeSection,
  setActiveSection,
  completedTrips,
  onTriggerRandomTrip,
  isSurgeActive,
  setIsSurgeActive,
  isPeakTraffic = false,
  setIsPeakTraffic,
  currentCity,
  onReplayTrip,
  onShowMap
}: {
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  completedTrips: Trip[];
  onTriggerRandomTrip: (trip: Trip) => void;
  isSurgeActive: boolean;
  setIsSurgeActive: (val: boolean) => void;
  isPeakTraffic?: boolean;
  setIsPeakTraffic?: (val: boolean) => void;
  currentCity: any;
  onReplayTrip?: (trip: Trip) => void;
  onShowMap: () => void;
}) {
  const [activeMetric, setActiveMetric] = useState<'line' | 'revenue' | 'rides'>('line');

  // 1. Calculate dynamic statistics
  const stats = useMemo(() => {
    const userRevenue = completedTrips.reduce((acc, t) => acc + t.price, 0);
    const userRides = completedTrips.length;

    const baseRevenue = BASE_DAILY_DATA.reduce((acc, d) => acc + d.revenue, 0);
    const baseRides = BASE_DAILY_DATA.reduce((acc, d) => acc + d.rides, 0);

    const totalRevenue = baseRevenue + userRevenue;
    const totalRides = baseRides + userRides;

    const userRatings = completedTrips
      .filter((t) => t.rating !== undefined)
      .map((t) => t.rating!);
    const avgRating =
      userRatings.length > 0
        ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length
        : 4.88;

    return {
      revenue: totalRevenue,
      rides: totalRides,
      avgRating,
      carbonSavedKg: (totalRides * 0.45).toFixed(1)
    };
  }, [completedTrips]);

  // 2. Aggregate Chart Data
  const chartData = useMemo(() => {
    const DAY_MAP: Record<number, string> = {
      0: 'Sun',
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat'
    };

    const dayMap = new Map<string, any>();
    BASE_DAILY_DATA.forEach((d) => {
      dayMap.set(d.day, {
        day: d.day,
        baseRevenue: d.revenue,
        userRevenue: 0,
        revenue: d.revenue,
        rides: d.rides,
        userRides: 0,
        avgFare: Math.round(d.revenue / Math.max(1, d.rides))
      });
    });

    completedTrips.forEach((trip) => {
      let dayName = 'Sun';
      if (trip.timestamp) {
        const date = new Date(trip.timestamp);
        if (!isNaN(date.getTime())) {
          dayName = DAY_MAP[date.getDay()] || 'Sun';
        }
      }
      const existing = dayMap.get(dayName);
      if (existing) {
        existing.userRevenue += trip.price;
        existing.revenue += Math.round(trip.price);
        existing.rides += 1;
        existing.userRides += 1;
        existing.avgFare = Math.round(existing.revenue / Math.max(1, existing.rides));
      }
    });

    return Array.from(dayMap.values());
  }, [completedTrips]);

  // 3. Aggregate Vehicle Type Breakdown
  const vehicleBreakdownData = useMemo(() => {
    const counts: Record<VehicleType, number> = {
      X: 120,
      Comfort: 64,
      Black: 32
    };

    completedTrips.forEach((t) => {
      if (counts[t.vehicleType] !== undefined) {
        counts[t.vehicleType] += 1;
      }
    });

    return VEHICLE_CONFIGS.map((v) => ({
      name: v.name,
      value: counts[v.id as VehicleType],
      multiplier: v.multiplier
    }));
  }, [completedTrips]);

  // 4. Distance Bracket distribution
  const distanceDistributionData = useMemo(() => {
    let short = 112;
    let medium = 176;
    let long = 54;

    completedTrips.forEach((t) => {
      if (t.distanceMiles < 2) short += 1;
      else if (t.distanceMiles <= 5) medium += 1;
      else long += 1;
    });

    return [
      { name: 'Short (<2 mi)', value: short, color: '#10b981' },
      { name: 'Medium (2-5 mi)', value: medium, color: '#3b82f6' },
      { name: 'Long (>5 mi)', value: long, color: '#f59e0b' }
    ];
  }, [completedTrips]);

  // 5. Duration Distribution
  const durationDistributionData = useMemo(() => {
    const durationBuckets = {
      '< 10m': 42,
      '10-20m': 135,
      '20-30m': 88,
      '30-45m': 32,
      '45m+': 11
    };

    completedTrips.forEach((t) => {
      const dur = t.durationMinutes || 0;
      if (dur < 10) durationBuckets['< 10m'] += 1;
      else if (dur < 20) durationBuckets['10-20m'] += 1;
      else if (dur < 30) durationBuckets['20-30m'] += 1;
      else if (dur <= 45) durationBuckets['30-45m'] += 1;
      else durationBuckets['45m+'] += 1;
    });

    return [
      { durationRange: '< 10m', count: durationBuckets['< 10m'], fill: '#10b981' },
      { durationRange: '10-20m', count: durationBuckets['10-20m'], fill: '#0284c7' },
      { durationRange: '20-30m', count: durationBuckets['20-30m'], fill: '#6366f1' },
      { durationRange: '30-45m', count: durationBuckets['30-45m'], fill: '#f59e0b' },
      { durationRange: '45m+', count: durationBuckets['45m+'], fill: '#ef4444' }
    ];
  }, [completedTrips]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5DFD3] shadow-xl overflow-hidden min-h-[550px]">
      {/* SCREEN HEADER WITH SWITCH TO MAP TOGGLE */}
      <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E5DFD3] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <div className="text-left">
            <h2 className="text-xs sm:text-sm font-black uppercase text-zinc-900 tracking-wider flex items-center gap-2">
              <span>DISPLAY SCREEN:</span>
              <span className="text-emerald-800">
                {activeSection === 'all' && 'MASTER OPERATIONS OVERVIEW'}
                {activeSection === 'overview' && 'KEY PERFORMANCE INDICATORS (KPIs)'}
                {activeSection === 'revenue' && 'REVENUE & FINANCIAL ANALYTICS'}
                {activeSection === 'duration' && 'TRIP DURATION DISTRIBUTION'}
                {activeSection === 'distance' && 'TRIP DISTANCE DISTRIBUTION'}
                {activeSection === 'fleet' && 'FLEET CATEGORIES & CAPACITY'}
                {activeSection === 'simulator' && 'LIVE SIMULATION DISPATCH'}
                {activeSection === 'trips' && 'TRIPS & AUDIT ACTIVITY LOG'}
              </span>
            </h2>
            <p className="text-[10px] text-zinc-500 font-semibold">
              Live updates for {currentCity.name} operations center
            </p>
          </div>
        </div>

        {/* TOGGLE TO MAP VIEW */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowMap}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2EDE4] text-zinc-800 border border-[#E5DFD3] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            id="switch-to-map-canvas-btn"
          >
            <MapPin size={13} className="text-emerald-600" />
            <span>Interactive Map View</span>
          </button>
        </div>
      </div>

      {/* MAIN SCREEN SCROLLABLE DISPLAY CANVAS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
        {/* SECTION 1: KPI CARDS */}
        {(activeSection === 'all' || activeSection === 'overview') && (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <h3 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider flex items-center gap-2">
                <LayoutDashboard size={15} className="text-emerald-700" />
                Key Performance Indicators
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DFD3] text-zinc-600">
                Real-time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
                    Gross Revenue
                  </span>
                  <DollarSign size={16} className="text-emerald-600" />
                </div>
                <div className="text-lg font-black tracking-tight text-zinc-900">
                  ₦{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] mt-1 flex items-center gap-0.5 font-bold text-emerald-700">
                  <ArrowUpRight size={10} /> +12.4% vs last week
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
                    Completed Rides
                  </span>
                  <Car size={16} className="text-sky-600" />
                </div>
                <div className="text-lg font-black tracking-tight text-zinc-900">
                  {stats.rides.toLocaleString()} rides
                </div>
                <div className="text-[9px] mt-1 flex items-center gap-0.5 font-bold text-sky-700">
                  <Activity size={10} /> {completedTrips.length} active session rides
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
                    Avg Rider Rating
                  </span>
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                </div>
                <div className="text-lg font-black tracking-tight text-zinc-900">
                  {stats.avgRating.toFixed(2)} / 5.0
                </div>
                <div className="text-[9px] mt-1 flex items-center gap-0.5 font-bold text-amber-700">
                  <Star size={10} /> Top Tier Satisfaction
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
                    CO2 Emissions Saved
                  </span>
                  <Leaf size={16} className="text-emerald-700" />
                </div>
                <div className="text-lg font-black tracking-tight text-zinc-900">
                  {stats.carbonSavedKg} kg
                </div>
                <div className="text-[9px] mt-1 flex items-center gap-0.5 font-bold text-emerald-800">
                  <Leaf size={10} /> Eco-hybrid fleet impact
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: REVENUE TRENDS & CHARTS */}
        {(activeSection === 'all' || activeSection === 'revenue') && (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <h3 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-700" />
                Revenue Trends & Financial Analytics
              </h3>
              <div className="flex items-center bg-[#FAF7F2] border border-[#E5DFD3] rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveMetric('line')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    activeMetric === 'line'
                      ? 'bg-emerald-700 text-white font-extrabold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Line Trend
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('revenue')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    activeMetric === 'revenue'
                      ? 'bg-emerald-700 text-white font-extrabold shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Area Trend
                </button>
              </div>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-4 text-left">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeMetric === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 700 }} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 600 }} axisLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                <div className="font-extrabold text-emerald-400">{data.day} Analytics</div>
                                <div>Gross Revenue: <span className="font-mono text-white font-black">₦{data.revenue.toLocaleString()}</span></div>
                                <div>Total Rides: <span className="font-mono text-emerald-300 font-bold">{data.rides} rides</span></div>
                                <div>Avg Fare: <span className="font-mono text-zinc-300">₦{data.avgFare}</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#047857" strokeWidth={3} dot={{ r: 4, fill: '#047857' }} />
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevScreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 700 }} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 600 }} axisLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-zinc-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                <div className="font-extrabold text-emerald-400">{data.day} Analytics</div>
                                <div>Gross Revenue: <span className="font-mono text-white font-black">₦{data.revenue.toLocaleString()}</span></div>
                                <div>Total Rides: <span className="font-mono text-emerald-300 font-bold">{data.rides} rides</span></div>
                                <div>Avg Fare: <span className="font-mono text-zinc-300">₦{data.avgFare}</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorRevScreen)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: TRIP DURATION DISTRIBUTION (BAR CHART - SCREENSHOT 1) */}
        {(activeSection === 'all' || activeSection === 'duration') && (
          <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <div>
                <h4 className="font-extrabold text-xs text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock size={15} className="text-sky-700" />
                  Trip Duration Distribution
                </h4>
                <p className="text-[10px] text-zinc-600 font-medium">
                  Trip duration frequency (mins) across all completed rides
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 border border-sky-200">
                Minutes
              </span>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                  <XAxis
                    dataKey="durationRange"
                    tick={{ fontSize: 10, fill: '#18181b', fontWeight: 700 }}
                    axisLine={{ stroke: '#18181b', strokeWidth: 2 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#18181b', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans">
                            <div className="font-extrabold text-sky-400 text-xs border-b border-zinc-800 pb-1">
                              Duration Bucket: {data.durationRange}
                            </div>
                            <div className="text-[11px] text-zinc-300 font-medium">
                              Completed Trips: <span className="font-mono text-white font-black">{data.count} rides</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" name="Trips" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {durationDistributionData.map((entry, index) => (
                      <Cell key={`duration-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SECTION 4: TRIP DISTANCE DISTRIBUTION (PIE CHART - SCREENSHOT 1) */}
        {(activeSection === 'all' || activeSection === 'distance') && (
          <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-4 text-left space-y-3">
            <div className="border-b border-[#E5DFD3] pb-2">
              <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <PieIcon size={15} className="text-emerald-700" />
                Trip Distance Distribution
              </h4>
              <p className="text-[10px] text-zinc-600 font-medium">
                Breakdown of ride length categories across city trips
              </p>
            </div>

            <div className="h-[200px] w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-[55%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distanceDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {distanceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* LEGENDS */}
              <div className="w-full sm:w-[45%] space-y-3 text-xs">
                {distanceDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-white border border-[#E5DFD3] p-2.5 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-extrabold text-zinc-800 text-xs">{item.name}</span>
                    </div>
                    <span className="font-black text-zinc-900 text-xs font-mono">{item.value} rides</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: FLEET CATEGORIES & CAPACITY (SCREENSHOT 2) */}
        {(activeSection === 'all' || activeSection === 'fleet') && (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <h3 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider flex items-center gap-2">
                <Car size={15} className="text-emerald-700" />
                Fleet Categories & Operational Capacity
              </h3>
              <span className="text-[10px] font-bold text-zinc-500">3 Active Classes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {VEHICLE_CONFIGS.map((veh) => (
                <div
                  key={veh.id}
                  className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl text-left space-y-2 hover:border-zinc-400 transition shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 uppercase">{veh.name}</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {veh.multiplier}x Multiplier
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">{veh.description}</p>
                  <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-500 text-[10px]">Capacity: {veh.capacity} Seats</span>
                    <span className="text-emerald-700 font-extrabold">
                      ₦{(4.5 * veh.multiplier).toFixed(2)} Base
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: RECENT TRIPS & AUDIT LOGS */}
        {(activeSection === 'all' || activeSection === 'trips') && (
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
              <h3 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider flex items-center gap-2">
                <Clock size={15} className="text-emerald-700" />
                Recent Trips & Live Activity Audit
              </h3>
              <span className="text-[10px] text-zinc-600 font-bold font-mono">
                {completedTrips.length} Total Logged Journeys
              </span>
            </div>

            {completedTrips.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#E5DFD3] rounded-xl bg-[#FAF7F2]">
                <Calendar size={28} className="mx-auto text-zinc-400 mb-2" />
                <h5 className="text-xs font-extrabold text-zinc-900">No completed trips logged yet</h5>
                <p className="text-[10px] text-zinc-600 font-medium max-w-[240px] mx-auto mt-1">
                  Book a trip in Rider Mode or click "Add Simulated Ride" in the control panel to populate this live screen!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {completedTrips
                  .slice()
                  .reverse()
                  .map((trip) => {
                    const formattedDate = trip.timestamp
                      ? trip.timestamp.includes('T')
                        ? new Date(trip.timestamp).toLocaleDateString() +
                          ' ' +
                          new Date(trip.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : trip.timestamp
                      : new Date().toLocaleTimeString();
                    return (
                      <div
                        key={trip.id}
                        className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-3.5 flex flex-col sm:flex-row justify-between gap-3 text-xs shadow-2xs hover:border-zinc-400 transition"
                      >
                        <div className="flex gap-3">
                          <img
                            src={trip.driver.avatar}
                            alt={trip.driver.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E5DFD3]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-zinc-900">{trip.driver.name}</span>
                              <span className="text-[9px] bg-zinc-900 text-white px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                                {trip.vehicleType}
                              </span>
                              {trip.rating && (
                                <span className="flex items-center text-amber-600 text-[10px] font-bold">
                                  <Star size={10} className="fill-amber-500 text-amber-500 mr-0.5" />
                                  {trip.rating}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-zinc-700 font-bold truncate mt-0.5">
                              {trip.origin.label} → {trip.destination.label}
                            </p>

                            <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono mt-1 font-semibold">
                              <Clock size={10} className="text-zinc-500" />
                              <span>{formattedDate}</span>
                            </div>

                            {trip.review && (
                              <p className="text-[10px] text-zinc-700 font-medium italic mt-1 leading-relaxed border-l-2 border-[#E5DFD3] pl-1.5">
                                "{trip.review}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end shrink-0 border-t sm:border-none pt-2 sm:pt-0 border-[#E5DFD3] gap-1.5">
                          <div className="font-extrabold text-emerald-700 text-sm">
                            ₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[9px] text-zinc-600 font-mono font-bold">
                            {trip.distanceMiles}km • {trip.durationMinutes}m
                          </div>
                          {onReplayTrip && (
                            <button
                              type="button"
                              onClick={() => {
                                onShowMap();
                                onReplayTrip(trip);
                              }}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs mt-1"
                              title="Replay Route Animation on Map"
                              id={`dash-replay-trip-${trip.id}`}
                            >
                              <Play size={10} className="fill-white" />
                              <span>Replay Map</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-[#FAF7F2] p-2 text-center text-[9px] text-zinc-600 border-t border-[#E5DFD3] font-mono font-semibold shrink-0">
        Active demand model parameters updated in real-time • Zamfara Operations Hub
      </div>
    </div>
  );
}
