import React, { useState, useEffect, useRef } from 'react';
import { Location, VehicleConfig, Trip, ChatMessage, UserProfile } from '../types';
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
  Clock,
  Wallet,
  Building2,
  Smartphone,
  Ticket,
  Copy,
  Plus,
  History,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle
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
  profile?: UserProfile;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  passengers?: any[];
  setPassengers?: React.Dispatch<React.SetStateAction<any[]>>;
  addAuditLog?: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
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
  profile,
  setProfile,
  passengers,
  setPassengers,
  addAuditLog,
}: RiderPanelProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('X');
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Passenger Navigation & Wallet Sub-states
  const [activeRiderSubTab, setActiveRiderSubTab] = useState<'booking' | 'wallet'>('booking');
  const [walletSubSection, setWalletSubSection] = useState<'deposit' | 'transfer' | 'history'>('deposit');
  
  // Deposit State
  const [depositMethod, setDepositMethod] = useState<'bank_transfer' | 'card' | 'ussd' | 'voucher'>('bank_transfer');
  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [copiedVirtualAcc, setCopiedVirtualAcc] = useState<boolean>(false);
  const [copiedUSSD, setCopiedUSSD] = useState<boolean>(false);
  const [cardNo, setCardNo] = useState<string>('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvv, setCardCvv] = useState<string>('892');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [depositStatusMsg, setDepositStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Transfer Fare State
  const [transferRecipientPhone, setTransferRecipientPhone] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('2500');
  const [transferNote, setTransferNote] = useState<string>('');
  const [transferStatusMsg, setTransferStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Wallet Transaction History
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('zamfara_rider_txs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'tx-101',
        type: 'deposit',
        title: 'Bank Transfer Deposit',
        amount: 25000.00,
        timestamp: 'Today, 09:15 AM',
        status: 'COMPLETED',
        reference: 'ZMF-DEP-948201',
        method: 'FirstBank Transfer'
      },
      {
        id: 'tx-102',
        type: 'fare_payment',
        title: 'ZamTaxi Green - Gusau Municipal Ride',
        amount: -3450.00,
        timestamp: 'Yesterday, 04:30 PM',
        status: 'COMPLETED',
        reference: 'ZMF-TRIP-731092',
        method: 'Wallet Auto-Deduct'
      },
      {
        id: 'tx-103',
        type: 'deposit',
        title: 'Welcome Promo Voucher (ZAMFARA2026)',
        amount: 5000.00,
        timestamp: 'Jul 20, 2026',
        status: 'COMPLETED',
        reference: 'ZMF-PROMO-109283',
        method: 'Admin Voucher'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('zamfara_rider_txs', JSON.stringify(transactions));
  }, [transactions]);

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

  // Deposit Action Logic
  const handleDepositSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDepositStatusMsg(null);
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepositStatusMsg({ type: 'error', text: 'Please enter a valid deposit amount greater than ₦0.' });
      return;
    }

    let methodLabel = 'Bank Transfer';
    if (depositMethod === 'card') methodLabel = 'Debit Card';
    if (depositMethod === 'ussd') methodLabel = 'USSD Deposit';
    if (depositMethod === 'voucher') {
      const code = voucherCode.trim().toUpperCase();
      if (!code) {
        setDepositStatusMsg({ type: 'error', text: 'Please enter a valid voucher code.' });
        return;
      }
      if (code !== 'ZAMFARA2026' && code !== 'GUSAUFREE' && code !== 'FREEFARE') {
        setDepositStatusMsg({ type: 'error', text: 'Invalid or expired voucher code. Try ZAMFARA2026 or GUSAUFREE.' });
        return;
      }
      methodLabel = `Voucher (${code})`;
    }

    const currentBal = profile?.balance ?? 50000;
    const newBalance = parseFloat((currentBal + amt).toFixed(2));

    // Update profile balance
    if (setProfile) {
      setProfile((prev) => ({
        ...prev,
        balance: newBalance
      }));
    }

    // Sync matching passenger in passengers array
    if (setPassengers && profile) {
      setPassengers((prevList) =>
        prevList.map((p) => (p.name === profile.name ? { ...p, balance: newBalance } : p))
      );
    }

    // Add transaction record
    const newTx = {
      id: 'tx-' + Math.random().toString(36).substr(2, 8),
      type: 'deposit',
      title: `Deposit via ${methodLabel}`,
      amount: amt,
      timestamp: 'Just now',
      status: 'COMPLETED',
      reference: 'ZMF-DEP-' + Math.floor(100000 + Math.random() * 900000),
      method: methodLabel
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (addAuditLog && profile) {
      addAuditLog('RIDER', `Passenger ${profile.name} deposited ₦${amt.toLocaleString()} via ${methodLabel}. New balance: ₦${newBalance.toLocaleString()}`);
    }

    setDepositStatusMsg({
      type: 'success',
      text: `Successfully deposited ₦${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} into your wallet! New balance: ₦${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    });
  };

  // Transfer Fare Action Logic
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferStatusMsg(null);
    const amt = parseFloat(transferAmount);
    const currentBal = profile?.balance ?? 50000;

    if (isNaN(amt) || amt <= 0) {
      setTransferStatusMsg({ type: 'error', text: 'Please enter a valid transfer amount.' });
      return;
    }

    if (amt > currentBal) {
      setTransferStatusMsg({ type: 'error', text: `Insufficient wallet balance. You have ₦${currentBal.toLocaleString()}, but tried to send ₦${amt.toLocaleString()}.` });
      return;
    }

    const recipientName = transferRecipientPhone || 'Bello Matawalle (+234 806 444 5566)';
    const newBalance = parseFloat((currentBal - amt).toFixed(2));

    // Update profile balance
    if (setProfile) {
      setProfile((prev) => ({
        ...prev,
        balance: newBalance
      }));
    }

    // Update passenger list
    if (setPassengers && profile) {
      setPassengers((prevList) =>
        prevList.map((p) => {
          if (p.name === profile.name) return { ...p, balance: newBalance };
          if (transferRecipientPhone && (p.phone === transferRecipientPhone || p.id === transferRecipientPhone || p.email === transferRecipientPhone)) {
            return { ...p, balance: parseFloat((p.balance + amt).toFixed(2)) };
          }
          return p;
        })
      );
    }

    // Add transaction
    const newTx = {
      id: 'tx-' + Math.random().toString(36).substr(2, 8),
      type: 'transfer_out',
      title: `Fare Transfer to ${recipientName}`,
      amount: -amt,
      timestamp: 'Just now',
      status: 'COMPLETED',
      reference: 'ZMF-TRF-' + Math.floor(100000 + Math.random() * 900000),
      method: 'Wallet Transfer'
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (addAuditLog && profile) {
      addAuditLog('RIDER', `Passenger ${profile.name} transferred fare ₦${amt.toLocaleString()} to ${recipientName}. Note: ${transferNote || 'N/A'}`);
    }

    setTransferStatusMsg({
      type: 'success',
      text: `Transfer successful! ₦${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} sent to ${recipientName}.`
    });
    setTransferNote('');
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
      let rawPrice = (4.5 + distance * 1.8) * multiplier * 300;
      if (isSurgeActive) {
        rawPrice *= 1.8;
      }
      return parseFloat(rawPrice.toFixed(2));
    } else {
      let rawPrice = (12000 + distance * 180) * multiplier;
      if (isSurgeActive) {
        rawPrice *= 1.5;
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

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleClear = () => {
    setOrigin(null);
    setDestination(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-[#E5DFD3] max-h-[85vh] lg:max-h-[90vh]">
      {/* 1. HEADER & SUB-NAVIGATION TABS */}
      <div className="p-4 bg-[#FAF7F2] text-zinc-900 space-y-3 border-b border-[#E5DFD3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-700 text-white px-2 py-1 rounded-lg font-black tracking-tight text-xs uppercase shadow-xs">
              ZamTaxi
            </div>
            <span className="font-bold text-zinc-900">Passenger Portal</span>
          </div>

          {/* City Switcher */}
          {!trip && activeRiderSubTab === 'booking' && (
            <div className="relative">
              <select
                value={city.id}
                onChange={(e) => onCityChange(e.target.value)}
                className="bg-white hover:bg-[#F2EDE4] text-zinc-900 text-xs py-1.5 px-3 rounded-lg border border-[#E5DFD3] outline-none appearance-none pr-8 cursor-pointer font-bold shadow-xs"
                id="rider-city-picker"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* SubTab Toggle Bar */}
        {!trip && (
          <div className="flex bg-[#E5DFD3]/60 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveRiderSubTab('booking')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRiderSubTab === 'booking'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-white/50'
              }`}
              id="rider-tab-book-ride"
            >
              <Car size={14} />
              Book Ride
            </button>
            <button
              type="button"
              onClick={() => setActiveRiderSubTab('wallet')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRiderSubTab === 'wallet'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-white/50'
              }`}
              id="rider-tab-passenger-wallet"
            >
              <Wallet size={14} />
              Passenger Wallet
              <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-mono font-black ml-1">
                ₦{(profile?.balance ?? 50000).toLocaleString()}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {/* ==========================================
            STATE A: IDLE & BOOKING SEARCH FORM
           ========================================== */}
        {!trip && activeRiderSubTab === 'booking' && (
          <>
            {/* Travel Class Toggle */}
            <div className="flex border border-[#E5DFD3] p-1 rounded-xl bg-[#F2EDE4]">
              <button
                onClick={() => handleModeSwitch('municipal')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  travelMode === 'municipal'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                Municipal Travel
              </button>
              <button
                onClick={() => handleModeSwitch('interstate')}
                className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  travelMode === 'interstate'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                Out of State Travel
              </button>
            </div>

            {/* Location Selector Fields */}
            {travelMode === 'municipal' ? (
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DFD3] space-y-3 relative">
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#E5DFD3]" />

                {/* Origin / Pickup Selection */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
                      Pick-up Location
                    </label>
                    <select
                      value={origin?.label || ''}
                      onChange={(e) => {
                        const found = city.landmarks.find((lm) => lm.label === e.target.value);
                        if (found) setOrigin({ lat: found.lat, lng: found.lng, label: found.label });
                        else if (e.target.value === '') setOrigin(null);
                      }}
                      className="w-full bg-transparent border-b border-[#E5DFD3] py-1 text-sm text-zinc-900 font-bold outline-none cursor-pointer focus:border-zinc-900"
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
                      className="text-zinc-500 hover:text-zinc-800 p-1 cursor-pointer"
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
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
                      Where to? (Drop-off)
                    </label>
                    <select
                      value={destination?.label || ''}
                      onChange={(e) => {
                        const found = city.landmarks.find((lm) => lm.label === e.target.value);
                        if (found) setDestination({ lat: found.lat, lng: found.lng, label: found.label });
                        else if (e.target.value === '') setDestination(null);
                      }}
                      className="w-full bg-transparent border-b border-[#E5DFD3] py-1 text-sm text-zinc-900 font-bold outline-none cursor-pointer focus:border-zinc-900"
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
                      className="text-zinc-500 hover:text-zinc-800 p-1 cursor-pointer"
                      title="Clear"
                      id="clear-dropoff-btn"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Swap and Clear Options */}
                {origin && destination && (
                  <div className="flex justify-between items-center pt-2 border-t border-[#E5DFD3] text-xs">
                    <button
                      onClick={handleSwapLocations}
                      className="text-zinc-700 hover:text-zinc-900 font-bold flex items-center gap-1 cursor-pointer"
                      id="swap-locations-btn"
                    >
                      <RotateCcw size={12} /> Swap Route
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-zinc-600 hover:text-zinc-900 font-semibold cursor-pointer"
                      id="clear-all-route-btn"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DFD3] space-y-4 relative">
                <div className="absolute left-6 top-16 bottom-16 w-0.5 bg-[#E5DFD3]" />

                {/* Inter-state Origin */}
                <div className="space-y-1">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 z-10 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-600 tracking-wider">
                          Origin State
                        </label>
                        <select
                          value={selectedOriginCityId}
                          onChange={(e) => {
                            setSelectedOriginCityId(e.target.value);
                            setOrigin(null);
                          }}
                          className="w-full bg-transparent border-b border-[#E5DFD3] py-1 text-xs text-zinc-900 font-bold outline-none cursor-pointer focus:border-zinc-900"
                        >
                          {CITIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name.split(' (')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-600 tracking-wider">
                          Pickup Station
                        </label>
                        <select
                          value={origin?.label || ''}
                          onChange={(e) => {
                            const targetCity = CITIES.find(c => c.id === selectedOriginCityId);
                            const found = targetCity?.landmarks.find((lm) => lm.label === e.target.value);
                            if (found) setOrigin({ lat: found.lat, lng: found.lng, label: found.label });
                          }}
                          className="w-full bg-transparent border-b border-[#E5DFD3] py-1 text-xs text-zinc-900 font-bold outline-none cursor-pointer focus:border-zinc-900"
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
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-600 tracking-wider">
                          Dest. State
                        </label>
                        <select
                          value={selectedDestCityId}
                          onChange={(e) => {
                            setSelectedDestCityId(e.target.value);
                            setDestination(null);
                          }}
                          className="w-full bg-transparent border-b border-[#E5DFD3] py-1 text-xs text-zinc-900 font-bold outline-none cursor-pointer focus:border-zinc-900"
                        >
                          {CITIES.map((c) => (
                            <option key={c.id} value={c.id} disabled={c.id === selectedOriginCityId}>
                              {c.name.split(' (')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-zinc-600 tracking-wider">
                          Drop-off Station
                        </label>
                        <select
                          value={destination?.label || ''}
                          onChange={(e) => {
                            const targetCity = CITIES.find(c => c.id === selectedDestCityId);
                            const found = targetCity?.landmarks.find((lm) => lm.label === e.target.value);
                            if (found) setDestination({ lat: found.lat, lng: found.lng, label: found.label });
                          }}
                          className="w-full bg-transparent border-b border-[#E5DFD3] py-1 text-xs text-zinc-900 font-bold outline-none cursor-pointer focus:border-zinc-900"
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
                  <div className="flex justify-between items-center pt-2 border-t border-[#E5DFD3] text-xs">
                    <button
                      onClick={handleSwapLocations}
                      className="text-zinc-700 hover:text-zinc-900 font-bold flex items-center gap-1 cursor-pointer"
                      id="swap-locations-btn"
                    >
                      <RotateCcw size={12} /> Swap Route
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-zinc-600 hover:text-zinc-900 font-semibold cursor-pointer"
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
              <div className="py-6 text-center border-2 border-dashed border-[#E5DFD3] bg-[#FAF7F2]/50 rounded-xl">
                <Navigation size={28} className="mx-auto text-zinc-400 animate-pulse mb-2" />
                <h4 className="text-sm font-extrabold text-zinc-900">Set Your Route</h4>
                <p className="text-xs text-zinc-600 max-w-[200px] mx-auto mt-1 font-medium">
                  Select pickup and dropoff spots from the dropdown lists above, or click on the map!
                </p>
              </div>
            )}

            {/* Route Summary Stats */}
            {origin && destination && (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DFD3]">
                  <div className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Distance</div>
                  <div className="text-base font-extrabold text-zinc-900">{distance} km</div>
                </div>
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DFD3]">
                  <div className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Estimated Time</div>
                  <div className="text-base font-extrabold text-zinc-900">{duration} mins</div>
                </div>
              </div>
            )}

            {/* Vehicle Options Grid */}
            {origin && destination && (
              <div className="space-y-2">
                {isSurgeActive && (
                  <div className="p-3 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-between text-xs font-bold animate-pulse shadow-xs">
                    <span>⚡ Surge Pricing Active (1.8x)</span>
                    <span className="text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-extrabold">High Demand</span>
                  </div>
                )}
                <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Available Options</h4>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {VEHICLE_CONFIGS.map((v) => {
                    const price = getPrice(v.multiplier);
                    const isSelected = selectedVehicle === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left cursor-pointer ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                            : 'border-[#E5DFD3] bg-white hover:bg-[#FAF7F2] text-zinc-900'
                        }`}
                        id={`select-vehicle-${v.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-zinc-800' : 'bg-[#F2EDE4]'
                            }`}
                          >
                            {getVehicleIcon(v.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm">{v.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-[#F2EDE4] text-zinc-700'
                                }`}
                              >
                                <Users size={8} className="inline mr-1" />
                                {v.capacity}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] truncate max-w-[150px] md:max-w-[190px] ${
                                isSelected ? 'text-zinc-300' : 'text-zinc-600 font-medium'
                              }`}
                            >
                              {v.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-extrabold text-sm ${isSelected ? 'text-amber-300' : 'text-amber-700'}`}>₦{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div
                            className={`text-[10px] ${
                              isSelected ? 'text-zinc-300' : 'text-zinc-500 font-semibold'
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
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DFD3] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                      <Wallet size={15} className="text-emerald-700" />
                      <span>ZamTaxi Fare Wallet:</span>
                    </div>
                    <span className="font-black text-emerald-800 text-sm">
                      ₦{(profile?.balance ?? 50000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {(profile?.balance ?? 50000) < getPrice(VEHICLE_CONFIGS.find(v => v.id === selectedVehicle)?.multiplier || 1) ? (
                    <div className="flex items-center justify-between text-xs bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 font-bold">
                      <span>⚠️ Low wallet balance for this ride</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRiderSubTab('wallet');
                          setWalletSubSection('deposit');
                        }}
                        className="text-[10px] bg-emerald-700 text-white px-2.5 py-1 rounded-md font-extrabold cursor-pointer hover:bg-emerald-800"
                      >
                        Top Up Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-800 font-bold flex items-center justify-between">
                      <span>✓ Auto-deducted from Passenger Wallet</span>
                      <span className="text-zinc-600 font-normal">Promo Active</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBookingSubmit}
                  className="w-full bg-zinc-900 text-white font-extrabold py-3.5 rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                  id="book-uber-ride-btn"
                >
                  Book {VEHICLE_CONFIGS.find((v) => v.id === selectedVehicle)?.name || 'ZamTaxi Green'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ==========================================
            STATE A2: PASSENGER WALLET & DEPOSITS VIEW
           ========================================== */}
        {!trip && activeRiderSubTab === 'wallet' && (
          <div className="space-y-4 py-1">
            {/* WALLET HERO CARD */}
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block">
                      Passenger Wallet ID
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      {profile?.name || 'Ashiru Shehu'} (ZMF-3098172654)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Verified
                </span>
              </div>

              <div className="pt-2 pb-1 border-t border-zinc-800">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">Available Fare Balance</span>
                <div className="text-3xl font-black text-white mt-0.5 flex items-baseline gap-1">
                  <span className="text-emerald-400 font-sans">₦</span>
                  {(profile?.balance ?? 50000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Quick Sub-navigation */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setWalletSubSection('deposit')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    walletSubSection === 'deposit'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200'
                  }`}
                  id="wallet-sub-deposit"
                >
                  <Plus size={14} />
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setWalletSubSection('transfer')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    walletSubSection === 'transfer'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200'
                  }`}
                  id="wallet-sub-transfer"
                >
                  <ArrowLeftRight size={14} />
                  Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setWalletSubSection('history')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    walletSubSection === 'history'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200'
                  }`}
                  id="wallet-sub-history"
                >
                  <History size={14} />
                  History
                </button>
              </div>
            </div>

            {/* SECTION 1: DEPOSIT FARE FUNDS */}
            {walletSubSection === 'deposit' && (
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Plus size={15} className="text-emerald-700" />
                    Deposit Transfer Fare
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-600">Instant Wallet Top-up</span>
                </div>

                {depositStatusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 shadow-xs ${
                      depositStatusMsg.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {depositStatusMsg.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-700 shrink-0 mt-0.5" />
                    )}
                    <span>{depositStatusMsg.text}</span>
                  </div>
                )}

                {/* Deposit Method Selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('bank_transfer')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-18 ${
                      depositMethod === 'bank_transfer'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                        : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <Building2 size={16} className={depositMethod === 'bank_transfer' ? 'text-emerald-400' : 'text-zinc-600'} />
                    <div>
                      <span className="block text-xs font-black">Bank Transfer</span>
                      <span className="text-[9px] opacity-75 font-semibold">Virtual Account</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('card')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-18 ${
                      depositMethod === 'card'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                        : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <CreditCard size={16} className={depositMethod === 'card' ? 'text-emerald-400' : 'text-zinc-600'} />
                    <div>
                      <span className="block text-xs font-black">Debit/Credit Card</span>
                      <span className="text-[9px] opacity-75 font-semibold">Instant Pay</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('ussd')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-18 ${
                      depositMethod === 'ussd'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                        : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <Smartphone size={16} className={depositMethod === 'ussd' ? 'text-emerald-400' : 'text-zinc-600'} />
                    <div>
                      <span className="block text-xs font-black">USSD Code</span>
                      <span className="text-[9px] opacity-75 font-semibold">*894# Bank Code</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('voucher')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-18 ${
                      depositMethod === 'voucher'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                        : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <Ticket size={16} className={depositMethod === 'voucher' ? 'text-emerald-400' : 'text-zinc-600'} />
                    <div>
                      <span className="block text-xs font-black">Promo Voucher</span>
                      <span className="text-[9px] opacity-75 font-semibold">Bonus Deposit</span>
                    </div>
                  </button>
                </div>

                {/* BANK TRANSFER DEPOSIT FORM */}
                {depositMethod === 'bank_transfer' && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-white p-3.5 rounded-xl border border-[#E5DFD3] space-y-2.5">
                      <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-2">
                        <span className="text-zinc-600 font-bold">Bank Name:</span>
                        <span className="font-black text-zinc-900">FirstBank Nigeria / Zenith Bank</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-2">
                        <span className="text-zinc-600 font-bold">Account Name:</span>
                        <span className="font-black text-zinc-900">ZamTaxi Passenger Wallet - {profile?.name || 'Ashiru Shehu'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 font-bold">Virtual Account No:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-emerald-800 text-sm tracking-wider">3098172654</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText('3098172654');
                              setCopiedVirtualAcc(true);
                              setTimeout(() => setCopiedVirtualAcc(false), 2500);
                            }}
                            className="p-1 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedVirtualAcc ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Deposit Preset Chips */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">
                        Quick Preset Deposit Amount
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['2000', '5000', '10000', '20000', '50000'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer border ${
                              depositAmount === amt
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-white text-zinc-800 border-[#E5DFD3] hover:bg-[#F2EDE4]'
                            }`}
                          >
                            ₦{parseInt(amt).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">
                        Custom Deposit Amount (₦)
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2.5 text-sm font-black text-zinc-900 outline-none focus:border-zinc-900"
                        id="custom-deposit-amount-input"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDepositSubmit()}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                      id="confirm-bank-deposit-btn"
                    >
                      <CheckCircle2 size={16} />
                      Complete Bank Deposit (Credit ₦{parseFloat(depositAmount || '0').toLocaleString()})
                    </button>
                  </div>
                )}

                {/* CARD DEPOSIT FORM */}
                {depositMethod === 'card' && (
                  <form onSubmit={handleDepositSubmit} className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">Card Number</label>
                      <input
                        type="text"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value)}
                        className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-900 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-900 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">Deposit Amount (₦)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-black text-zinc-900 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                      id="confirm-card-deposit-btn"
                    >
                      <CreditCard size={15} />
                      Pay ₦{parseFloat(depositAmount || '0').toLocaleString()} via Debit Card
                    </button>
                  </form>
                )}

                {/* USSD DEPOSIT */}
                {depositMethod === 'ussd' && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-white p-4 rounded-xl border border-[#E5DFD3] text-center space-y-2">
                      <span className="text-xs font-bold text-zinc-600 block">Dial USSD string on your mobile phone:</span>
                      <div className="p-3 bg-zinc-950 text-emerald-400 font-mono font-extrabold text-base rounded-xl tracking-wider flex items-center justify-center gap-3">
                        <span>*894*{depositAmount || '5000'}*3098172654#</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(`*894*${depositAmount || '5000'}*3098172654#`);
                            setCopiedUSSD(true);
                            setTimeout(() => setCopiedUSSD(false), 2500);
                          }}
                          className="text-white hover:text-emerald-300 p-1 cursor-pointer"
                        >
                          {copiedUSSD ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium">Supported by FirstBank, GTBank, Zenith, UBA, & Access Bank.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDepositSubmit()}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                      id="confirm-ussd-deposit-btn"
                    >
                      Confirm USSD Deposit Completed
                    </button>
                  </div>
                )}

                {/* PROMO VOUCHER DEPOSIT */}
                {depositMethod === 'voucher' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">Voucher / Promo Code</label>
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="e.g. ZAMFARA2026 or GUSAUFREE"
                        className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2.5 text-xs font-mono font-extrabold uppercase text-zinc-900 outline-none"
                        id="voucher-code-input"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      💡 Tip: Try code <span className="font-mono underline">ZAMFARA2026</span> (+₦5,000) or <span className="font-mono underline">GUSAUFREE</span> (+₦10,000).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDepositAmount(voucherCode.toUpperCase() === 'GUSAUFREE' ? '10000' : '5000');
                        handleDepositSubmit();
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                      id="redeem-voucher-btn"
                    >
                      <Ticket size={15} />
                      Redeem Voucher
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: TRANSFER FARE */}
            {walletSubSection === 'transfer' && (
              <form onSubmit={handleTransferSubmit} className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <ArrowLeftRight size={15} className="text-emerald-700" />
                    Transfer Fare to Passenger or Driver
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-600">Zero Commission Fee</span>
                </div>

                {transferStatusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 shadow-xs ${
                      transferStatusMsg.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {transferStatusMsg.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-700 shrink-0 mt-0.5" />
                    )}
                    <span>{transferStatusMsg.text}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">
                    Select Recipient
                  </label>
                  <select
                    value={transferRecipientPhone}
                    onChange={(e) => setTransferRecipientPhone(e.target.value)}
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 outline-none cursor-pointer"
                    id="transfer-recipient-select"
                  >
                    <option value="">Bello Matawalle (+234 806 444 5566)</option>
                    <option value="diana@transit.ng">Diana Prince (+234 813 999 8888)</option>
                    <option value="driver-1">Michael Scott (ZamTaxi EV Driver)</option>
                    {passengers && passengers.filter(p => p.name !== profile?.name).map(p => (
                      <option key={p.id} value={p.phone || p.id}>
                        {p.name} ({p.phone || p.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">
                    Transfer Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-sm font-black text-zinc-900 outline-none"
                    id="transfer-amount-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">
                    Narration / Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="e.g. Fare contribution for Abuja interstate trip"
                    className="w-full bg-white border border-[#E5DFD3] rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-900 outline-none"
                    id="transfer-note-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                  id="confirm-send-transfer-btn"
                >
                  <Send size={15} />
                  Confirm & Send ₦{parseFloat(transferAmount || '0').toLocaleString()}
                </button>
              </form>
            )}

            {/* SECTION 3: TRANSACTION HISTORY */}
            {walletSubSection === 'history' && (
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <History size={15} className="text-emerald-700" />
                    Wallet Transaction History
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-600">{transactions.length} Records</span>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <div key={tx.id} className="bg-white p-3 rounded-xl border border-[#E5DFD3] flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCredit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <span className="font-extrabold text-zinc-900 block">{tx.title}</span>
                            <span className="text-[10px] text-zinc-500 font-mono font-bold block">{tx.reference} • {tx.timestamp}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-black text-sm block ${isCredit ? 'text-emerald-700' : 'text-zinc-900'}`}>
                            {isCredit ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] uppercase font-mono font-bold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            STATE B: ACTIVE BOOKING - SEARCHING MATCH
           ========================================== */}
        {trip && trip.status === 'SEARCHING' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Spinning / Pulsing rings */}
              <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-zinc-900 animate-spin" />
              <div className="absolute w-24 h-24 rounded-full border border-zinc-300 animate-ping opacity-75" />
              <div className="bg-zinc-900 text-white p-5 rounded-full shadow-xl relative">
                <Car size={36} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-zinc-900 animate-pulse">Requesting a Ride...</h3>
              <p className="text-xs text-zinc-600 font-medium max-w-[240px] mx-auto">
                Finding the nearest matching driver in {city.name}. This usually takes a few seconds.
              </p>
            </div>

            {/* Details panel */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] text-left w-full space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600 font-medium">Selected:</span>
                <span className="font-extrabold text-zinc-900">
                  {VEHICLE_CONFIGS.find((v) => v.id === trip.vehicleType)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 font-medium">Route:</span>
                <span className="font-extrabold text-zinc-900 truncate max-w-[160px] text-right">
                  {trip.origin.label} → {trip.destination.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 font-medium">Fare:</span>
                <span className="font-extrabold text-amber-700">₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={onCancelTrip}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition border border-rose-200 cursor-pointer"
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
                className={`p-3.5 rounded-xl text-center text-xs font-bold shadow-xs ${
                  trip.status === 'ACCEPTED' || trip.status === 'PICKING_UP'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : trip.status === 'ARRIVED'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}
              >
                {trip.status === 'ACCEPTED' && 'Driver matched! Heading to your pickup location'}
                {trip.status === 'PICKING_UP' && 'Driver is en route to you'}
                {trip.status === 'ARRIVED' && 'Driver has arrived at your pick-up point!'}
                {trip.status === 'TRIP_IN_PROGRESS' && 'Trip in progress - Heading to destination'}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                  <span>Trip Progress</span>
                  <span className="text-zinc-900 font-extrabold">{Math.round(trip.progress * 100)}%</span>
                </div>
                <div className="w-full bg-[#F2EDE4] rounded-full h-2.5 overflow-hidden border border-[#E5DFD3]">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${trip.progress * 100}%` }}
                  />
                </div>
              </div>

              {/* Driver Identity Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={trip.driver.avatar}
                      alt={trip.driver.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E5DFD3] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-900">{trip.driver.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-zinc-600 font-semibold">
                        <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                        <span>{trip.driver.rating.toFixed(2)}</span>
                        <span>•</span>
                        <span>{trip.driver.completedTrips} trips</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-zinc-900 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
                      {trip.driver.plateNumber}
                    </span>
                    <p className="text-xs text-zinc-600 font-bold mt-1">{trip.driver.vehicleName}</p>
                  </div>
                </div>

                {/* Communication Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DFD3]">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                      showChat
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'bg-white border-[#E5DFD3] text-zinc-900 hover:bg-[#F2EDE4]'
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
                    className="py-2 px-3 bg-white border border-[#E5DFD3] rounded-lg text-xs font-bold text-zinc-900 hover:bg-[#F2EDE4] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    id="call-driver-btn"
                  >
                    <Phone size={14} /> Call Driver
                  </a>
                </div>
              </div>

              {/* Chat Interface Drawer/Overlay */}
              {showChat && (
                <div className="bg-[#FAF7F2] rounded-xl border border-[#E5DFD3] overflow-hidden flex flex-col h-[280px]">
                  <div className="p-2.5 bg-zinc-900 text-white flex items-center justify-between text-xs">
                    <span className="font-bold">Chatting with {trip.driver.name}</span>
                    <button
                      onClick={() => setShowChat(false)}
                      className="text-zinc-400 hover:text-white cursor-pointer"
                      id="close-driver-chat-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Chat messages body */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-zinc-500 italic py-6">
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
                                  ? 'bg-zinc-900 text-white rounded-br-none'
                                  : 'bg-white border border-[#E5DFD3] text-zinc-900 rounded-bl-none shadow-xs'
                              }`}
                            >
                              <p className="leading-relaxed font-medium">{msg.text}</p>
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
                  <form onSubmit={handleSendChatMessage} className="p-2 bg-white border-t border-[#E5DFD3] flex gap-2">
                    <input
                      type="text"
                      placeholder="Send message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-[#FAF7F2] rounded-lg px-3 py-1.5 text-xs outline-none text-zinc-900 font-medium border border-[#E5DFD3] focus:border-zinc-900"
                      id="driver-chat-input-field"
                    />
                    <button
                      type="submit"
                      className="bg-zinc-900 hover:bg-zinc-800 text-white p-1.5 rounded-lg shrink-0 flex items-center justify-center cursor-pointer"
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
                className="w-full py-2.5 text-xs text-center border border-rose-200 font-bold rounded-xl text-rose-600 bg-rose-50/50 hover:bg-rose-100/80 transition cursor-pointer"
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
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-xs animate-bounce">
              <Check size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-zinc-900">You Have Arrived!</h3>
              <p className="text-xs text-zinc-600 font-medium">
                Hope you enjoyed your ride in the {trip.driver.vehicleName}.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DFD3] text-left space-y-2.5 shadow-xs">
              <div className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Receipt Summary</div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-600 font-medium">Distance Travelled:</span>
                <span className="font-extrabold text-zinc-900">{trip.distanceMiles} km</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-600 font-medium">Trip Duration:</span>
                <span className="font-extrabold text-zinc-900">{trip.durationMinutes} mins</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-[#E5DFD3]">
                <span className="font-bold text-zinc-800">Total Charged:</span>
                <span className="font-extrabold text-emerald-700 text-sm">₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Rating Stars Selection */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider block">
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
                        className={isGold ? 'text-amber-500 fill-amber-500' : 'text-zinc-300'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Review Form */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
                Add comments or feedback (optional)
              </label>
              <textarea
                placeholder="He was incredibly polite, clean car, or fastest route ever taken..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-[#FAF7F2] text-xs border border-[#E5DFD3] rounded-xl p-3 h-16 outline-none focus:bg-white focus:border-zinc-900 resize-none text-zinc-900 font-medium"
                id="driver-feedback-textarea"
              />
            </div>

            <button
              onClick={() => {
                onCompleteTripRating(rating, reviewText);
                setReviewText('');
                setRating(5);
              }}
              className="w-full bg-zinc-900 text-white font-extrabold py-3 rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-1 text-xs shadow-md cursor-pointer"
              id="submit-rating-and-review-btn"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#FAF7F2] p-2.5 text-center text-[10px] text-zinc-600 border-t border-[#E5DFD3] flex items-center justify-center gap-1 font-mono font-semibold">
        <span>Payment Method secured by Stripe Proxy</span>
      </div>
    </div>
  );
}
