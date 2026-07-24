import React, { useState } from 'react';
import {
  User,
  Car,
  Shield,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Wallet,
  Star,
  Activity,
  FileText,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  ArrowUpRight,
  DollarSign,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { Passenger, AdminUser, SystemAuditLog } from './UserManagementPanel';
import { UserProfile, Trip } from '../types';

interface UserManagementDisplayScreenProps {
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  setActiveTab: (tab: 'dashboard' | 'rider' | 'driver' | 'settings' | 'users') => void;
  subTab: 'passengers' | 'drivers' | 'admins' | 'control' | 'trips';
  setSubTab: (st: 'passengers' | 'drivers' | 'admins' | 'control' | 'trips') => void;
  selectedUser: { id: string; type: 'passenger' | 'driver' | 'admin' } | null;
  setSelectedUser: (user: { id: string; type: 'passenger' | 'driver' | 'admin' } | null) => void;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  drivers: any[];
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  auditLogs: SystemAuditLog[];
  addAuditLog: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
  isSurgeActive: boolean;
  setIsSurgeActive: (val: boolean) => void;
  isPeakTraffic?: boolean;
  setIsPeakTraffic?: (val: boolean) => void;
  completedTrips: Trip[];
  onShowMap: () => void;
  onReplayTrip?: (trip: Trip) => void;
}

export default function UserManagementDisplayScreen({
  activeProfile,
  setActiveProfile,
  setActiveTab,
  subTab,
  setSubTab,
  selectedUser,
  setSelectedUser,
  passengers,
  setPassengers,
  drivers,
  setDrivers,
  admins,
  setAdmins,
  auditLogs,
  addAuditLog,
  isSurgeActive,
  setIsSurgeActive,
  isPeakTraffic = false,
  setIsPeakTraffic,
  completedTrips,
  onShowMap,
  onReplayTrip
}: UserManagementDisplayScreenProps) {
  const [topUpInput, setTopUpInput] = useState('10000');
  const [showTopUpForm, setShowTopUpForm] = useState(false);

  // Find selected target object
  const selectedPassenger = selectedUser?.type === 'passenger'
    ? passengers.find(p => p.id === selectedUser.id)
    : null;

  const selectedDriver = selectedUser?.type === 'driver'
    ? drivers.find(d => (d.id || d.name) === selectedUser.id)
    : null;

  const selectedAdmin = selectedUser?.type === 'admin'
    ? admins.find(a => a.id === selectedUser.id)
    : null;

  // Switch Active Session Helper
  const handleSwitchSession = (role: 'rider' | 'driver' | 'admin', target: any) => {
    if (role === 'rider') {
      setActiveProfile({
        name: target.name,
        rating: target.rating,
        balance: target.balance,
        isDriver: false,
        avatar: target.avatar,
        role: 'rider'
      });
      addAuditLog('SYSTEM', `Switched active simulation profile to Passenger: ${target.name}`);
      setActiveTab('rider');
    } else if (role === 'driver') {
      setActiveProfile({
        name: target.name,
        rating: target.rating,
        balance: 150000.0,
        isDriver: true,
        avatar: target.avatar,
        role: 'driver'
      });
      addAuditLog('SYSTEM', `Switched active simulation profile to Driver: ${target.name}`);
      setActiveTab('driver');
    } else if (role === 'admin') {
      setActiveProfile({
        name: target.name,
        rating: 5.0,
        balance: 999999.0,
        isDriver: false,
        avatar: target.avatar,
        role: 'admin'
      });
      addAuditLog('SYSTEM', `Switched active simulation profile to Admin: ${target.name}`);
    }
  };

  // Top Up Passenger Wallet
  const handleTopUpPassenger = (id: string, amountVal?: number) => {
    const amount = amountVal !== undefined ? amountVal : parseFloat(topUpInput);
    if (isNaN(amount) || amount <= 0) return;

    setPassengers(prev => prev.map(p => {
      if (p.id === id) {
        const newBal = p.balance + amount;
        addAuditLog('ADMIN', `Credited Passenger ${p.name}'s wallet with ₦${amount.toLocaleString()} (New Balance: ₦${newBal.toLocaleString()})`);
        if (activeProfile.name === p.name && !activeProfile.isDriver) {
          setActiveProfile({ ...activeProfile, balance: newBal });
        }
        return { ...p, balance: newBal };
      }
      return p;
    }));
    setShowTopUpForm(false);
  };

  // Toggle Passenger Status
  const handleTogglePassengerStatus = (id: string) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        addAuditLog('ADMIN', `Passenger ${p.name} status updated to ${nextStatus}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Delete Passenger
  const handleDeletePassenger = (id: string, name: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
    addAuditLog('ADMIN', `Deleted passenger account: ${name}`);
    setSelectedUser(null);
  };

  // Toggle Driver Verify
  const handleToggleDriverVerify = (id: string) => {
    setDrivers(prev => prev.map(d => {
      if ((d.id || d.name) === id) {
        const nextVerify = !d.isVerified;
        addAuditLog('ADMIN', `${nextVerify ? 'Verified' : 'Revoked verification for'} Driver ${d.name}`);
        return { ...d, isVerified: nextVerify };
      }
      return d;
    }));
  };

  // Toggle Driver Status
  const handleToggleDriverStatus = (id: string) => {
    setDrivers(prev => prev.map(d => {
      if ((d.id || d.name) === id) {
        const nextStatus = d.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        addAuditLog('ADMIN', `Driver ${d.name} marked ${nextStatus}`);
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  // Delete Driver
  const handleDeleteDriver = (id: string, name: string) => {
    setDrivers(prev => prev.filter(d => (d.id || d.name) !== id));
    addAuditLog('ADMIN', `Deleted driver profile for: ${name}`);
    setSelectedUser(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5DFD3] shadow-xl overflow-hidden min-h-[550px]">
      {/* SCREEN HEADER */}
      <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E5DFD3] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {selectedUser && (
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="p-1.5 bg-white border border-[#E5DFD3] hover:bg-[#F2EDE4] rounded-xl text-zinc-700 transition cursor-pointer flex items-center gap-1 text-xs font-extrabold"
              id="btn-back-to-directory"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Directory</span>
            </button>
          )}
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <div className="text-left">
            <h2 className="text-xs sm:text-sm font-black uppercase text-zinc-900 tracking-wider flex items-center gap-2">
              <span>DISPLAY SCREEN:</span>
              <span className="text-emerald-800">
                {selectedPassenger && `PASSENGER PROFILE • ${selectedPassenger.name}`}
                {selectedDriver && `FLEET DRIVER PROFILE • ${selectedDriver.name}`}
                {selectedAdmin && `ADMINISTRATOR PROFILE • ${selectedAdmin.name}`}
                {!selectedUser && subTab === 'passengers' && 'PASSENGER DIRECTORY & WALLETS'}
                {!selectedUser && subTab === 'drivers' && 'FLEET DRIVERS & VERIFICATION HUB'}
                {!selectedUser && subTab === 'admins' && 'ADMINISTRATIVE PRIVILEGE MATRIX'}
                {!selectedUser && subTab === 'control' && 'SYSTEM CONTROL TOWER & TELEMETRY'}
                {!selectedUser && subTab === 'trips' && 'STATE DISPATCH AUDIT LOGS'}
              </span>
            </h2>
            <p className="text-[10px] text-zinc-500 font-semibold">
              Live Inspector & Management Hub
            </p>
          </div>
        </div>

        {/* MAP TOGGLE */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowMap}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2EDE4] text-zinc-800 border border-[#E5DFD3] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            id="switch-to-map-canvas-users-btn"
          >
            <MapPin size={13} className="text-emerald-600" />
            <span>Interactive Map View</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT DISPLAY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white text-left">
        {/* SCENARIO 1: SELECTED PASSENGER INSPECTOR */}
        {selectedPassenger && (
          <div className="space-y-4">
            {/* HERO PROFILE CARD */}
            <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedPassenger.avatar}
                    alt={selectedPassenger.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-zinc-900">{selectedPassenger.name}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold border ${
                        selectedPassenger.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {selectedPassenger.status}
                      </span>
                      <span className="flex items-center text-amber-600 text-xs font-extrabold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star size={12} className="fill-amber-500 text-amber-500 mr-1" />
                        {selectedPassenger.rating} Rating
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono mt-1">{selectedPassenger.email} • {selectedPassenger.phone}</p>
                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5">Joined: {selectedPassenger.joinedDate}</p>
                  </div>
                </div>

                {/* BALANCE DISPLAY */}
                <div className="text-right sm:text-right bg-white p-3 rounded-xl border border-[#E5DFD3] w-full sm:w-auto shadow-2xs">
                  <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider block">Wallet Balance</span>
                  <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                    ₦{selectedPassenger.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold block mt-0.5">{selectedPassenger.completedTrips} Total Rides Taken</span>
                </div>
              </div>

              {/* ACTION BUTTONS RAIL */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => handleSwitchSession('rider', selectedPassenger)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <UserCheck size={14} className="text-emerald-400" />
                  <span>Set Active Rider Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTopUpForm(!showTopUpForm)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Wallet size={14} />
                  <span>Top up Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePassengerStatus(selectedPassenger.id)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2EDE4] text-zinc-800 border border-[#E5DFD3] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  {selectedPassenger.status === 'ACTIVE' ? <XCircle size={14} className="text-red-600" /> : <CheckCircle2 size={14} className="text-emerald-600" />}
                  <span>{selectedPassenger.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePassenger(selectedPassenger.id, selectedPassenger.name)}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Passenger</span>
                </button>
              </div>

              {/* QUICK TOP UP INPUT EXPANSION */}
              {showTopUpForm && (
                <div className="bg-white border border-[#E5DFD3] p-3.5 rounded-xl space-y-3 animate-fadeIn">
                  <div className="text-xs font-extrabold text-zinc-900 flex items-center justify-between">
                    <span>Credit Passenger Wallet</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Instant Sync</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={topUpInput}
                      onChange={(e) => setTopUpInput(e.target.value)}
                      placeholder="Amount in ₦"
                      className="flex-1 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleTopUpPassenger(selectedPassenger.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer transition shadow-xs"
                    >
                      Credit ₦
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[5000, 10000, 25000, 50000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleTopUpPassenger(selectedPassenger.id, preset)}
                        className="px-3 py-1 bg-[#FAF7F2] hover:bg-[#F2EDE4] text-zinc-800 border border-[#E5DFD3] rounded-lg text-xs font-mono font-bold cursor-pointer transition"
                      >
                        +₦{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RECENT TRIPS HISTORY FOR THIS PASSENGER */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider flex items-center gap-2 border-b border-[#E5DFD3] pb-2">
                <Clock size={15} className="text-emerald-700" />
                Ride History for {selectedPassenger.name}
              </h4>

              {completedTrips.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DFD3]">No completed trip logs recorded for this passenger yet.</p>
              ) : (
                <div className="space-y-2">
                  {completedTrips.map((trip) => (
                    <div key={trip.id} className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-zinc-900">{trip.origin.label} → {trip.destination.label}</span>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{trip.driver.name} ({trip.vehicleType}) • {trip.distanceMiles}km</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-700 font-mono">₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[9px] text-zinc-500">{trip.durationMinutes} mins</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCENARIO 2: SELECTED DRIVER INSPECTOR */}
        {selectedDriver && (
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedDriver.avatar}
                    alt={selectedDriver.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-600 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-zinc-900">{selectedDriver.name}</h3>
                      {selectedDriver.isVerified ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-md font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Verified Fleet Driver
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-md font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle size={10} /> Unverified
                        </span>
                      )}
                      <span className="flex items-center text-amber-600 text-xs font-extrabold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star size={12} className="fill-amber-500 text-amber-500 mr-1" />
                        {selectedDriver.rating} Rating
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 font-bold mt-1">
                      Vehicle: {selectedDriver.vehicleName} • <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DFD3]">{selectedDriver.plateNumber}</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Phone: {selectedDriver.phone} • Category: {selectedDriver.vehicleType}</p>
                  </div>
                </div>

                <div className="text-right sm:text-right bg-white p-3 rounded-xl border border-[#E5DFD3] w-full sm:w-auto shadow-2xs">
                  <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider block">Fleet Experience</span>
                  <div className="text-xl font-black text-zinc-900 font-mono mt-0.5">
                    {selectedDriver.completedTrips} Trips
                  </div>
                  <span className="text-[10px] text-sky-700 font-bold block mt-0.5">Active Fleet Status</span>
                </div>
              </div>

              {/* ACTION BUTTONS RAIL */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => handleSwitchSession('driver', selectedDriver)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <UserCheck size={14} className="text-sky-400" />
                  <span>Set Active Driver Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleDriverVerify(selectedDriver.id || selectedDriver.name)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2EDE4] text-zinc-800 border border-[#E5DFD3] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{selectedDriver.isVerified ? 'Revoke Approval' : 'Approve & Verify'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleDriverStatus(selectedDriver.id || selectedDriver.name)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2EDE4] text-zinc-800 border border-[#E5DFD3] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  {selectedDriver.status === 'ACTIVE' ? <XCircle size={14} className="text-red-600" /> : <CheckCircle2 size={14} className="text-emerald-600" />}
                  <span>{selectedDriver.status === 'ACTIVE' ? 'Suspend Driver' : 'Activate Driver'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteDriver(selectedDriver.id || selectedDriver.name, selectedDriver.name)}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 3: SELECTED ADMIN INSPECTOR */}
        {selectedAdmin && (
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-amber-500 flex items-center justify-center text-amber-400">
                    <Shield size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-zinc-900">{selectedAdmin.name}</h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                        {selectedAdmin.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono mt-1">{selectedAdmin.email}</p>
                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5">{selectedAdmin.actionsCount} Telemetry Audit Actions Triggered</p>
                  </div>
                </div>

                <div className="text-right sm:text-right bg-white p-3 rounded-xl border border-[#E5DFD3] w-full sm:w-auto shadow-2xs">
                  <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider block">Access Status</span>
                  <div className="text-lg font-black text-amber-700 mt-0.5">{selectedAdmin.status}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => handleSwitchSession('admin', selectedAdmin)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <ShieldAlert size={14} />
                  <span>Simulate Admin Role</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO 4: NO USER SELECTED - DIRECTORY OVERVIEW */}
        {!selectedUser && (
          <>
            {subTab === 'passengers' && (
              <div className="space-y-4">
                {/* KPI STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Total Passengers</span>
                    <div className="text-lg font-black text-zinc-900 mt-1">{passengers.length} Registered</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Active Riders</span>
                    <div className="text-lg font-black text-emerald-700 mt-1">{passengers.filter(p => p.status === 'ACTIVE').length} Active</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Total Wallet Funds</span>
                    <div className="text-lg font-black text-zinc-900 mt-1 font-mono">
                      ₦{passengers.reduce((sum, p) => sum + p.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Average Rating</span>
                    <div className="text-lg font-black text-amber-700 mt-1">4.91 / 5.0</div>
                  </div>
                </div>

                {/* DIRECTORY GRID */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                    <span>Passenger Directory</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Click any card to inspect full details</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {passengers.map((pass) => (
                      <div
                        key={pass.id}
                        onClick={() => setSelectedUser({ id: pass.id, type: 'passenger' })}
                        className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-3 cursor-pointer hover:border-zinc-400 hover:bg-[#F2EDE4] transition shadow-2xs group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={pass.avatar} alt={pass.name} className="w-10 h-10 rounded-full object-cover border border-[#E5DFD3]" />
                            <div>
                              <h4 className="text-xs font-black text-zinc-900 group-hover:text-emerald-800 transition">{pass.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono">{pass.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-700 font-mono block">₦{pass.balance.toLocaleString()}</span>
                            <span className="text-[9px] text-zinc-500 font-bold">{pass.completedTrips} Trips</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subTab === 'drivers' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Total Fleet Drivers</span>
                    <div className="text-lg font-black text-zinc-900 mt-1">{drivers.length} Drivers</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Verified Drivers</span>
                    <div className="text-lg font-black text-emerald-700 mt-1">{drivers.filter(d => d.isVerified).length} Verified</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Pending Verification</span>
                    <div className="text-lg font-black text-amber-700 mt-1">{drivers.filter(d => !d.isVerified).length} Pending</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 block">Avg Fleet Rating</span>
                    <div className="text-lg font-black text-sky-700 mt-1">4.88 / 5.0</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {drivers.map((drv) => (
                    <div
                      key={drv.id || drv.name}
                      onClick={() => setSelectedUser({ id: drv.id || drv.name, type: 'driver' })}
                      className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-3 cursor-pointer hover:border-zinc-400 hover:bg-[#F2EDE4] transition shadow-2xs group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={drv.avatar} alt={drv.name} className="w-10 h-10 rounded-full object-cover border border-[#E5DFD3]" />
                          <div>
                            <h4 className="text-xs font-black text-zinc-900 group-hover:text-sky-800 transition">{drv.name}</h4>
                            <p className="text-[10px] text-zinc-600 font-bold">{drv.vehicleName} • <span className="font-mono text-zinc-500">{drv.plateNumber}</span></p>
                          </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold border ${
                          drv.isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {drv.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTab === 'admins' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {admins.map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => setSelectedUser({ id: ad.id, type: 'admin' })}
                      className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-3 cursor-pointer hover:border-zinc-400 hover:bg-[#F2EDE4] transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-amber-400">
                            <Shield size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-zinc-900">{ad.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono">{ad.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded uppercase">
                          {ad.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTab === 'control' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl space-y-3">
                  <h3 className="text-xs font-black uppercase text-zinc-900 tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-amber-600" />
                    System Telemetry & Live Control Tower
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSurgeActive(!isSurgeActive)}
                      className={`p-3 rounded-xl border text-xs font-black flex items-center justify-between cursor-pointer transition ${
                        isSurgeActive ? 'bg-amber-400 text-zinc-950 border-amber-500 shadow-sm' : 'bg-white text-zinc-800 border-[#E5DFD3]'
                      }`}
                    >
                      <span>Surge Pricing (1.8x)</span>
                      <span className="font-mono text-[10px]">{isSurgeActive ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPeakTraffic?.(!isPeakTraffic)}
                      className={`p-3 rounded-xl border text-xs font-black flex items-center justify-between cursor-pointer transition ${
                        isPeakTraffic ? 'bg-red-600 text-white border-red-700 shadow-sm animate-pulse' : 'bg-white text-zinc-800 border-[#E5DFD3]'
                      }`}
                    >
                      <span>Peak Traffic Delay (2x SLOW)</span>
                      <span className="font-mono text-[10px]">{isPeakTraffic ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>

                {/* AUDIT LOG STREAM */}
                <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black uppercase text-zinc-900 flex items-center gap-1.5">
                    <FileText size={15} className="text-emerald-700" /> Live Audit Log Stream
                  </h4>
                  <div className="max-h-[300px] overflow-y-auto space-y-1.5 text-xs font-mono">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-2 bg-white border border-[#E5DFD3] rounded-lg flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">{log.timestamp}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-white font-bold">{log.category}</span>
                        <span className="text-zinc-800 font-semibold">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subTab === 'trips' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider border-b border-[#E5DFD3] pb-2 flex items-center justify-between">
                  <span>State Completed Trips Logs</span>
                  <span className="text-zinc-500 font-mono text-[10px]">{completedTrips.length} Records</span>
                </h3>

                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {completedTrips.slice().reverse().map((trip) => (
                    <div key={trip.id} className="p-3 bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-zinc-900">{trip.driver.name} ({trip.vehicleType})</div>
                        <div className="text-[10px] text-zinc-600 font-bold">{trip.origin.label} → {trip.destination.label}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-700 font-mono">₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">{trip.distanceMiles}km • {trip.durationMinutes}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
