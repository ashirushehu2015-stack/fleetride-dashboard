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
  Send,
  Sparkles,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Map
} from 'lucide-react';
import { VehicleType, UserProfile, Trip } from '../types';
import { filterTripsForPassenger, filterTripsForDriver, generatePassengerHistoricalTrips } from '../utils/tripHelpers';

export interface Passenger {
  id: string;
  name: string;
  rating: number;
  balance: number;
  avatar: string;
  completedTrips: number;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
  email: string;
  phone: string;
}

export interface AdminUser {
  id: string;
  name: string;
  avatar: string;
  role: 'Super Admin' | 'Fleet Manager' | 'Operations Control';
  status: 'ACTIVE' | 'INACTIVE';
  email: string;
  actionsCount: number;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER';
  message: string;
}

interface UserManagementPanelProps {
  activeProfile: UserProfile;
  setActiveProfile: (profile: UserProfile) => void;
  activeTab: 'dashboard' | 'rider' | 'driver' | 'settings' | 'users';
  setActiveTab: (tab: 'dashboard' | 'rider' | 'driver' | 'settings' | 'users') => void;
  
  // Dynamic user data managed in App.tsx
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  drivers: any[]; // Extended Driver list
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>;
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  
  // Logs
  auditLogs: SystemAuditLog[];
  addAuditLog: (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => void;
  
  // Surge & Traffic Control
  isSurgeActive: boolean;
  setIsSurgeActive: (val: boolean) => void;
  isPeakTraffic?: boolean;
  setIsPeakTraffic?: (val: boolean) => void;
  completedTrips: Trip[];

  // Optional display screen synchronization props
  subTab?: 'passengers' | 'drivers' | 'admins' | 'control' | 'trips';
  onSelectSubTab?: (st: 'passengers' | 'drivers' | 'admins' | 'control' | 'trips') => void;
  selectedUserId?: string | null;
  onSelectUser?: (userId: string | null, type: 'passenger' | 'driver' | 'admin') => void;
  onReplayTrip?: (trip: Trip) => void;
}

export default function UserManagementPanel({
  activeProfile,
  setActiveProfile,
  activeTab,
  setActiveTab,
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
  subTab: propsSubTab,
  onSelectSubTab,
  selectedUserId,
  onSelectUser,
  onReplayTrip
}: UserManagementPanelProps) {
  const [internalSubTab, setInternalSubTab] = useState<'passengers' | 'drivers' | 'admins' | 'control' | 'trips'>('passengers');
  const subTab = propsSubTab !== undefined ? propsSubTab : internalSubTab;

  const handleSubTabChange = (st: 'passengers' | 'drivers' | 'admins' | 'control' | 'trips') => {
    setInternalSubTab(st);
    if (onSelectSubTab) onSelectSubTab(st);
  };
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  // Form input states
  const [newPassengerName, setNewPassengerName] = useState('');
  const [newPassengerPhone, setNewPassengerPhone] = useState('');
  const [newPassengerBalance, setNewPassengerBalance] = useState('15000');
  const [newPassengerEmail, setNewPassengerEmail] = useState('');
  
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicleType, setNewDriverVehicleType] = useState<VehicleType>('X');
  const [newDriverVehicleName, setNewDriverVehicleName] = useState('');
  const [newDriverPlateNumber, setNewDriverPlateNumber] = useState('');
  
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Super Admin' | 'Fleet Manager' | 'Operations Control'>('Fleet Manager');

