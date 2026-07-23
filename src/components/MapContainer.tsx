import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Location, Trip, TripStatus } from '../types';
import { MapPin, Navigation, Car, AlertCircle, Info, Play, Pause, RotateCcw, X, FastForward, Activity, Radio, RefreshCw, CheckCircle, Clock, DollarSign, User } from 'lucide-react';
import { CITIES } from '../data';

export interface MapContainerProps {
  city: {
    id: string;
    name: string;
    center: { lat: number; lng: number };
    zoom: number;
    landmarks: { lat: number; lng: number; label: string }[];
  };
  origin: Location | null;
  destination: Location | null;
  setOrigin: (loc: Location | null) => void;
  setDestination: (loc: Location | null) => void;
  trip: Trip | null;
  completedTrips?: Trip[];
  isDriverMode: boolean;
  driverPosition: { lat: number; lng: number } | null;
  roamingCars: { id: string; lat: number; lng: number; angle: number; type: string }[];
  travelMode: 'municipal' | 'interstate';
  replayingTrip?: Trip | null;
  onStopReplay?: () => void;
}

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

export default function MapContainer(props: MapContainerProps) {
  const { replayingTrip, onStopReplay } = props;
  const [replayProgress, setReplayProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [replaySpeed, setReplaySpeed] = useState<1 | 2 | 4>(1);

  // Reset replay state whenever a new trip is replayed
  useEffect(() => {
    if (replayingTrip) {
      setReplayProgress(0);
      setIsPlaying(true);
    }
  }, [replayingTrip?.id]);

  // Replay Animation Progress Ticker Loop
  useEffect(() => {
    if (!replayingTrip || !isPlaying) return;
    const interval = setInterval(() => {
      setReplayProgress((prev) => {
        const next = prev + 0.007 * replaySpeed;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [replayingTrip, isPlaying, replaySpeed]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 bg-zinc-900">
      {hasValidKey ? (
        <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
          <GoogleMapWrapper
            {...props}
            replayProgress={replayingTrip ? replayProgress : undefined}
          />
        </APIProvider>
      ) : (
        <CanvasMapFallback
          {...props}
          replayProgress={replayingTrip ? replayProgress : undefined}
        />
      )}

      {/* ==========================================
          ROUTE REPLAY CONTROL HUD OVERLAY
         ========================================== */}
      {replayingTrip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-zinc-950/95 border border-emerald-500/40 text-white rounded-2xl p-3.5 shadow-2xl z-30 backdrop-blur-md space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity size={18} className={isPlaying ? 'animate-pulse' : ''} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  ROUTE REPLAY ANIMATION
                </span>
                <h4 className="text-xs font-extrabold text-white truncate max-w-[260px]">
                  {replayingTrip.origin.label} ➔ {replayingTrip.destination.label}
                </h4>
              </div>
            </div>

            <button
              onClick={() => {
                if (onStopReplay) onStopReplay();
              }}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              title="Exit Replay"
              id="close-route-replay-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Replay Metadata Banner */}
          <div className="flex items-center justify-between text-[11px] bg-zinc-900/90 p-2 rounded-xl border border-zinc-800/80 font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold truncate">
              <span>🚕 {replayingTrip.driver.vehicleName}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300 shrink-0">
              <span>{replayingTrip.distanceMiles} km</span>
              <span>•</span>
              <span>{replayingTrip.durationMinutes} mins</span>
              <span>•</span>
              <span className="text-emerald-400 font-extrabold">₦{replayingTrip.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Timeline Scrubbing Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400">
              <span className="flex items-center gap-1">
                <span>Progress: {Math.round(replayProgress * 100)}%</span>
              </span>
              <span className="text-emerald-400 font-extrabold">
                {replayProgress >= 1 ? '🏁 Route Completed' : isPlaying ? '▶ Tracing Path...' : '⏸ Paused'}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={replayProgress}
                onChange={(e) => {
                  setReplayProgress(parseFloat(e.target.value));
                  if (parseFloat(e.target.value) < 1 && !isPlaying) {
                    setIsPlaying(true);
                  }
                }}
                className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                id="route-replay-progress-slider"
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (replayProgress >= 1) {
                    setReplayProgress(0);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                id="toggle-replay-play-pause-btn"
              >
                {replayProgress >= 1 ? (
                  <>
                    <RotateCcw size={14} /> Replay Again
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause size={14} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={14} /> Play
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setReplayProgress(0);
                  setIsPlaying(true);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Restart Replay"
                id="restart-route-replay-btn"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400 font-mono font-bold mr-1">Speed:</span>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-[10px] font-mono font-bold">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setReplaySpeed(spd as 1 | 2 | 4)}
                    className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                      replaySpeed === spd ? 'bg-emerald-500 text-zinc-950 font-extrabold' : 'text-zinc-400 hover:text-white'
                    }`}
                    id={`replay-speed-${spd}x-btn`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 1. GOOGLE MAPS INTEGRATION
// ==========================================
function GoogleMapWrapper({
  city,
  origin: initialOrigin,
  destination: initialDestination,
  trip,
  completedTrips,
  isDriverMode,
  driverPosition,
  roamingCars,
  travelMode,
  replayingTrip,
  replayProgress,
}: MapContainerProps & { replayProgress?: number }) {
  const [mapCenter, setMapCenter] = useState(city.center);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);

  const activeOrigin = replayingTrip ? replayingTrip.origin : initialOrigin;
  const activeDestination = replayingTrip ? replayingTrip.destination : initialDestination;

  useEffect(() => {
    if (travelMode === 'interstate') {
      setMapCenter({ lat: 9.0820, lng: 8.6753 });
    } else {
      setMapCenter(city.center);
    }
  }, [city, travelMode]);

  return (
    <div className="w-full h-full relative">
      <Map
        defaultCenter={mapCenter}
        defaultZoom={travelMode === 'interstate' ? 6 : city.zoom}
        center={trip || replayingTrip ? undefined : mapCenter}
        mapId="UBER_SIMULATOR_MAP"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
        gestureHandling="cooperative"
        disableDefaultUI={false}
      >
        {/* Origin Pin */}
        {activeOrigin && (
          <AdvancedMarker position={{ lat: activeOrigin.lat, lng: activeOrigin.lng }} title={`Pickup: ${activeOrigin.label}`}>
            <Pin background="#22c55e" glyphColor="#fff" scale={1.1} />
          </AdvancedMarker>
        )}

        {/* Destination Pin */}
        {activeDestination && (
          <AdvancedMarker position={{ lat: activeDestination.lat, lng: activeDestination.lng }} title={`Dropoff: ${activeDestination.label}`}>
            <Pin background="#ef4444" glyphColor="#fff" scale={1.1} />
          </AdvancedMarker>
        )}

        {/* Active Driver Car (Rider Mode) */}
        {trip && trip.status !== 'IDLE' && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && !replayingTrip && (
          <AdvancedMarker position={trip.currentPosition} title={`Driver: ${trip.driver.name}`}>
            <div className="bg-amber-400 border-2 border-zinc-900 text-zinc-950 p-2 rounded-full shadow-lg flex items-center justify-center animate-bounce">
              <Car size={18} className="fill-zinc-950" />
            </div>
          </AdvancedMarker>
        )}

        {/* Active Driver Car (Driver Mode) */}
        {isDriverMode && driverPosition && !replayingTrip && (
          <AdvancedMarker position={driverPosition} title="Your Vehicle">
            <div className="bg-zinc-950 border-2 border-white text-white p-2 rounded-full shadow-lg flex items-center justify-center">
              <Navigation size={18} className="fill-white transform rotate-45" />
            </div>
          </AdvancedMarker>
        )}

        {/* Roaming Cars */}
        {!trip && !replayingTrip && !isDriverMode && roamingCars.map((car) => (
          <AdvancedMarker key={car.id} position={{ lat: car.lat, lng: car.lng }} title="ZamTaxi Driver">
            <div className="bg-white border border-zinc-300 text-zinc-900 p-1.5 rounded-full shadow-md flex items-center justify-center opacity-85">
              <Car size={12} className="fill-zinc-800" />
            </div>
          </AdvancedMarker>
        ))}

        {/* Completed Trips Starting Points Markers with Interactive Tooltips */}
        {completedTrips && completedTrips.map((cTrip) => {
          if (!cTrip.origin) return null;
          const isHovered = hoveredTripId === cTrip.id;
          return (
            <AdvancedMarker
              key={`completed-trip-marker-${cTrip.id}`}
              position={{ lat: cTrip.origin.lat, lng: cTrip.origin.lng }}
              title={`Completed Trip: ${cTrip.origin.label}`}
              zIndex={isHovered ? 200 : 20}
            >
              <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredTripId(cTrip.id)}
                onMouseLeave={() => setHoveredTripId(null)}
              >
                {/* Completed Trip Starting Pin */}
                <div className={`p-1.5 rounded-full border-2 transition-all duration-200 shadow-xl flex items-center justify-center ${
                  isHovered
                    ? 'bg-purple-600 border-white text-white scale-125 ring-4 ring-purple-500/40 z-50'
                    : 'bg-zinc-950 border-purple-400 text-purple-300 hover:scale-110'
                }`}>
                  <MapPin size={14} className="fill-purple-400 text-zinc-950" />
                </div>

                {/* Interactive Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-950/95 text-white border border-purple-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md z-50 pointer-events-auto space-y-2 text-left animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-[10px] font-mono font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle size={12} className="text-purple-400" />
                        Completed Trip #{cTrip.id.slice(-6)}
                      </span>
                      <span className="text-emerald-400 font-extrabold text-xs font-mono">
                        ₦{cTrip.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || cTrip.price}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <User size={11} className="text-zinc-400" />
                          Driver:
                        </span>
                        <span className="font-bold text-white truncate max-w-[130px]">{cTrip.driver?.name || 'Driver'}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Car size={11} className="text-zinc-400" />
                          Vehicle:
                        </span>
                        <span className="font-mono text-zinc-200">{cTrip.driver?.vehicleName || 'Standard'}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-400 font-medium flex items-center gap-1">
                          <Clock size={11} className="text-amber-400" />
                          Duration:
                        </span>
                        <span className="font-mono text-amber-400 font-extrabold">{cTrip.durationMinutes || 15} mins ({cTrip.distanceMiles || 0} km)</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400 space-y-0.5">
                      <div className="truncate"><strong className="text-emerald-400">Pickup:</strong> {cTrip.origin?.label}</div>
                      <div className="truncate"><strong className="text-rose-400">Dropoff:</strong> {cTrip.destination?.label}</div>
                    </div>
                  </div>
                )}
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Google Maps Route Renderer */}
        {(activeOrigin && activeDestination) && (
          <GoogleRouteRenderer
            origin={activeOrigin}
            destination={activeDestination}
            trip={trip}
            replayingTrip={replayingTrip}
            replayProgress={replayProgress}
          />
        )}
      </Map>

      {/* Floating API Key Indicator */}
      <div className="absolute top-4 right-4 bg-zinc-900/90 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-zinc-800 flex items-center gap-1.5 shadow-lg z-10 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Live Google Map Connected
      </div>
    </div>
  );
}

function GoogleRouteRenderer({
  origin,
  destination,
  trip,
  replayingTrip,
  replayProgress,
}: {
  origin: Location;
  destination: Location;
  trip: Trip | null;
  replayingTrip?: Trip | null;
  replayProgress?: number;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const originLatLng = { lat: origin.lat, lng: origin.lng };
    const destLatLng = { lat: destination.lat, lng: destination.lng };

    routesLib.Route.computeRoutes({
      origin: originLatLng,
      destination: destLatLng,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes?.[0]) {
          const baseColor = replayingTrip ? '#10b981' : '#3b82f6';
          const newPolylines = routes[0].createPolylines();
          newPolylines.forEach((p) => {
            p.setOptions({
              strokeColor: baseColor,
              strokeOpacity: 0.9,
              strokeWeight: 6,
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;

          // Adjust map viewport to cover the route
          if (routes[0].viewport) {
            map.fitBounds(routes[0].viewport);
          }
        }
      })
      .catch((err) => {
        console.error('Error computing google route:', err);
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination, trip?.id, replayingTrip?.id]);

  return null;
}

// ==========================================
// 2. DETAILED VECTOR CANVAS FALLBACK MAP
// ==========================================
const NIGERIA_BORDER = [
  { lat: 13.8, lng: 4.0 },
  { lat: 13.8, lng: 6.0 },
  { lat: 13.0, lng: 8.0 },
  { lat: 13.4, lng: 10.0 },
  { lat: 13.7, lng: 13.0 },
  { lat: 12.5, lng: 14.5 },
  { lat: 11.5, lng: 14.7 },
  { lat: 10.0, lng: 13.5 },
  { lat: 8.5, lng: 12.0 },
  { lat: 7.0, lng: 11.0 },
  { lat: 6.0, lng: 9.5 },
  { lat: 4.5, lng: 8.5 },
  { lat: 4.3, lng: 7.5 },
  { lat: 4.3, lng: 6.0 },
  { lat: 5.5, lng: 5.0 },
  { lat: 6.3, lng: 4.5 },
  { lat: 6.4, lng: 3.4 },
  { lat: 6.3, lng: 2.7 },
  { lat: 8.0, lng: 2.7 },
  { lat: 10.5, lng: 3.2 },
  { lat: 11.8, lng: 3.6 },
  { lat: 12.8, lng: 4.5 },
  { lat: 13.8, lng: 4.0 }
];

function CanvasMapFallback({
  city,
  origin: initialOrigin,
  destination: initialDestination,
  setOrigin,
  setDestination,
  trip,
  completedTrips,
  isDriverMode,
  driverPosition,
  roamingCars,
  travelMode,
  replayingTrip,
  replayProgress,
}: MapContainerProps & { replayProgress?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null);
  const [hoveredCompletedTrip, setHoveredCompletedTrip] = useState<Trip | null>(null);
  const [hoveredCompletedTripPos, setHoveredCompletedTripPos] = useState<{ x: number; y: number } | null>(null);

  const origin = replayingTrip ? replayingTrip.origin : initialOrigin;
  const destination = replayingTrip ? replayingTrip.destination : initialDestination;

  // Resize listener using ResizeObserver to avoid hardcoded layout sizes
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.max(width, 300), height: Math.max(height, 300) });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Determine dynamic bounding box based on city center or route coordinates
  let centerLat = city.center.lat;
  let centerLng = city.center.lng;
  let latSpan = 0.12;
  let lngSpan = 0.16;

  if (travelMode === 'interstate') {
    // Zoomed out national level bounding box coordinates for Nigeria map fallback
    centerLat = 9.0820;
    centerLng = 8.6753;
    latSpan = 11.2;
    lngSpan = 13.2;
  } else if (origin && destination) {
    const minLat = Math.min(origin.lat, destination.lat, city.center.lat);
    const maxLat = Math.max(origin.lat, destination.lat, city.center.lat);
    const minLng = Math.min(origin.lng, destination.lng, city.center.lng);
    const maxLng = Math.max(origin.lng, destination.lng, city.center.lng);

    const requiredLatSpan = (maxLat - minLat) * 1.4; // 40% padding
    const requiredLngSpan = (maxLng - minLng) * 1.4; // 40% padding

    if (requiredLatSpan > 0.12 || requiredLngSpan > 0.16) {
      latSpan = Math.max(0.12, requiredLatSpan);
      lngSpan = Math.max(0.16, requiredLngSpan);
      centerLat = (minLat + maxLat) / 2;
      centerLng = (minLng + maxLng) / 2;
    }
  }

  // Project Lat/Lng to pixel X/Y inside container width and height
  const project = (lat: number, lng: number) => {
    const scaleX = dimensions.width / lngSpan;
    const scaleY = dimensions.height / latSpan;

    // Linear mapping with Y inverted (since pixels start at 0 at the top)
    const x = (lng - (centerLng - lngSpan / 2)) * scaleX;
    const y = dimensions.height - (lat - (centerLat - latSpan / 2)) * scaleY;

    return { x, y };
  };

  // Convert pixel coordinates back to GPS
  const deproject = (x: number, y: number) => {
    const scaleX = dimensions.width / lngSpan;
    const scaleY = dimensions.height / latSpan;

    const lng = x / scaleX + (centerLng - lngSpan / 2);
    const lat = (dimensions.height - y) / scaleY + (centerLat - latSpan / 2);

    return { lat, lng };
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw elegant dark matrix grid background
    ctx.fillStyle = '#09090b'; // Tailwind zinc-950
    ctx.fillRect(0, 0, width, height);

    // Draw subtle map grids
    ctx.strokeStyle = '#18181b'; // Tailwind zinc-900
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const isInterstate = travelMode === 'interstate';

    if (isInterstate) {
      // 2a. Draw Nigeria Map Outline
      const borderPoints = NIGERIA_BORDER.map(pt => project(pt.lat, pt.lng));
      ctx.beginPath();
      borderPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      
      // Shadow / glow for the island map
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#101014'; // Slightly lighter than background zinc-950
      ctx.fill();
      
      // Reset shadows
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = '#2d2d34'; // Sleek border
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2b. Draw National Highway Lines
      ctx.strokeStyle = '#202025';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);

      const highwayConnections = [
        ['lagos', 'kaduna'],
        ['kaduna', 'kano'],
        ['lagos', 'port-harcourt'],
        ['port-harcourt', 'enugu'],
        ['enugu', 'abuja'],
        ['abuja', 'kaduna'],
        ['sokoto', 'gusau'],
        ['gusau', 'kano'],
      ];

      highwayConnections.forEach(([c1Id, c2Id]) => {
        const city1 = CITIES.find(c => c.id === c1Id);
        const city2 = CITIES.find(c => c.id === c2Id);
        if (city1 && city2) {
          const pt1 = project(city1.center.lat, city1.center.lng);
          const pt2 = project(city2.center.lat, city2.center.lng);
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
        }
      });
      ctx.setLineDash([]); // Reset
    } else {
      // 2. Draw Simulated Roads/Streets (municipal mode)
      ctx.strokeStyle = '#27272a'; // zinc-800
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Generate simulated straight grid roads based on landmarks to connect them nicely
      const projectedLandmarks = city.landmarks.map((l) => project(l.lat, l.lng));

      // Horizontal & Vertical intersecting highway corridors
      projectedLandmarks.forEach((pt) => {
        // Draw horizontal road line
        ctx.beginPath();
        ctx.moveTo(0, pt.y);
        ctx.lineTo(width, pt.y);
        ctx.stroke();

        // Draw vertical road line
        ctx.beginPath();
        ctx.moveTo(pt.x, 0);
        ctx.lineTo(pt.x, height);
        ctx.stroke();
      });

      // Draw connecting avenues (Landmarks ordered paths)
      ctx.strokeStyle = '#202023';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      projectedLandmarks.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }

    // 3. Draw Active Route Polyline (if Origin & Destination are selected)
    if (origin && destination) {
      const origPt = project(origin.lat, origin.lng);
      const destPt = project(destination.lat, destination.lng);

      // Draw glowing blue path for static view
      ctx.shadowColor = replayingTrip ? '#065f46' : '#3b82f6';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = replayingTrip ? 'rgba(16, 185, 129, 0.3)' : '#3b82f6'; // blue-500 / dim emerald
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(origPt.x, origPt.y);

      if (isInterstate) {
        // Curved highway route connecting states
        const midX = (origPt.x + destPt.x) / 2;
        const midY = (origPt.y + destPt.y) / 2 - Math.abs(origPt.x - destPt.x) * 0.15;
        ctx.quadraticCurveTo(midX, midY, destPt.x, destPt.y);
        ctx.stroke();

        // Reset shadows
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Draw progress overlay if a trip is running
        if (trip && trip.status !== 'IDLE' && trip.status !== 'COMPLETED' && !replayingTrip) {
          ctx.strokeStyle = '#e11d48'; // rose-600 indicator
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(origPt.x, origPt.y);
          ctx.quadraticCurveTo(midX, midY, destPt.x, destPt.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        const midX = origPt.x;
        const midY = destPt.y;

        ctx.lineTo(midX, midY);
        ctx.lineTo(destPt.x, destPt.y);
        ctx.stroke();

        // Reset shadows
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Draw dotted active progress overlay if a trip is running
        if (trip && trip.status !== 'IDLE' && trip.status !== 'COMPLETED' && !replayingTrip) {
          ctx.strokeStyle = '#e11d48'; // rose-600 indicator
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(origPt.x, origPt.y);
          ctx.lineTo(midX, midY);
          ctx.lineTo(destPt.x, destPt.y);
          ctx.stroke();
          ctx.setLineDash([]); // reset
        }
      }
    }

    // 3b. Draw Route Replay Polyline Animation (if replayingTrip is active)
    if (replayingTrip && origin && destination && replayProgress !== undefined) {
      const origPt = project(origin.lat, origin.lng);
      const destPt = project(destination.lat, destination.lng);

      // Compute current car position and traced path along the polyline
      let carPt = { x: origPt.x, y: origPt.y };

      if (isInterstate) {
        const midX = (origPt.x + destPt.x) / 2;
        const midY = (origPt.y + destPt.y) / 2 - Math.abs(origPt.x - destPt.x) * 0.15;

        // Draw animated glowing emerald traced route polyline up to replayProgress
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.beginPath();

        const steps = Math.max(2, Math.floor(replayProgress * 50));
        for (let i = 0; i <= steps; i++) {
          const t = (i / 50);
          const x = (1 - t) * (1 - t) * origPt.x + 2 * (1 - t) * t * midX + t * t * destPt.x;
          const y = (1 - t) * (1 - t) * origPt.y + 2 * (1 - t) * t * midY + t * t * destPt.y;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          if (i === steps) carPt = { x, y };
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      } else {
        const midX = origPt.x;
        const midY = destPt.y;

        const leg1Dist = Math.hypot(midX - origPt.x, midY - origPt.y);
        const leg2Dist = Math.hypot(destPt.x - midX, destPt.y - midY);
        const totalDist = leg1Dist + leg2Dist || 1;
        const ratio1 = leg1Dist / totalDist;

        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(origPt.x, origPt.y);

        if (replayProgress <= ratio1) {
          const t = replayProgress / (ratio1 || 1);
          carPt = {
            x: origPt.x + (midX - origPt.x) * t,
            y: origPt.y + (midY - origPt.y) * t,
          };
          ctx.lineTo(carPt.x, carPt.y);
        } else {
          const t = (replayProgress - ratio1) / ((1 - ratio1) || 1);
          carPt = {
            x: midX + (destPt.x - midX) * t,
            y: midY + (destPt.y - midY) * t,
          };
          ctx.lineTo(midX, midY);
          ctx.lineTo(carPt.x, carPt.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      // Draw Vehicle Badge at carPt during Replay
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(carPt.x, carPt.y, 18 + Math.sin(Date.now() / 90) * 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(carPt.x, carPt.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚕', carPt.x, carPt.y);

      // Label floating above vehicle
      ctx.fillStyle = '#09090b';
      ctx.fillRect(carPt.x - 45, carPt.y - 32, 90, 18);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.strokeRect(carPt.x - 45, carPt.y - 32, 90, 18);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText('TRACING ROUTE', carPt.x, carPt.y - 23);
    }

    // 4. Draw Landmarks (POIs) / Cities
    if (isInterstate) {
      CITIES.forEach((cCity, idx) => {
        const pt = project(cCity.center.lat, cCity.center.lng);
        const isHovered = idx === hoveredLandmark;

        // Draw landmark circle glow if hovered
        if (isHovered) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.15)'; // yellow-400 15%
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Check if this city corresponds to selected origin/destination
        const isOriginCity = origin && cCity.landmarks.some(l => l.label === origin.label);
        const isDestCity = destination && cCity.landmarks.some(l => l.label === destination.label);

        ctx.fillStyle = isHovered ? '#facc15' : isOriginCity ? '#22c55e' : isDestCity ? '#ef4444' : '#e4e4e7';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pulse ring for active endpoints
        if (isOriginCity || isDestCity) {
          ctx.strokeStyle = isOriginCity ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label text
        ctx.fillStyle = isHovered ? '#ffffff' : '#a1a1aa';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        const displayName = cCity.name.split(' (')[0];
        ctx.fillText(displayName, pt.x, pt.y - 12);
      });
    } else {
      city.landmarks.forEach((landmark, idx) => {
        const pt = project(landmark.lat, landmark.lng);
        const isHovered = idx === hoveredLandmark;

        // Draw landmark circle glow if hovered
        if (isHovered) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.15)'; // yellow-400 15%
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main Landmark dot
        ctx.fillStyle = isHovered ? '#facc15' : '#3f3f46'; // yellow-400 vs zinc-700
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ripple rings for active points
        if (
          (origin && origin.label === landmark.label) ||
          (destination && destination.label === landmark.label)
        ) {
          ctx.strokeStyle = origin && origin.label === landmark.label ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label text
        ctx.fillStyle = isHovered ? '#ffffff' : '#a1a1aa'; // text white vs zinc-400
        ctx.font = '500 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(landmark.label, pt.x, pt.y - 12);
      });
    }

    // 5. Draw Roaming Simulated Cars (when no active booking)
    if (!trip && !isDriverMode) {
      roamingCars.forEach((car) => {
        const pt = project(car.lat, car.lng);

        // Draw car triangle representing orientation heading
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(car.angle);

        // Vehicle glow
        ctx.fillStyle = '#facc15'; // yellow cab
        ctx.beginPath();
        // Triangle shape facing forward
        ctx.moveTo(8, 0);
        ctx.lineTo(-6, -5);
        ctx.lineTo(-6, 5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 6. Draw Rider Origin and Destination Pins
    if (origin) {
      const pt = project(origin.lat, origin.lng);
      ctx.fillStyle = '#22c55e'; // emerald-500
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pin core dot
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (destination) {
      const pt = project(destination.lat, destination.lng);
      ctx.fillStyle = '#ef4444'; // red-500
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pin inner
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Draw Trip Active Driver Vehicle (Rider Mode)
    if (trip && trip.status !== 'IDLE' && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED') {
      let pt = project(trip.currentPosition.lat, trip.currentPosition.lng);

      if (isInterstate) {
        // Calculate the position of the driver along the curved highway route
        const origPt = project(trip.origin.lat, trip.origin.lng);
        const destPt = project(trip.destination.lat, trip.destination.lng);
        const midX = (origPt.x + destPt.x) / 2;
        const midY = (origPt.y + destPt.y) / 2 - Math.abs(origPt.x - destPt.x) * 0.15;
        
        const t = trip.progress || 0;
        const x = (1 - t) * (1 - t) * origPt.x + 2 * (1 - t) * t * midX + t * t * destPt.x;
        const y = (1 - t) * (1 - t) * origPt.y + 2 * (1 - t) * t * midY + t * t * destPt.y;
        pt = { x, y };
      }

      // Pulse ring underneath the driver car
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 16 + Math.sin(Date.now() / 100) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Driver cab marker
      ctx.fillStyle = '#f59e0b'; // Amber
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner car letter symbol
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚕', pt.x, pt.y);
    }

    // 8. Draw Driver Position (Driver Mode)
    if (isDriverMode && driverPosition) {
      const pt = project(driverPosition.lat, driverPosition.lng);

      ctx.fillStyle = '#3b82f6'; // Bright blue
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Draw Completed Trips Starting Point Markers
    if (completedTrips && completedTrips.length > 0) {
      completedTrips.forEach((cTrip) => {
        if (!cTrip.origin) return;
        const pt = project(cTrip.origin.lat, cTrip.origin.lng);
        const isHovered = hoveredCompletedTrip?.id === cTrip.id;

        if (isHovered) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)'; // purple ring
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 16 + Math.sin(Date.now() / 120) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isHovered ? '#a855f7' : '#9333ea';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isHovered ? 10 : 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [dimensions, city, origin, destination, trip, completedTrips, isDriverMode, driverPosition, roamingCars, hoveredLandmark, hoveredCompletedTrip, travelMode]);

  // Request Animation Frame to animate elements smoothly (ripples, roaming cars)
  useEffect(() => {
    let animId: number;
    const tick = () => {
      // Re-trigger useEffect render via changing animation frame context
      // This is a standard low-overhead canvas animation tick
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Simply force canvas render to pick up Math.sin pulse effects
          setHoveredLandmark((prev) => prev);
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle canvas clicks to set Origin/Destination
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked near any landmark
    const clickGps = deproject(x, y);
    const isInterstate = travelMode === 'interstate';

    let foundCityIndex = -1;
    if (isInterstate) {
      CITIES.forEach((cCity, idx) => {
        const pt = project(cCity.center.lat, cCity.center.lng);
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < 25) {
          foundCityIndex = idx;
        }
      });
    } else {
      city.landmarks.forEach((lm, idx) => {
        const lmPt = project(lm.lat, lm.lng);
        const dist = Math.hypot(lmPt.x - x, lmPt.y - y);
        if (dist < 25) {
          foundCityIndex = idx;
        }
      });
    }

    if (foundCityIndex !== -1) {
      const targetLandmark = isInterstate ? CITIES[foundCityIndex].landmarks[0] : city.landmarks[foundCityIndex];
      const newLoc: Location = {
        lat: targetLandmark.lat,
        lng: targetLandmark.lng,
        label: targetLandmark.label,
      };

      // Set pickup (origin) first, then dropoff (destination)
      if (!origin) {
        setOrigin(newLoc);
      } else if (!destination && origin.label !== targetLandmark.label) {
        setDestination(newLoc);
      } else {
        // Swap or reset destination
        setDestination(newLoc);
      }
    } else {
      // Create a custom pin if clicked on blank space (only if origin or destination is missing)
      const clickedLoc: Location = {
        lat: clickGps.lat,
        lng: clickGps.lng,
        label: `Custom Pin (${clickGps.lat.toFixed(4)}, ${clickGps.lng.toFixed(4)})`,
      };

      if (!origin) {
        setOrigin(clickedLoc);
      } else if (!destination) {
        setDestination(clickedLoc);
      }
    }
  };

  // Handle mouse move to display cursors and hover states
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isInterstate = travelMode === 'interstate';

    let hoverIdx = -1;
    if (isInterstate) {
      CITIES.forEach((cCity, idx) => {
        const pt = project(cCity.center.lat, cCity.center.lng);
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < 20) {
          hoverIdx = idx;
        }
      });
    } else {
      city.landmarks.forEach((lm, idx) => {
        const lmPt = project(lm.lat, lm.lng);
        const dist = Math.hypot(lmPt.x - x, lmPt.y - y);
        if (dist < 20) {
          hoverIdx = idx;
        }
      });
    }

    setHoveredLandmark(hoverIdx !== -1 ? hoverIdx : null);

    // Check completed trips starting points hover
    let hoveredCTrip: Trip | null = null;
    let hoveredCTripPos: { x: number; y: number } | null = null;

    if (completedTrips && completedTrips.length > 0) {
      for (const cTrip of completedTrips) {
        if (!cTrip.origin) continue;
        const pt = project(cTrip.origin.lat, cTrip.origin.lng);
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < 18) {
          hoveredCTrip = cTrip;
          hoveredCTripPos = pt;
          break;
        }
      }
    }

    setHoveredCompletedTrip(hoveredCTrip);
    setHoveredCompletedTripPos(hoveredCTripPos);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="block"
        id="uber-city-canvas"
      />

      {/* Floating Canvas UI Overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        {/* Info panel */}
        <div className="bg-zinc-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800 text-zinc-300 text-xs flex items-center gap-2 max-w-[280px] pointer-events-auto shadow-lg">
          <Info size={14} className="text-zinc-400 shrink-0" />
          <span>
            Click landmarks or anywhere on map to drop <b>Pickup (green)</b> and <b>Dropoff (red)</b> pins!
          </span>
        </div>

        {/* API Key Instructions */}
        <div className="bg-zinc-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800/80 text-zinc-300 text-xs flex items-center gap-2 pointer-events-auto shadow-lg font-mono">
          <AlertCircle size={14} className="text-yellow-500 animate-pulse shrink-0" />
          <span>Simulation Map Fallback Active</span>
        </div>
      </div>

      {/* Interactive Tooltip Overlay for Completed Trips in Canvas Mode */}
      {hoveredCompletedTrip && hoveredCompletedTripPos && (
        <div
          style={{
            left: Math.min(Math.max(hoveredCompletedTripPos.x, 140), dimensions.width - 140),
            top: Math.max(hoveredCompletedTripPos.y - 12, 10)
          }}
          className="absolute -translate-x-1/2 -translate-y-full mb-2 w-64 bg-zinc-950/95 text-white border border-purple-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md z-40 pointer-events-none space-y-2 text-left animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-[10px] font-mono font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle size={12} className="text-purple-400" />
              Completed Trip #{hoveredCompletedTrip.id.slice(-6)}
            </span>
            <span className="text-emerald-400 font-extrabold text-xs font-mono">
              ₦{hoveredCompletedTrip.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || hoveredCompletedTrip.price}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <User size={11} className="text-zinc-400" />
                Driver:
              </span>
              <span className="font-bold text-white truncate max-w-[130px]">{hoveredCompletedTrip.driver?.name || 'Driver'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <Car size={11} className="text-zinc-400" />
                Vehicle:
              </span>
              <span className="font-mono text-zinc-200">{hoveredCompletedTrip.driver?.vehicleName || 'Standard'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <Clock size={11} className="text-amber-400" />
                Duration:
              </span>
              <span className="font-mono text-amber-400 font-extrabold">{hoveredCompletedTrip.durationMinutes || 15} mins ({hoveredCompletedTrip.distanceMiles || 0} km)</span>
            </div>
          </div>

          <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400 space-y-0.5">
            <div className="truncate"><strong className="text-emerald-400">Pickup:</strong> {hoveredCompletedTrip.origin?.label}</div>
            <div className="truncate"><strong className="text-rose-400">Dropoff:</strong> {hoveredCompletedTrip.destination?.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}
