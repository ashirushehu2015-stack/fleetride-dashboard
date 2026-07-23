import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Car,
  Users,
  Star,
  Activity,
  Zap,
  Leaf,
  Plus,
  Play,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { Trip, VehicleType } from '../types';
import { VEHICLE_CONFIGS, MOCK_DRIVERS, MOCK_PASSENGERS } from '../data';

interface DashboardPanelProps {
  completedTrips: Trip[];
  onTriggerRandomTrip: (trip: Trip) => void;
  isSurgeActive: boolean;
  setIsSurgeActive: (val: boolean) => void;
  currentCity: {
    id: string;
    name: string;
    center: { lat: number; lng: number };
    zoom: number;
    landmarks: { lat: number; lng: number; label: string }[];
  };
  onReplayTrip?: (trip: Trip) => void;
}

// Initial realistic data for the charts (if no rides completed yet, to make it look gorgeous)
const BASE_DAILY_DATA = [
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
  currentCity,
  onReplayTrip,
}: DashboardPanelProps) {
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'rides'>('revenue');

  // 1. Calculate dynamic statistics combining static baseline + real-time user-completed rides
  const stats = useMemo(() => {
    const userRevenue = completedTrips.reduce((acc, t) => acc + t.price, 0);
    const userRides = completedTrips.length;

    const baseRevenue = BASE_DAILY_DATA.reduce((acc, d) => acc + d.revenue, 0);
    const baseRides = BASE_DAILY_DATA.reduce((acc, d) => acc + d.rides, 0);

    const totalRevenue = baseRevenue + userRevenue;
    const totalRides = baseRides + userRides;

    // Calculate average rating of completed rides (defaulting to 4.88)
    const userRatings = completedTrips.filter(t => t.rating !== undefined).map(t => t.rating!);
    const avgRating = userRatings.length > 0
      ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length
      : 4.88;

    return {
      revenue: totalRevenue,
      rides: totalRides,
      avgRating,
      carbonSavedKg: (totalRides * 0.45).toFixed(1) // simulated green metric
    };
  }, [completedTrips]);

  // 2. Aggregate Chart Data: Day-by-Day Revenue, User Contribution, and Average Fare
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

    // Initialize baseline map for 7 days
    const dayMap = new Map<
      string,
      {
        day: string;
        baseRevenue: number;
        userRevenue: number;
        revenue: number;
        rides: number;
        userRides: number;
        avgFare: number;
      }
    >();

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

    // Accumulate actual user completed trips dynamically by timestamp day of week
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

    // Add user completed rides
    completedTrips.forEach(t => {
      if (counts[t.vehicleType] !== undefined) {
        counts[t.vehicleType] += 1;
      }
    });

    return VEHICLE_CONFIGS.map(v => ({
      name: v.name,
      value: counts[v.id as VehicleType],
      multiplier: v.multiplier
    }));
  }, [completedTrips]);

  // 4. Distance Bracket distribution
  const distanceDistributionData = useMemo(() => {
    let short = 112; // < 2 miles
    let medium = 176; // 2 - 5 miles
    let long = 54; // > 5 miles

    completedTrips.forEach(t => {
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

  // 5. Duration Distribution (in minutes) for completed trips
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

  // 5. Trigger a random simulation booking to animate charts
  const triggerRandomBookingSimulation = () => {
    // Generate random completed trip
    const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    const randomPassenger = MOCK_PASSENGERS[Math.floor(Math.random() * MOCK_PASSENGERS.length)];
    const randomVehicle = VEHICLE_CONFIGS[Math.floor(Math.random() * VEHICLE_CONFIGS.length)];

    const landmarks = currentCity.landmarks && currentCity.landmarks.length > 0
      ? currentCity.landmarks
      : [
          { lat: 9.0625, lng: 7.4912, label: 'Abuja National Mosque' },
          { lat: 6.4381, lng: 3.4423, label: 'Lekki Toll Plaza' },
          { lat: 4.8214, lng: 7.0260, label: 'PH Pleasure Park' }
        ];

    const pickup = landmarks[Math.floor(Math.random() * landmarks.length)];
    let dropoff = landmarks[Math.floor(Math.random() * landmarks.length)];
    while (dropoff.label === pickup.label) {
      dropoff = landmarks[Math.floor(Math.random() * landmarks.length)];
    }

    const distance = parseFloat((Math.max(0.6, Math.random() * 8.5)).toFixed(1));
    const baseFare = (4.50 + distance * 1.80) * randomVehicle.multiplier;
    const finalFare = isSurgeActive ? parseFloat((baseFare * 1.8).toFixed(2)) : parseFloat(baseFare.toFixed(2));
    const duration = Math.round(distance * 1.5 + 2);

    const ratings = [5, 5, 5, 4, 4, 3];
    const rating = ratings[Math.floor(Math.random() * ratings.length)];

    const feedbackTexts: Record<number, string[]> = {
      5: ['Extremely polite driver!', 'Clean vehicle and excellent driving.', 'Arrived sooner than expected.', 'Very comfortable journey.'],
      4: ['Smooth trip, thank you.', 'Good route selection, missed the gridlock.'],
      3: ['Average ride, car had a weird scent.', 'Okay experience, but drove a bit slow.']
    };
    const reviews = feedbackTexts[rating] || ['Satisfactory travel.'];
    const review = reviews[Math.floor(Math.random() * reviews.length)];

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
      review,
      timestamp: new Date().toISOString()
    };

    onTriggerRandomTrip(mockTrip);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-[#E5DFD3] max-h-[85vh] lg:max-h-[90vh]">
      
      {/* HEADER BANNER */}
      <div className="p-4 bg-[#FAF7F2] text-zinc-900 flex items-center justify-between border-b border-[#E5DFD3] shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-700 text-white p-1.5 rounded-lg shadow-xs">
            <Activity size={16} />
          </div>
          <div>
            <span className="font-extrabold text-sm block text-zinc-900">System Dashboard</span>
            <span className="text-[10px] text-zinc-600 font-semibold">Live Ride-Sharing Metrics</span>
          </div>
        </div>

        {/* Live Surge Actuator Toggle */}
        <button
          onClick={() => setIsSurgeActive(!isSurgeActive)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
            isSurgeActive
              ? 'bg-amber-400 text-zinc-950 shadow-xs animate-pulse'
              : 'bg-white text-zinc-800 border border-[#E5DFD3] hover:bg-[#FAF7F2]'
          }`}
          id="toggle-dashboard-surge-btn"
        >
          <Zap size={12} className={isSurgeActive ? 'fill-zinc-950' : ''} />
          {isSurgeActive ? 'Surge Active (1.8x)' : 'Trigger Surge (Peak)'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        
        {/* SECTION 1: KEY PERFORMANCE RATINGS (KPI Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <button
            onClick={() => setActiveMetric('revenue')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activeMetric === 'revenue'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-[#FAF7F2] border-[#E5DFD3] hover:bg-[#F2EDE4]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeMetric === 'revenue' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Gross Revenue
              </span>
              <DollarSign size={14} className={activeMetric === 'revenue' ? 'text-emerald-400' : 'text-zinc-600'} />
            </div>
            <div className="text-lg font-black">₦{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`text-[9px] mt-1 flex items-center gap-0.5 font-bold ${activeMetric === 'revenue' ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <ArrowUpRight size={10} /> +12.4% vs last week
            </div>
          </button>

          <button
            onClick={() => setActiveMetric('rides')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              activeMetric === 'rides'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-[#FAF7F2] border-[#E5DFD3] hover:bg-[#F2EDE4]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeMetric === 'rides' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Completed Trips
              </span>
              <Car size={14} className={activeMetric === 'rides' ? 'text-emerald-400' : 'text-zinc-600'} />
            </div>
            <div className="text-lg font-black">{stats.rides} rides</div>
            <div className={`text-[9px] mt-1 flex items-center gap-0.5 font-bold ${activeMetric === 'rides' ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <ArrowUpRight size={10} /> +8.1% demand index
            </div>
          </button>

          <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                Average Rating
              </span>
              <Star size={14} className="text-amber-500 fill-amber-500" />
            </div>
            <div className="text-lg font-black text-zinc-900">{stats.avgRating.toFixed(2)} ★</div>
            <div className="text-[9px] mt-1 text-emerald-700 font-bold">
              Top 1% Driver rating
            </div>
          </div>

          <div className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                CO2 Saved (Est)
              </span>
              <Leaf size={14} className="text-emerald-700" />
            </div>
            <div className="text-lg font-black text-emerald-700">{stats.carbonSavedKg} kg</div>
            <div className="text-[9px] mt-1 text-zinc-600 font-medium">
              Powered by Hybrid & EVs
            </div>
          </div>

        </div>

        {/* SECTION 2: INTERACTIVE SIMULATION GENERATOR */}
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <h4 className="font-extrabold text-xs text-zinc-900">Dynamic Live Simulator Controller</h4>
            </div>
            <p className="text-[11px] text-zinc-600 font-medium leading-relaxed max-w-xl">
              Want to see the charts animate immediately? Click below to instantly generate a random completed trip in the city database.
            </p>
          </div>

          <button
            onClick={triggerRandomBookingSimulation}
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition cursor-pointer"
            id="trigger-random-trip-sim-btn"
          >
            <Plus size={14} /> Add Simulated Ride
          </button>
        </div>

        {/* SECTION 3: RECHARTS DAILY REVENUE TREND & ANALYTICS */}
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-4 text-left shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3] pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={15} className="text-emerald-700" />
                <h4 className="font-extrabold text-xs text-zinc-900">
                  Daily Revenue Trends & Ride Analytics
                </h4>
              </div>
              <p className="text-[10px] text-zinc-600 font-medium">
                Live weekly revenue performance calculated from real-time completed trips
              </p>
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex items-center bg-white border border-[#E5DFD3] rounded-lg p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActiveMetric('revenue')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activeMetric === 'revenue'
                    ? 'bg-emerald-700 text-white shadow-2xs font-extrabold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                id="tab-view-revenue-trend"
              >
                Revenue Area
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('rides')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activeMetric === 'rides'
                    ? 'bg-emerald-700 text-white shadow-2xs font-extrabold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                id="tab-view-composed-trend"
              >
                Revenue & Avg Fare
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-[230px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'revenue' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorUserRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans">
                            <div className="font-extrabold text-emerald-400 text-xs border-b border-zinc-800 pb-1 flex items-center justify-between gap-4">
                              <span>{label}day Revenue Trend</span>
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                ₦{data.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-zinc-300 text-[11px]">
                              <span>Base Revenue:</span>
                              <span className="font-mono font-bold">₦{data.baseRevenue.toLocaleString()}</span>
                            </div>
                            {data.userRevenue > 0 && (
                              <div className="flex justify-between items-center gap-4 text-emerald-400 text-[11px] font-semibold">
                                <span>Real User Rides:</span>
                                <span className="font-mono font-bold">+₦{data.userRevenue.toLocaleString()} ({data.userRides} rides)</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center gap-4 text-zinc-400 text-[11px]">
                              <span>Total Daily Trips:</span>
                              <span className="font-mono font-bold text-zinc-200">{data.rides} rides</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-amber-400 text-[11px]">
                              <span>Avg Fare / Trip:</span>
                              <span className="font-mono font-bold">₦{data.avgFare.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Daily Revenue (₦)"
                    stroke="#047857"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              ) : (
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => `₦${val}`}
                    tick={{ fontSize: 9, fill: '#0284c7', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5">
                            <div className="font-extrabold text-sky-400 text-xs border-b border-zinc-800 pb-1">
                              {label}day Metric Breakdown
                            </div>
                            <div className="flex justify-between items-center gap-4 text-zinc-300 text-[11px]">
                              <span>Daily Revenue:</span>
                              <span className="font-mono font-bold text-emerald-400">₦{data.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-sky-300 text-[11px]">
                              <span>Avg Fare per Ride:</span>
                              <span className="font-mono font-bold">₦{data.avgFare.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 text-zinc-400 text-[11px]">
                              <span>Trips Completed:</span>
                              <span className="font-mono font-bold text-zinc-200">{data.rides} rides</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Daily Revenue (₦)"
                    fill="#18181b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-bar-${index}`}
                        fill={entry.userRevenue > 0 ? '#047857' : '#27272a'}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgFare"
                    name="Avg Fare (₦)"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0284c7' }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Day-by-Day Daily Revenue Cards Summary */}
          <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-[#E5DFD3]">
            {chartData.map((d) => (
              <div
                key={d.day}
                className={`p-2 rounded-lg text-center border transition ${
                  d.userRevenue > 0
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-white border-[#E5DFD3]'
                }`}
              >
                <div className="text-[10px] font-extrabold text-zinc-900">{d.day}</div>
                <div className="text-[10px] font-mono font-black text-emerald-800 mt-0.5 truncate">
                  ₦{(d.revenue / 1000).toFixed(0)}k
                </div>
                <div className="text-[8px] font-mono font-bold text-zinc-500 mt-0.5">
                  {d.rides} rides
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: DEMAND CATEGORIZATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Bar Chart: Vehicle Class breakdown */}
          <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-4 text-left">
            <div>
              <h4 className="font-extrabold text-xs text-zinc-900">Demand Share by Car Class</h4>
              <p className="text-[10px] text-zinc-600 font-medium mb-3">Popularity breakdown of booking categories</p>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleBreakdownData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5DFD3" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#3f3f46', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#3f3f46', fontWeight: 600 }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="value" name="Rides Ordered" fill="#18181b" radius={[0, 4, 4, 0]}>
                    {vehicleBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#18181b' : index === 1 ? '#0284c7' : index === 2 ? '#7c3aed' : index === 3 ? '#e11d48' : '#d97706'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Trip Duration Distribution */}
          <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-extrabold text-xs text-zinc-900 flex items-center gap-1.5">
                  <Clock size={13} className="text-sky-700" />
                  Trip Duration Distribution
                </h4>
                <p className="text-[10px] text-zinc-600 font-medium">Trip duration frequency (mins)</p>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                Minutes
              </span>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                  <XAxis
                    dataKey="durationRange"
                    tick={{ fontSize: 9, fill: '#3f3f46', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#3f3f46', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                            <div className="font-extrabold text-sky-400 text-[11px]">
                              Duration: {data.durationRange}
                            </div>
                            <div className="text-[10px] text-zinc-300 font-semibold">
                              Completed Trips: <span className="font-mono text-white font-black">{data.count} rides</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" name="Trips" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {durationDistributionData.map((entry, index) => (
                      <Cell key={`duration-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Trip Distance bracket */}
          <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-4 text-left">
            <div>
              <h4 className="font-extrabold text-xs text-zinc-900">Trip Distance Distribution</h4>
              <p className="text-[10px] text-zinc-600 font-medium mb-3">Breakdown of ride length categories</p>
            </div>

            <div className="h-[200px] w-full flex items-center justify-between">
              <div className="w-[60%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distanceDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {distanceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends custom */}
              <div className="w-[40%] space-y-3 pl-2 text-xs">
                {distanceDistributionData.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-zinc-800 text-[10px]">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-zinc-900 text-xs pl-4">{item.value} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 5: RECENT TRIPS & LIVE ACTIVITY */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Recent Trips & Live Activity</h4>
            <span className="text-[10px] text-zinc-600 font-bold">{completedTrips.length} Total Trips</span>
          </div>

          {completedTrips.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-[#E5DFD3] rounded-xl bg-[#FAF7F2]">
              <Calendar size={24} className="mx-auto text-zinc-400 mb-2" />
              <h5 className="text-xs font-extrabold text-zinc-900">No recent trips yet</h5>
              <p className="text-[10px] text-zinc-600 font-medium max-w-[200px] mx-auto mt-1">
                Completed user bookings or simulated entries will populate this activity log!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {completedTrips.slice().reverse().map((trip) => {
                const formattedDate = trip.timestamp 
                  ? (trip.timestamp.includes('T') 
                    ? new Date(trip.timestamp).toLocaleDateString() + ' ' + new Date(trip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : trip.timestamp)
                  : new Date().toLocaleTimeString();
                return (
                  <div key={trip.id} className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl p-3 flex flex-col sm:flex-row justify-between gap-3 text-xs shadow-xs hover:border-zinc-400 transition">
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
                        
                        <p className="text-[10px] text-zinc-600 font-bold truncate mt-0.5">
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
                      <div className="font-extrabold text-emerald-700 text-sm">₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-[9px] text-zinc-600 font-mono font-bold">
                        {trip.distanceMiles}km • {trip.durationMinutes}m
                      </div>
                      {onReplayTrip && (
                        <button
                          type="button"
                          onClick={() => onReplayTrip(trip)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs mt-1"
                          title="Replay Route Animation"
                          id={`dash-replay-trip-${trip.id}`}
                        >
                          <Play size={10} className="fill-white" />
                          <span>Replay</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div className="bg-[#FAF7F2] p-2 text-center text-[9px] text-zinc-600 border-t border-[#E5DFD3] font-mono font-semibold">
        Active demand model parameters updated in real-time
      </div>
    </div>
  );
}
