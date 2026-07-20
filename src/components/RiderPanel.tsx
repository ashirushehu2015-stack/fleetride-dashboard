import React, { useState, useEffect, useRef } from 'react';
import { Location, VehicleConfig, Trip, ChatMessage } from '../types';
import { VEHICLE_CONFIGS, MOCK_DRIVER_CHATBOT_PHRASES, CITIES } from '../data';
import {
  MapPin,
  ChevronDown,
  Navigation,
  ArrowRight,
  Sparkles,
  Users,
  Car,
  Award,
  Bike,
  Search,
  MessageSquare,
  Phone,
  Star,
  X,
  CreditCard,
  Send,
  Check,
  RotateCcw,
  Clock
} from 'lucide-react';

interface RiderPanelProps {
  city: {
    id: string;
    name: string;
    landmarks: { lat: number; lng: number; label: string }[];
  };
  cities: { id: string; name: string }[];
  onCityChange: (cityId: string) => void;
  origin: Location | null;
  destination: Location | null;
  setOrigin: (loc: Location | null) => void;
  setDestination: (loc: Location | null) => void;
  trip: Trip | null;
  onBookTrip: (vehicleType: string, price: number, distance: number, duration: number) => void;
  onCancelTrip: () => void;
  onCompleteTripRating: (rating: number, review: string) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSurgeActive?: boolean;
  travelMode: 'municipal' | 'interstate';
  setTravelMode: (mode: 'municipal' | 'interstate') => void;
}