  // Balance adjusting state
  const [adjustingPassengerId, setAdjustingPassengerId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('10000');

  // Audit Category Badge style helper
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'SYSTEM': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'ADMIN': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'DRIVER': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'RIDER': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default: return 'bg-zinc-100 text-zinc-800 border border-zinc-200';
    }
  };

  // Switch Active Session
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
        balance: 150000.00, // drivers have high mock wallet representing historical earnings
        isDriver: true,
        avatar: target.avatar,
        role: 'driver'
      });
      addAuditLog('SYSTEM', `Switched active simulation profile to Driver: ${target.name}`);
      setActiveTab('driver');
    } else if (role === 'admin') {
      // Switch active profile to admin details
      setActiveProfile({
        name: target.name,
        rating: 5.0,
        balance: 999999.00, // unlimited or high administrative budget
        isDriver: false,
        avatar: target.avatar,
        role: 'admin'
      });
      addAuditLog('SYSTEM', `Switched active simulation profile to Admin: ${target.name}`);
      handleSubTabChange('control'); // Go to console
    }
  };

  // Handlers for Passenger Management
  const handleCreatePassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassengerName.trim()) return;

    const newPass: Passenger = {
      id: 'rider-' + Math.random().toString(36).substr(2, 9),
      name: newPassengerName,
      rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(2)),
      balance: parseFloat(newPassengerBalance) || 0,
      avatar: `https://images.unsplash.com/photo-${[
        '1534528741775-53994a69daeb',
        '1494790108377-be9c29b29330',
        '1507003211169-0a1dd7228f2d',
        '1500648767791-00dcc994a43e'
      ][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=150`,
      completedTrips: 0,
      status: 'ACTIVE',
      joinedDate: new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }),
      email: newPassengerEmail || `${newPassengerName.toLowerCase().replace(/\s+/g, '')}@example.ng`,
      phone: newPassengerPhone || `+234 ${800 + Math.floor(Math.random() * 99)} ${Math.floor(Math.random() * 899 + 100)} ${Math.floor(Math.random() * 8999 + 1000)}`
    };

    setPassengers(prev => [newPass, ...prev]);
    addAuditLog('ADMIN', `Created new Passenger account: ${newPass.name} (Initial Balance: ₦${newPass.balance.toLocaleString()})`);
    
    // reset form
    setNewPassengerName('');
    setNewPassengerPhone('');
    setNewPassengerBalance('15000');
    setNewPassengerEmail('');
    setShowPassengerModal(false);
  };

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

  const handleDeletePassenger = (id: string, name: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
    addAuditLog('ADMIN', `Deleted passenger account: ${name}`);
  };

  const handleTopUpPassenger = (id: string) => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    setPassengers(prev => prev.map(p => {
      if (p.id === id) {
        const newBal = p.balance + amount;
        addAuditLog('ADMIN', `Credited Passenger ${p.name}'s wallet with ₦${amount.toLocaleString()} (New Balance: ₦${newBal.toLocaleString()})`);
        
        // If this is currently the active profile, sync the active balance too!
        if (activeProfile.name === p.name && !activeProfile.isDriver) {
          setActiveProfile({ ...activeProfile, balance: newBal });
        }
        return { ...p, balance: newBal };
      }
      return p;
    }));

    setAdjustingPassengerId(null);
    setTopUpAmount('10000');
  };

  // Handlers for Driver Management
  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverVehicleName.trim()) return;

    const newDrv = {
      id: 'driver-' + Math.random().toString(36).substr(2, 9),
      name: newDriverName,
      rating: parseFloat((4.6 + Math.random() * 0.4).toFixed(2)),
      vehicleType: newDriverVehicleType,
      vehicleName: newDriverVehicleName,
      plateNumber: newDriverPlateNumber || `ZMF-${Math.floor(Math.random() * 899 + 100)}-GS`,
      avatar: `https://images.unsplash.com/photo-${[
        '1506794778202-cad84cf45f1d',
        '1500648767791-00dcc994a43e',
        '1573496359142-b8d87734a5a2',
        '1544005313-94ddf0286df2'
      ][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=150`,
      phone: newDriverPhone || `+234 803 ${Math.floor(Math.random() * 899 + 100)} ${Math.floor(Math.random() * 8999 + 1000)}`,
      completedTrips: Math.floor(Math.random() * 200),
      isVerified: false, // Administrative approval required
      status: 'ACTIVE',
      joinedDate: new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    setDrivers(prev => [newDrv, ...prev]);
    addAuditLog('ADMIN', `Created new Driver: ${newDrv.name} driving ${newDrv.vehicleName} [Unverified]`);

    // reset
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverVehicleName('');
    setNewDriverPlateNumber('');
    setShowDriverModal(false);
  };

  const handleToggleDriverVerify = (id: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === id) {
        const nextVerify = !d.isVerified;
        addAuditLog('ADMIN', `${nextVerify ? 'Verified' : 'Revoked verification for'} Driver ${d.name}`);
        return { ...d, isVerified: nextVerify };
      }
      return d;
    }));
  };

  const handleToggleDriverStatus = (id: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        addAuditLog('ADMIN', `Driver ${d.name} is now marked ${nextStatus}`);
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const handleDeleteDriver = (id: string, name: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
    addAuditLog('ADMIN', `Deleted driver profile for: ${name}`);
  };

  // Handlers for Admin Management
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;

    const newAd: AdminUser = {
      id: 'admin-' + Math.random().toString(36).substr(2, 9),
      name: newAdminName,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      role: newAdminRole,
      status: 'ACTIVE',
      email: newAdminEmail || `${newAdminName.toLowerCase().replace(/\s+/g, '')}@nigeria.gov.ng`,
      actionsCount: 0
    };

    setAdmins(prev => [...prev, newAd]);
    addAuditLog('ADMIN', `Registered new Admin User: ${newAd.name} (${newAd.role})`);

    setNewAdminName('');
    setNewAdminEmail('');
    setShowAdminModal(false);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    addAuditLog('ADMIN', `Removed admin access for: ${name}`);
  };

  // Filter systems
  const filteredPassengers = passengers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-[#E5DFD3] rounded-2xl h-full flex flex-col text-zinc-900 overflow-hidden shadow-xl" id="user-management-module">
      
      {/* MODULE HEADER */}
      <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DFD3] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-800 rounded-lg">
            <Shield size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-zinc-900">National Fleet Console</h3>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Double-Sided Identity & Auditing Hub</p>
          </div>
        </div>

        {/* ACTIVE PROFILE PILOT BADGE */}
        <div className="flex items-center gap-2 bg-white border border-[#E5DFD3] px-2.5 py-1 rounded-xl text-right shadow-xs">
          <div className="hidden sm:block">
            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Acting Agent</div>
            <div className="text-[10px] font-extrabold text-zinc-900">{activeProfile.name}</div>
          </div>
          <img 
            src={activeProfile.avatar} 
            alt="active avatar" 
            className="w-5.5 h-5.5 rounded-full object-cover border border-[#E5DFD3] shrink-0"
          />
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-white font-mono font-bold leading-none">
            {activeProfile.isDriver ? 'Driver' : activeProfile.balance > 500000 ? 'Admin' : 'Rider'}
          </span>
        </div>
      </div>

      {/* COMPONENT SUB-TAB NAVIGATION */}
      <div className="px-3 py-2 bg-[#FAF7F2] border-b border-[#E5DFD3] flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => { handleSubTabChange('passengers'); setSearchTerm(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            subTab === 'passengers' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-700 hover:text-zinc-900 hover:bg-[#F2EDE4]'
          }`}
        >
          <User size={13} />
          Passengers ({passengers.length})
        </button>
        <button
          onClick={() => { handleSubTabChange('drivers'); setSearchTerm(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            subTab === 'drivers' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-700 hover:text-zinc-900 hover:bg-[#F2EDE4]'
          }`}
        >
          <Car size={13} />
          Drivers ({drivers.length})
        </button>
        <button
          onClick={() => { handleSubTabChange('admins'); setSearchTerm(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            subTab === 'admins' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-700 hover:text-zinc-900 hover:bg-[#F2EDE4]'
          }`}
        >
          <Shield size={13} />
          Admins ({admins.length})
        </button>
        <button
          onClick={() => { handleSubTabChange('control'); setSearchTerm(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            subTab === 'control' ? 'bg-amber-400 text-zinc-950 font-extrabold shadow-xs' : 'text-amber-800 hover:text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Activity size={13} />
          Admin Control Tower
        </button>
        <button
          onClick={() => { handleSubTabChange('trips'); setSearchTerm(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            subTab === 'trips' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-700 hover:text-zinc-900 hover:bg-[#F2EDE4]'
          }`}
        >
          <Calendar size={13} />
          Recent Trips ({completedTrips.length})
        </button>
      </div>

      {/* SEARCH / FILTERS BAR (For List Sub-tabs) */}
      {subTab !== 'control' && subTab !== 'trips' && (
        <div className="p-3 bg-white border-b border-[#E5DFD3] flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder={`Search ${subTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E5DFD3] rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 placeholder-zinc-500"
            />
          </div>
          {subTab === 'passengers' && (
            <button
              onClick={() => setShowPassengerModal(true)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-extrabold text-white flex items-center gap-1 cursor-pointer transition shrink-0 shadow-xs"
            >
              <Plus size={14} />
              Add Rider
            </button>
          )}
          {subTab === 'drivers' && (
            <button
              onClick={() => setShowDriverModal(true)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-extrabold text-white flex items-center gap-1 cursor-pointer transition shrink-0 shadow-xs"
            >
              <Plus size={14} />
              Register Driver
            </button>
          )}
          {subTab === 'admins' && (
            <button
              onClick={() => setShowAdminModal(true)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-extrabold text-white flex items-center gap-1 cursor-pointer transition shrink-0 shadow-xs"
            >
              <Plus size={14} />
              Invite Admin
            </button>
          )}
        </div>
      )}

      {/* CORE DISPLAY WORKSPACE (SCROLLABLE AREA) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">

        {/* =======================
            PASSENGERS SCENE 
            ======================= */}
        {subTab === 'passengers' && (
          <div className="space-y-2">
            {filteredPassengers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">No registered passengers found matching that term.</div>
            ) : (
              filteredPassengers.map((pass) => {
                const isActive = activeProfile.name === pass.name && !activeProfile.isDriver;
                return (
                  <div 
                    key={pass.id} 
                    onClick={() => onSelectUser?.(pass.id, 'passenger')}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-3 cursor-pointer ${
                      isActive || selectedUserId === pass.id
                        ? 'bg-zinc-900/80 border-emerald-500/60 shadow-[0_0_12px_-3px_rgba(16,185,129,0.25)]' 
                        : 'bg-zinc-900/30 border-zinc-900 hover:border-zinc-750'
                    } ${pass.status === 'SUSPENDED' ? 'opacity-65' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={pass.avatar} 
                          alt={pass.name} 
                          className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1">
                              {pass.name}
                              {isActive && (
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                              )}
                            </h4>
                            {pass.status === 'SUSPENDED' && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1 py-0.5 rounded font-black">SUSPENDED</span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{pass.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              {pass.phone}
                            </span>
                            <span className="text-[9px] text-zinc-400 flex items-center gap-0.5 font-bold">
                              <Star size={10} className="fill-amber-500 text-amber-500" /> {pass.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLS: BALANCE & STATE ACTION */}
                      {(() => {
                        let passengerTrips = filterTripsForPassenger(pass, completedTrips);
                        if (passengerTrips.length === 0 && pass.completedTrips > 0) {
                          passengerTrips = generatePassengerHistoricalTrips(pass);
                        }
                        const totalSpending = passengerTrips.reduce((sum, t) => sum + (t.price || 0), 0);
                        const totalRidesCount = passengerTrips.length > 0 ? passengerTrips.length : pass.completedTrips;

                        return (
                          <div className="text-right shrink-0">
                            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Passenger Wallet</div>
                            <div className="text-xs font-black text-emerald-500 mt-0.5">
                              ₦{pass.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[9px] text-zinc-400 mt-0.5 font-medium flex items-center justify-end gap-1">
                              <span>{totalRidesCount} Rides</span>
                              <span>•</span>
                              <span className="text-indigo-400 font-mono font-bold">₦{totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })} Spent</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* INTERACTIVE CONTROLS RAIL */}
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2.5 mt-0.5 gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSwitchSession('rider', pass)}
                          disabled={pass.status === 'SUSPENDED'}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                            isActive 
                              ? 'bg-emerald-500 text-zinc-950 cursor-default' 
                              : pass.status === 'SUSPENDED'
                                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                                : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/50'
                          }`}
                        >
                          <UserCheck size={11} />
                          {isActive ? 'Logged In' : 'Set Active Rider'}
                        </button>
                        
                        <button
                          onClick={() => setAdjustingPassengerId(pass.id)}
                          disabled={pass.status === 'SUSPENDED'}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-750 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Wallet size={11} />
                          Top up
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePassengerStatus(pass.id)}
                          className={`p-1 rounded transition cursor-pointer ${
                            pass.status === 'ACTIVE' 
                              ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/5' 
                              : 'text-red-500 hover:text-emerald-400 hover:bg-emerald-500/5'
                          }`}
                          title={pass.status === 'ACTIVE' ? "Suspend Rider" : "Activate Rider"}
                        >
                          {pass.status === 'ACTIVE' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>
                        
                        <button
                          onClick={() => handleDeletePassenger(pass.id, pass.name)}
                          className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded transition cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC TOP-UP WORKSPACE EXPANSION */}
                    {adjustingPassengerId === pass.id && (
                      <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl mt-1 space-y-2 animate-fadeIn">
                        <label className="text-[10px] font-bold text-zinc-400 block">Top-up Wallet (₦ Nigerian Naira)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder="Amount in ₦"
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleTopUpPassenger(pass.id)}
                            className="px-3 py-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-lg text-[10px] font-black cursor-pointer"
                          >
                            Add ₦
                          </button>
                          <button
                            onClick={() => setAdjustingPassengerId(null)}
                            className="px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="flex gap-1">
                          {['5000', '10000', '25000', '50000'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setTopUpAmount(preset)}
                              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded text-[9px] font-mono cursor-pointer transition"
                            >
                              +₦{parseInt(preset).toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =======================
            DRIVERS SCENE 
            ======================= */}
        {subTab === 'drivers' && (
          <div className="space-y-2">
            {filteredDrivers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">No drivers registered. Register one above!</div>
            ) : (
              filteredDrivers.map((drv) => {
                const isActive = activeProfile.name === drv.name && activeProfile.isDriver;
                return (
                  <div 
                    key={drv.id || drv.name} 
                    onClick={() => onSelectUser?.(drv.id || drv.name, 'driver')}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-3 cursor-pointer ${
                      isActive || selectedUserId === (drv.id || drv.name)
                        ? 'bg-zinc-900/80 border-blue-500/60 shadow-[0_0_12px_-3px_rgba(59,130,246,0.25)]' 
                        : 'bg-zinc-900/30 border-zinc-900 hover:border-zinc-750'
                    } ${drv.status === 'SUSPENDED' ? 'opacity-65' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={drv.avatar} 
                          alt={drv.name} 
                          className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1">
                              {drv.name}
                              {isActive && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                              )}
                            </h4>
                            
                            {/* Verification Badge */}
                            {drv.isVerified ? (
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-bold flex items-center gap-0.5">
                                <CheckCircle2 size={8} /> Verified
                              </span>
                            ) : (
                              <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded font-bold flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle size={8} /> Needs Verification
                              </span>
                            )}
                            
                            {drv.status === 'SUSPENDED' && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1 py-0.5 rounded font-black">SUSPENDED</span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-bold">
                            {drv.vehicleName} • <span className="font-mono text-zinc-500 text-[9px] bg-zinc-900 px-1 py-0.5 rounded border border-zinc-850">{drv.plateNumber}</span>
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded font-mono">
                              {drv.phone}
                            </span>
                            <span className="text-[9px] text-zinc-400 flex items-center gap-0.5 font-bold">
                              <Star size={10} className="fill-amber-500 text-amber-500" /> {drv.rating}
                            </span>
                            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-semibold text-[8px] uppercase tracking-wider">
                              Category: {drv.vehicleType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLLUMN COMPLETED TRIPS */}
                      <div className="text-right shrink-0">
                        <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Experience</div>
                        <div className="text-xs font-black text-zinc-200 mt-0.5">
                          {drv.completedTrips} Trips
                        </div>
                        <div className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                          Active State: {drv.status || 'ACTIVE'}
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE ACTIONS RAIL */}
                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2.5 mt-0.5 gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSwitchSession('driver', drv)}
                          disabled={drv.status === 'SUSPENDED'}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                            isActive 
                              ? 'bg-blue-500 text-zinc-950 cursor-default' 
                              : drv.status === 'SUSPENDED'
                                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                                : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/50'
                          }`}
                        >
                          <UserCheck size={11} />
                          {isActive ? 'Logged In' : 'Set Active Driver'}
                        </button>

                        <button
                          onClick={() => handleToggleDriverVerify(drv.id || drv.name)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            drv.isVerified 
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900' 
                              : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400 hover:text-amber-300'
                          }`}
                        >
                          {drv.isVerified ? 'Revoke Approval' : 'Approve & Verify'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleDriverStatus(drv.id || drv.name)}
                          className={`p-1 rounded transition cursor-pointer ${
                            drv.status === 'ACTIVE' 
                              ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/5' 
                              : 'text-red-500 hover:text-emerald-400 hover:bg-emerald-500/5'
                          }`}
                          title={drv.status === 'ACTIVE' ? "Suspend Driver" : "Activate Driver"}
                        >
                          {drv.status === 'ACTIVE' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>

                        <button
                          onClick={() => handleDeleteDriver(drv.id || drv.name, drv.name)}
                          className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded transition cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =======================
            ADMINS SCENE 
            ======================= */}
        {subTab === 'admins' && (
          <div className="space-y-2">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">No Admins found matching that term.</div>
            ) : (
              filteredAdmins.map((ad) => {
                const isActive = activeProfile.name === ad.name && activeProfile.balance > 500000;
                return (
                  <div 
                    key={ad.id} 
                    onClick={() => onSelectUser?.(ad.id, 'admin')}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-3 cursor-pointer ${
                      isActive || selectedUserId === ad.id
                        ? 'bg-zinc-900/80 border-amber-500/60 shadow-[0_0_12px_-3px_rgba(245,158,11,0.25)]' 
                        : 'bg-zinc-900/30 border-zinc-900 hover:border-zinc-750'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500 shrink-0">
                          <Shield size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1">
                              {ad.name}
                              {isActive && (
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                              )}
                            </h4>
                            <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                              {ad.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{ad.email}</p>
                          <p className="text-[9px] text-zinc-400 mt-1 flex items-center gap-1">
                            <Activity size={10} className="text-zinc-500" /> {ad.actionsCount} system audits recorded
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {ad.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2.5 mt-0.5 gap-2">
                      <button
                        onClick={() => handleSwitchSession('admin', ad)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                          isActive 
                            ? 'bg-amber-500 text-zinc-950 cursor-default' 
                            : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/50'
                        }`}
                      >
                        <ShieldAlert size={11} />
                        {isActive ? 'Logged In as Admin' : 'Simulate Admin Role'}
                      </button>

                      {admins.length > 1 && (
                        <button
                          onClick={() => handleDeleteAdmin(ad.id, ad.name)}
                          className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded transition cursor-pointer"
                          title="Revoke Admin Access"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =======================
            CONTROL TOWER (ADMIN CONSOLE)
            ======================= */}
        {subTab === 'control' && (
          <div className="space-y-4">
            
            {/* Live Global Operations Overview metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-zinc-900/50 border border-zinc-900 p-3 rounded-xl text-center">
                <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Estimated Revenue</span>
                <span className="text-base font-black text-emerald-500 block mt-0.5">
                  ₦{(passengers.reduce((sum, p) => sum + p.completedTrips * 4500, 240000)).toLocaleString()}
                </span>
                <span className="text-[8px] text-zinc-500 font-medium">Accumulated simulation value</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-3 rounded-xl text-center">
                <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Active Registrations</span>
                <span className="text-base font-black text-white block mt-0.5">
                  {passengers.length + drivers.length + admins.length} Users
                </span>
                <span className="text-[8px] text-zinc-500 font-medium">
                  {drivers.filter(d => d.isVerified).length} approved, {drivers.filter(d => !d.isVerified).length} pending
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-zinc-900/50 border border-zinc-900 p-3 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">State Surge Control</span>
                
                <button
                  onClick={() => {
                    const nextVal = !isSurgeActive;
                    setIsSurgeActive(nextVal);
                    addAuditLog('ADMIN', `State-wide Surge Pricing has been toggled ${nextVal ? 'ACTIVE (1.8x multiplier)' : 'OFF (1.0x standard)'}`);
                  }}
                  className={`w-full py-1 px-3 rounded-lg text-[10px] font-black tracking-tight transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                    isSurgeActive 
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)] animate-pulse' 
                      : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  <Sparkles size={11} className={isSurgeActive ? 'animate-bounce' : ''} />
                  {isSurgeActive ? 'SURGE ACTIVE (1.8x)' : 'ACTIVATE SURGE'}
                </button>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-zinc-900/50 border border-zinc-900 p-3 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mb-1">Peak Traffic Simulation</span>
                
                <button
                  onClick={() => {
                    const nextVal = !isPeakTraffic;
                    setIsPeakTraffic?.(nextVal);
                    addAuditLog('ADMIN', `Peak Traffic Simulation toggled ${nextVal ? 'ACTIVE (Slowed journey duration by 50%)' : 'OFF (Normal transit speed)'}`);
                  }}
                  className={`w-full py-1 px-3 rounded-lg text-[10px] font-black tracking-tight transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                    isPeakTraffic 
                      ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse' 
                      : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                  id="user-mgmt-toggle-peak-btn"
                >
                  <Clock size={11} className={isPeakTraffic ? 'animate-spin' : ''} />
                  {isPeakTraffic ? 'PEAK TRAFFIC (2x SLOW)' : 'SIMULATE PEAK TRAFFIC'}
                </button>
              </div>
            </div>

            {/* QUICK TRIGGER BUTTONS */}
            <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Fast Fleet Initialization Tools</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Seed dynamic logs
                    addAuditLog('SYSTEM', "Bulk initialization of Nigeria fleet operations triggered");
                    addAuditLog('SYSTEM', `Recalibrating GPS vectors around metropolitan hubs`);
                    addAuditLog('DRIVER', "All active drivers set coordinates to active central metropolitan sectors");
                  }}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <RefreshCw size={11} /> Re-sync GPS Grid
                </button>
                <button
                  onClick={() => {
                    // Quick safety audit trigger
                    addAuditLog('SYSTEM', "Running fleet integrity scanner...");
                    const offlineCount = drivers.filter(d => d.status === 'SUSPENDED').length;
                    addAuditLog('ADMIN', `Fleet check complete: ${drivers.length} registered, ${offlineCount} suspended drivers found`);
                  }}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <ShieldCheck size={11} /> Scan Fleet Security
                </button>
              </div>
            </div>

            {/* LIVE SYSTEM AUDIT LOG */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 flex flex-col h-[280px]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} className="text-amber-500" />
                  <span className="text-[10px] uppercase tracking-widest text-white font-extrabold">State System Audit Logs</span>
                </div>
                <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                  LIVE TELEMETRY
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[10px] font-mono scrollbar-thin">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-2 items-start py-0.5 hover:bg-zinc-900/40 px-1 rounded transition">
                    <span className="text-zinc-600 shrink-0 font-medium">{log.timestamp}</span>
                    <span className={`px-1 py-0.2 rounded text-[8px] font-bold shrink-0 leading-none ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </span>
                    <span className="text-zinc-300 break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {subTab === 'trips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">State-wide Completed Trips</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Historical dispatch records stored in memory</p>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold px-2.5 py-1 rounded-xl">
                {completedTrips.length} Total Trips
              </span>
            </div>

            {completedTrips.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                <Calendar size={28} className="mx-auto text-zinc-600 mb-2" />
                <h5 className="text-xs font-bold text-zinc-400">No trips simulated yet</h5>
                <p className="text-[10px] text-zinc-500 max-w-[220px] mx-auto mt-1">
                  Once a passenger books and completes a ride in Rider Mode, historical ride statistics will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {completedTrips.slice().reverse().map((trip) => {
                  const formattedDate = trip.timestamp 
                    ? (trip.timestamp.includes('T') 
                      ? new Date(trip.timestamp).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) + ' at ' + new Date(trip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : trip.timestamp)
                    : new Date().toLocaleDateString();
                    
                  return (
                    <div key={trip.id} className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between gap-3 text-xs shadow-sm hover:border-zinc-800 transition">
                      <div className="flex gap-3">
                        <img
                          src={trip.driver.avatar}
                          alt={trip.driver.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white">{trip.driver.name}</span>
                            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                              {trip.vehicleType}
                            </span>
                            {trip.rating && (
                              <span className="flex items-center text-amber-500 text-[10px] font-bold">
                                <Star size={10} className="fill-amber-500 mr-0.5" />
                                {trip.rating}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-zinc-400 font-medium truncate mt-1 flex items-center gap-1">
                            <MapPin size={10} className="text-zinc-500 shrink-0" />
                            <span className="truncate">{trip.origin.label} → {trip.destination.label}</span>
                          </p>

                          <p className="text-[9px] text-zinc-500 font-mono mt-1 flex items-center gap-1">
                            <Clock size={10} className="text-zinc-600 shrink-0" />
                            <span>{formattedDate}</span>
                          </p>

                          {trip.review && (
                            <p className="text-[10px] text-zinc-400 italic mt-1.5 leading-relaxed border-l-2 border-emerald-500/40 pl-2">
                              "{trip.review}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end shrink-0 border-t sm:border-none pt-2 sm:pt-0 border-zinc-900 gap-1.5">
                        <div className="font-extrabold text-emerald-500 text-sm">
                          ₦{trip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono">
                          {trip.distanceMiles}km • {trip.durationMinutes}m
                        </div>
                        {onReplayTrip && (
                          <button
                            onClick={() => onReplayTrip(trip)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-zinc-700 flex items-center gap-1 transition cursor-pointer shadow-2xs group shrink-0 mt-0.5"
                            title="Open map view centered specifically on this trip's route"
                          >
                            <Map size={12} className="group-hover:scale-110 transition-transform shrink-0" />
                            <span className="text-[9px] font-black uppercase tracking-tight">Map</span>
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

      {/* ========================================================
          FORM MODAL DIALOGS (PORTED INSIDE CONTAINER FOR SPEED)
          ======================================================== */}
      
      {/* RIDER MODAL */}
      {showPassengerModal && (
        <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center p-4 z-40 animate-fadeIn">
          <form onSubmit={handleCreatePassenger} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl w-full max-w-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-white flex items-center gap-1">
              <Plus size={14} className="text-emerald-500" />
              Register New Rider Account
            </h3>
            <p className="text-[9px] text-zinc-400">Adding a simulated passenger into the Nigeria fleet.</p>
            
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 block font-bold">Rider Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bello Matawalle"
                value={newPassengerName}
                onChange={(e) => setNewPassengerName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 block font-bold">Phone Number (Nigerian Format)</label>
              <input
                type="text"
                placeholder="e.g. +234 803 123 4567"
                value={newPassengerPhone}
                onChange={(e) => setNewPassengerPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 block font-bold">Starting Wallet (₦)</label>
                <input
                  type="number"
                  placeholder="15000"
                  value={newPassengerBalance}
                  onChange={(e) => setNewPassengerBalance(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 block font-bold">Email Address</label>
                <input
                  type="email"
                  placeholder="bello@domain.ng"
                  value={newPassengerEmail}
                  onChange={(e) => setNewPassengerEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-black rounded-lg text-xs cursor-pointer text-center"
              >
                Create Rider
              </button>
              <button
                type="button"
                onClick={() => setShowPassengerModal(false)}
                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DRIVER REGISTER MODAL */}
      {showDriverModal && (
        <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center p-4 z-40 animate-fadeIn">
          <form onSubmit={handleCreateDriver} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl w-full max-w-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-white flex items-center gap-1">
              <Plus size={14} className="text-blue-500" />
              Register Fleet Driver
            </h3>
            <p className="text-[9px] text-zinc-400">Add a dynamic driver. Will need Admin verification before taking rides.</p>
            
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 block font-bold">Driver Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aliyu Gusau"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 block font-bold">Vehicle Type Category</label>
                <select
                  value={newDriverVehicleType}
                  onChange={(e) => setNewDriverVehicleType(e.target.value as VehicleType)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white focus:outline-none"
                >
                  <option value="X">ZamTaxi Standard</option>
                  <option value="Comfort">ZamTaxi Comfort</option>
                  <option value="Black">ZamTaxi Premium</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 block font-bold">Vehicle Name / Make</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota Corolla (Gold)"
                  value={newDriverVehicleName}
                  onChange={(e) => setNewDriverVehicleName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 block font-bold">Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. GSU-102-ZF"
                  value={newDriverPlateNumber}
                  onChange={(e) => setNewDriverPlateNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 block font-bold">Driver Phone</label>
                <input
                  type="text"
                  placeholder="+234 803 998 8877"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-blue-500 text-zinc-950 hover:bg-blue-400 font-black rounded-lg text-xs cursor-pointer text-center"
              >
                Register Driver
              </button>
              <button
                type="button"
                onClick={() => setShowDriverModal(false)}
                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-lg text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADMIN REGISTER MODAL */}
      {showAdminModal && (
        <div className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center p-4 z-40 animate-fadeIn">
          <form onSubmit={handleCreateAdmin} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl w-full max-w-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-white flex items-center gap-1">
              <Plus size={14} className="text-amber-500" />
              Invite Operations Administrator
            </h3>
            <p className="text-[9px] text-zinc-400">Authorizing custom administrative accounts with telemetry audit rights.</p>
            
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 block font-bold">Admin Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Shehu Gusau"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 block font-bold">Administrative Role</label>
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white focus:outline-none"
              >
                <option value="Super Admin">Super Admin (All Powers)</option>
                <option value="Fleet Manager">Fleet Manager (Drivers & Vehicles)</option>
                <option value="Operations Control">Operations Control (Audits & Surges)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 block font-bold">Gov.ng Email</label>
              <input
                type="email"
                placeholder="shehu@nigeria.gov.ng"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs py-1.5 px-2.5 rounded-lg text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-amber-500 text-zinc-950 hover:bg-amber-400 font-black rounded-lg text-xs cursor-pointer text-center"
              >
                Invite Admin
              </button>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-lg text-xs cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