export default function RiderPanel({
  city,
  cities,
  onCityChange,
  origin,
  destination,
  setOrigin,
  setDestination,
  trip,
  onBookTrip,
  onCancelTrip,
  onCompleteTripRating,
  chatMessages,
  onSendMessage,
  isSurgeActive = false,
  travelMode,
  setTravelMode,
}: RiderPanelProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('X');
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedOriginCityId, setSelectedOriginCityId] = useState<string>(city.id);
  const [selectedDestCityId, setSelectedDestCityId] = useState<string>(
    cities.find((c) => c.id !== city.id)?.id || cities[0]?.id
  );

  // Sync cities if city changes
  useEffect(() => {
    if (travelMode === 'municipal') {
      setSelectedOriginCityId(city.id);
      setSelectedDestCityId(city.id);
    }
  }, [city, travelMode]);

  const handleModeSwitch = (mode: 'municipal' | 'interstate') => {
    setTravelMode(mode);
    setOrigin(null);
    setDestination(null);
    if (mode === 'municipal') {
      setSelectedOriginCityId(city.id);
      setSelectedDestCityId(city.id);
    } else {
      setSelectedOriginCityId(city.id);
      const otherCity = cities.find((c) => c.id !== city.id);
      if (otherCity) {
        setSelectedDestCityId(otherCity.id);
      }
    }
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  // Calculate distance & duration when origin or destination changes
  useEffect(() => {
    if (origin && destination) {
      let calculatedDistance = 0;
      if (travelMode === 'municipal') {
        const dLat = destination.lat - origin.lat;
        const dLng = destination.lng - origin.lng;
        calculatedDistance = Math.max(
          0.5,
          parseFloat((Math.sqrt(dLat * dLat + dLng * dLng) * 60).toFixed(1))
        );
      } else {
        // Haversine formula for out-of-state coordinates
        const R = 6371; // km
        const dLat = (destination.lat - origin.lat) * Math.PI / 180;
        const dLon = (destination.lng - origin.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(origin.lat * Math.PI / 180) *
            Math.cos(destination.lat * Math.PI / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        calculatedDistance = Math.max(45, Math.round(d * 1.35));
      }
      setDistance(calculatedDistance);

      // ETA calculation: municipal is 1.5 min/km + 2, interstate is average of 85km/h (approx 0.7 mins per km)
      const calculatedDuration =
        travelMode === 'municipal'
          ? Math.round(calculatedDistance * 1.5 + 2)
          : Math.round((calculatedDistance / 80) * 60);
      setDuration(calculatedDuration);
    } else {
      setDistance(0);
      setDuration(0);
    }
  }, [origin, destination, travelMode]);

  const getVehicleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car':
        return <Car size={20} className="text-zinc-100" />;
      case 'Sparkles':
        return <Sparkles size={20} className="text-zinc-100" />;
      case 'Users':
        return <Users size={20} className="text-zinc-100" />;
      case 'Award':
        return <Award size={20} className="text-zinc-100" />;
      case 'Bike':
        return <Bike size={20} className="text-zinc-100" />;
      default:
        return <Car size={20} className="text-zinc-100" />;
    }
  };

  const getPrice = (multiplier: number) => {
    if (distance === 0) return 0;
    if (travelMode === 'municipal') {
      // Flat rate ₦1350 base + ₦540 per km, scaled by multiplier
      let rawPrice = (4.5 + distance * 1.8) * multiplier * 300;
      if (isSurgeActive) {
        rawPrice *= 1.8;
      }
      return parseFloat(rawPrice.toFixed(2));
    } else {
      // Out of State rate: ₦12,000 base + ₦180 per km, scaled by multiplier
      let rawPrice = (12000 + distance * 180) * multiplier;
      if (isSurgeActive) {
        rawPrice *= 1.5; // interstate surge multiplier is gentler
      }
      return parseFloat(rawPrice.toFixed(2));
    }
  };

  const handleBookingSubmit = () => {
    const config = VEHICLE_CONFIGS.find((v) => v.id === selectedVehicle);
    if (!config) return;
    const finalPrice = getPrice(config.multiplier);
    onBookTrip(selectedVehicle, finalPrice, distance, duration);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  // Helper to swap locations
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Clear locations
  const handleClear = () => {
    setOrigin(null);
    setDestination(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[85vh] lg:max-h-[90vh]">
      {/* 1. HEADER & CITY PICKER */}
      <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white px-2 py-1 rounded-lg font-black tracking-tight text-xs uppercase">
            ZamTaxi
          </div>
          <span className="font-semibold text-zinc-200">Passenger Portal</span>
        </div>

        {/* City Switcher */}
        {!trip && (
          <div className="relative">
            <select
              value={city.id}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs py-1.5 px-3 rounded-lg border border-zinc-800 outline-none appearance-none pr-8 cursor-pointer font-medium"
              id="rider-city-picker"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ==========================================
            STATE A: IDLE & BOOKING SEARCH FORM
           ========================================== */}
        {!trip && (
          <>
            {/* Travel Class Toggle */}
            <div className="flex border border-zinc-150 p-1 rounded-xl bg-zinc-100/60">
              <button
                onClick={() => handleModeSwitch('municipal')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  travelMode === 'municipal'
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Municipal Travel
              </button>
              <button
                onClick={() => handleModeSwitch('interstate')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  travelMode === 'interstate'
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Out of State Travel
              </button>
            </div>

            {/* Location Selector Fields */}
            {travelMode === 'municipal' ? (
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-3 relative">
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-zinc-200" />

                {/* Origin / Pickup Selection */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Pick-up Location
                    </label>
                    <select
                      value={origin?.label || ''}
                      onChange={(e) => {
                        const found = city.landmarks.find((lm) => lm.label === e.target.value);
                        if (found) setOrigin({ lat: found.lat, lng: found.lng, label: found.label });
                        else if (e.target.value === '') setOrigin(null);
                      }}
                      className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-900"
                      id="pickup-landmark-dropdown"
                    >
                      <option value="" disabled>
                        Choose pickup location...
                      </option>
                      {city.landmarks.map((lm) => (
                        <option key={lm.label} value={lm.label} disabled={destination?.label === lm.label}>
                          {lm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {origin && (
                    <button
                      onClick={() => setOrigin(null)}
                      className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                      title="Clear"
                      id="clear-pickup-btn"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Destination / Dropoff Selection */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Where to? (Drop-off)
                    </label>
                    <select
                      value={destination?.label || ''}
                      onChange={(e) => {
                        const found = city.landmarks.find((lm) => lm.label === e.target.value);
                        if (found) setDestination({ lat: found.lat, lng: found.lng, label: found.label });
                        else if (e.target.value === '') setDestination(null);
                      }}
                      className="w-full bg-transparent border-b border-zinc-200 py-1 text-sm text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-900"
                      id="dropoff-landmark-dropdown"
                    >
                      <option value="" disabled>
                        Choose destination...
                      </option>
                      {city.landmarks.map((lm) => (
                        <option key={lm.label} value={lm.label} disabled={origin?.label === lm.label}>
                          {lm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {destination && (
                    <button
                      onClick={() => setDestination(null)}
                      className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                      title="Clear"
                      id="clear-dropoff-btn"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Swap and Clear Options */}
                {origin && destination && (
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100 text-xs">
                    <button
                      onClick={handleSwapLocations}
                      className="text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1 cursor-pointer"
                      id="swap-locations-btn"
                    >
                      <RotateCcw size={12} /> Swap Route
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                      id="clear-all-route-btn"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-4 relative">
                <div className="absolute left-6 top-16 bottom-16 w-0.5 bg-zinc-200" />

                {/* Inter-state Origin */}
                <div className="space-y-1">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 z-10 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                          Origin State
                        </label>
                        <select
                          value={selectedOriginCityId}
                          onChange={(e) => {
                            setSelectedOriginCityId(e.target.value);
                            setOrigin(null);
                          }}
                          className="w-full bg-transparent border-b border-zinc-200 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-900"
                        >
                          {CITIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name.split(' (')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                          Pickup Station
                        </label>
                        <select
                          value={origin?.label || ''}
                          onChange={(e) => {
                            const targetCity = CITIES.find(c => c.id === selectedOriginCityId);
                            const found = targetCity?.landmarks.find((lm) => lm.label === e.target.value);
                            if (found) setOrigin({ lat: found.lat, lng: found.lng, label: found.label });
                          }}
                          className="w-full bg-transparent border-b border-zinc-200 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-900"
                        >
                          <option value="" disabled>
                            Choose...
                          </option>
                          {CITIES.find(c => c.id === selectedOriginCityId)?.landmarks.map((lm) => (
                            <option key={lm.label} value={lm.label}>
                              {lm.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inter-state Destination */}
                <div className="space-y-1">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0 z-10 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                          Dest. State
                        </label>
                        <select
                          value={selectedDestCityId}
                          onChange={(e) => {
                            setSelectedDestCityId(e.target.value);
                            setDestination(null);
                          }}
                          className="w-full bg-transparent border-b border-zinc-200 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-900"
                        >
                          {CITIES.map((c) => (
                            <option key={c.id} value={c.id} disabled={c.id === selectedOriginCityId}>
                              {c.name.split(' (')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                          Drop-off Station
                        </label>
                        <select
                          value={destination?.label || ''}
                          onChange={(e) => {
                            const targetCity = CITIES.find(c => c.id === selectedDestCityId);
                            const found = targetCity?.landmarks.find((lm) => lm.label === e.target.value);
                            if (found) setDestination({ lat: found.lat, lng: found.lng, label: found.label });
                          }}
                          className="w-full bg-transparent border-b border-zinc-200 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-900"
                        >
                          <option value="" disabled>
                            Choose...
                          </option>
                          {CITIES.find(c => c.id === selectedDestCityId)?.landmarks.map((lm) => (
                            <option key={lm.label} value={lm.label}>
                              {lm.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swap and Clear Options */}
                {origin && destination && (
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100 text-xs">
                    <button
                      onClick={handleSwapLocations}
                      className="text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1 cursor-pointer"
                      id="swap-locations-btn"
                    >
                      <RotateCcw size={12} /> Swap Route
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                      id="clear-all-route-btn"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State Prompt */}
            {(!origin || !destination) && (
              <div className="py-6 text-center border-2 border-dashed border-zinc-100 rounded-xl">
                <Navigation size={28} className="mx-auto text-zinc-300 animate-pulse mb-2" />
                <h4 className="text-sm font-semibold text-zinc-700">Set Your Route</h4>
                <p className="text-xs text-zinc-400 max-w-[200px] mx-auto mt-1">
                  Select pickup and dropoff spots from the dropdown lists above, or click on the map!
                </p>
              </div>
            )}

            {/* Route Summary Stats */}
            {origin && destination && (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Distance</div>
                  <div className="text-base font-bold text-zinc-800">{distance} km</div>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Estimated Time</div>
                  <div className="text-base font-bold text-zinc-800">{duration} mins</div>
                </div>
              </div>
            )}

            {/* Vehicle Options Grid */}
            {origin && destination && (
              <div className="space-y-2">
                {isSurgeActive && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl flex items-center justify-between text-xs font-bold animate-pulse">
                    <span>⚡ Surge Pricing Active (1.8x)</span>
                    <span className="text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full">High Demand</span>
                  </div>
                )}
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Available Options</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {VEHICLE_CONFIGS.map((v) => {
                    const price = getPrice(v.multiplier);
                    const isSelected = selectedVehicle === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left cursor-pointer ${
                          isSelected
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-150 bg-white hover:bg-zinc-50 text-zinc-900'
                        }`}
                        id={`select-vehicle-${v.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-zinc-800' : 'bg-zinc-100'
                            }`}
                          >
                            {getVehicleIcon(v.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm">{v.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'
                                }`}
                              >
                                <Users size={8} className="inline mr-1" />
                                {v.capacity}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] truncate max-w-[150px] md:max-w-[190px] ${
                                isSelected ? 'text-zinc-300' : 'text-zinc-400'
                              }`}
                            >
                              {v.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-sm text-amber-500">₦{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div
                            className={`text-[10px] ${
                              isSelected ? 'text-zinc-300' : 'text-zinc-400'
                            } flex items-center justify-end gap-0.5`}
                          >
                            <Clock size={8} /> {v.etaMinutes}m away
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment & Book CTA */}
            {origin && destination && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1.5 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={14} className="text-zinc-400" />
                    <span className="font-medium">Personal Visa (•••• 4321)</span>
                  </div>
                  <span className="font-bold text-emerald-600">Promo Applied</span>
                </div>

                <button
                  onClick={handleBookingSubmit}
                  className="w-full bg-zinc-950 text-white font-semibold py-3.5 rounded-xl hover:bg-zinc-900 transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                  id="book-uber-ride-btn"
                >
                  Book {VEHICLE_CONFIGS.find((v) => v.id === selectedVehicle)?.name || 'UberX'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ==========================================
            STATE B: ACTIVE BOOKING - SEARCHING MATCH
           ========================================== */}
        {trip && trip.status === 'SEARCHING' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Spinning / Pulsing rings */}
              <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-zinc-900 animate-spin" />
              <div className="absolute w-24 h-24 rounded-full border border-zinc-200 animate-ping opacity-75" />
              <div className="bg-zinc-950 text-white p-5 rounded-full shadow-xl relative">
                <Car size={36} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-800 animate-pulse">Requesting a Ride...</h3>
              <p className="text-xs text-zinc-400 max-w-[240px] mx-auto">
                Finding the nearest matching driver in {city.name}. This usually takes a few seconds.
              </p>
            </div>

            {/* Details panel */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left w-full space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Selected:</span>
                <span className="font-bold text-zinc-800">
                  {VEHICLE_CONFIGS.find((v) => v.id === trip.vehicleType)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Route:</span>
                <span className="font-bold text-zinc-800 truncate max-w-[160px] text-right">
                  {trip.origin.label} → {trip.destination.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Fare:</span>
                <span className="font-bold text-amber-500">${trip.price.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCancelTrip}
              className="px-4 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/50 rounded-lg transition cursor-pointer"
              id="cancel-searching-btn"
            >
              Cancel Ride Request
            </button>
          </div>
        )}

        {/* ==========================================
            STATE C: ACTIVE TRIP (ACCEPTED, PICKING_UP, ARRIVED, IN_PROGRESS)
           ========================================== */}
        {trip &&
          trip.status !== 'IDLE' &&
          trip.status !== 'SEARCHING' &&
          trip.status !== 'COMPLETED' &&
          trip.status !== 'CANCELLED' && (
            <div className="space-y-4">
              {/* Trip Status Indicator banner */}
              <div
                className={`p-3.5 rounded-xl text-center text-xs font-bold shadow-sm ${
                  trip.status === 'ACCEPTED' || trip.status === 'PICKING_UP'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-200'
                    : trip.status === 'ARRIVED'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 animate-pulse'
                    : 'bg-blue-500/10 text-blue-600 border border-blue-200'
                }`}
              >
                {trip.status === 'ACCEPTED' && 'Driver matched! Heading to your pickup location'}
                {trip.status === 'PICKING_UP' && 'Driver is en route to you'}
                {trip.status === 'ARRIVED' && 'Driver has arrived at your pick-up point!'}
                {trip.status === 'TRIP_IN_PROGRESS' && 'Trip in progress - Heading to destination'}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Trip Progress</span>
                  <span className="text-zinc-800">{Math.round(trip.progress * 100)}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-zinc-950 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${trip.progress * 100}%` }}
                  />
                </div>
              </div>

              {/* Driver Identity Card */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={trip.driver.avatar}
                      alt={trip.driver.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-zinc-200 shrink-0 referrer-policy-no-referrer"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800">{trip.driver.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
                        <span>{trip.driver.rating.toFixed(2)}</span>
                        <span>•</span>
                        <span>{trip.driver.completedTrips} trips</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-zinc-200 text-zinc-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                      {trip.driver.plateNumber}
                    </span>
                    <p className="text-xs text-zinc-500 font-medium mt-1">{trip.driver.vehicleName}</p>
                  </div>
                </div>

                {/* Communication Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                      showChat
                        ? 'bg-zinc-950 border-zinc-950 text-white'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                    id="toggle-driver-chat-btn"
                  >
                    <MessageSquare size={14} />
                    {showChat ? 'Hide Chat' : 'Chat Driver'}
                    {chatMessages.length > 0 && !showChat && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                  <a
                    href={`tel:${trip.driver.phone}`}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Simulating phone call to driver: ${trip.driver.phone}`);
                    }}
                    className="py-2 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    id="call-driver-btn"
                  >
                    <Phone size={14} /> Call Driver
                  </a>
                </div>
              </div>

              {/* Chat Interface Drawer/Overlay */}
              {showChat && (
                <div className="bg-zinc-50 rounded-xl border border-zinc-150 overflow-hidden flex flex-col h-[280px]">
                  <div className="p-2.5 bg-zinc-900 text-white flex items-center justify-between text-xs">
                    <span className="font-semibold">Chatting with {trip.driver.name}</span>
                    <button
                      onClick={() => setShowChat(false)}
                      className="text-zinc-400 hover:text-white"
                      id="close-driver-chat-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Chat messages body */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-zinc-400 italic py-6">
                        No messages yet. Send a greeting to your driver!
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isRider = msg.sender === 'rider';
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isRider ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-xl px-3 py-2 ${
                                isRider
                                  ? 'bg-zinc-950 text-white rounded-br-none'
                                  : 'bg-zinc-200 text-zinc-800 rounded-bl-none'
                              }`}
                            >
                              <p className="leading-relaxed">{msg.text}</p>
                              <span
                                className={`text-[8px] block text-right mt-1 ${
                                  isRider ? 'text-zinc-400' : 'text-zinc-500'
                                }`}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Form */}
                  <form onSubmit={handleSendChatMessage} className="p-2 bg-white border-t border-zinc-200 flex gap-2">
                    <input
                      type="text"
                      placeholder="Send message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-zinc-100 rounded-lg px-3 py-1.5 text-xs outline-none text-zinc-800 focus:bg-zinc-50 border border-transparent focus:border-zinc-200"
                      id="driver-chat-input-field"
                    />
                    <button
                      type="submit"
                      className="bg-zinc-950 hover:bg-zinc-900 text-white p-1.5 rounded-lg shrink-0 flex items-center justify-center cursor-pointer"
                      id="submit-driver-chat-btn"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* Ride cancellation options */}
              <button
                onClick={onCancelTrip}
                className="w-full py-2.5 text-xs text-center border border-zinc-200 font-semibold rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                id="cancel-active-trip-btn"
              >
                Cancel Trip
              </button>
            </div>
          )}

        {/* ==========================================
            STATE D: TRIP COMPLETED & RATING CONSOLE
           ========================================== */}
        {trip && trip.status === 'COMPLETED' && (
          <div className="py-4 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner animate-bounce">
              <Check size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-800">You Have Arrived!</h3>
              <p className="text-xs text-zinc-400">
                Hope you enjoyed your ride in the {trip.driver.vehicleName}.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-left space-y-2.5">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Receipt Summary</div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Distance Travelled:</span>
                <span className="font-semibold text-zinc-800">{trip.distanceMiles} km</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Trip Duration:</span>
                <span className="font-semibold text-zinc-800">{trip.durationMinutes} mins</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-zinc-200">
                <span className="font-bold text-zinc-700">Total Charged:</span>
                <span className="font-bold text-emerald-600 text-sm">₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Rating Stars Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Rate {trip.driver.name}
              </span>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isGold = starVal <= rating;
                  return (
                    <button
                      key={starVal}
                      onClick={() => setRating(starVal)}
                      className="p-1 transition duration-150 transform hover:scale-125 cursor-pointer"
                      id={`rate-star-${starVal}`}
                    >
                      <Star
                        size={28}
                        className={isGold ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Review Form */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Add comments or feedback (optional)
              </label>
              <textarea
                placeholder="He was incredibly polite, clean car, or fastest route ever taken..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-zinc-50 text-xs border border-zinc-200 rounded-xl p-3 h-16 outline-none focus:bg-white focus:border-zinc-900 resize-none text-zinc-800"
                id="driver-feedback-textarea"
              />
            </div>

            <button
              onClick={() => {
                onCompleteTripRating(rating, reviewText);
                setReviewText('');
                setRating(5);
              }}
              className="w-full bg-zinc-950 text-white font-semibold py-3 rounded-xl hover:bg-zinc-900 transition flex items-center justify-center gap-1 text-xs shadow-md cursor-pointer"
              id="submit-rating-and-review-btn"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-zinc-50 p-2.5 text-center text-[10px] text-zinc-400 border-t border-zinc-150 flex items-center justify-center gap-1 font-mono">
        <span>Payment Method secured by Stripe Proxy</span>
      </div>
    </div>
  );
}
