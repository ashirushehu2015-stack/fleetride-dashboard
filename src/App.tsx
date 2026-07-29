import React, { useState, useEffect } from 'react';
import { Location, Trip, ChatMessage, UserProfile, TripStatus } from './types';
import { CITIES, VEHICLE_CONFIGS, MOCK_DRIVERS, MOCK_DRIVER_CHATBOT_PHRASES } from './data';
import MapContainer from './components/MapContainer';
import RiderPanel from './components/RiderPanel';
import DriverPanel from './components/DriverPanel';
import SettingsPanel from './components/SettingsPanel';
import DashboardPanel, { DashboardDisplayScreen, NavSection } from './components/DashboardPanel';
import UserManagementPanel from './components/UserManagementPanel';
import UserManagementDisplayScreen from './components/UserManagementDisplayScreen';
import LandingPage from './components/LandingPage';
import StakeholderPresentationModal from './components/StakeholderPresentationModal';
import ZamTaxiLogo from './components/ZamTaxiLogo';
import { Car, User, ShieldCheck, MapPin, Settings, HelpCircle, Navigation, Info, LayoutDashboard, LogIn, ShieldAlert, Presentation } from 'lucide-react';
// @ts-ignore
import zamfaraLogo from './assets/images/zamfara_state_logo_official.png';
import { 
  subscribeDrivers, 
  subscribePassengers, 
  subscribeTrips, 
  saveDriverToFirestore, 
  savePassengerToFirestore, 
  saveTripToFirestore, 
  seedInitialFirestoreData 
} from './firebase';

export default function App() {
  // 1. Core State Managers
  const [currentCity, setCurrentCity] = useState(CITIES[0]); // Default NYC
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [travelMode, setTravelMode] = useState<'municipal' | 'interstate'>('municipal');
  const [adminSection, setAdminSection] = useState<NavSection>('all');
  const [adminViewMode, setAdminViewMode] = useState<'screen' | 'map'>('screen');
  const [usersViewMode, setUsersViewMode] = useState<'screen' | 'map'>('screen');
  const [userSubTab, setUserSubTab] = useState<'passengers' | 'drivers' | 'admins' | 'control' | 'trips'>('passengers');
  const [selectedUser, setSelectedUser] = useState<{ id: string; type: 'passenger' | 'driver' | 'admin' } | null>(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Initial Passengers fallback
  const INITIAL_PASSENGERS = [
    {
      id: 'rider-1',
      name: 'Ashiru Shehu',
      rating: 4.92,
      balance: 50000.00,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      completedTrips: 12,
      status: 'ACTIVE',
      joinedDate: 'Jul 1, 2026',
      email: 'ashiru@transit.ng',
      phone: '+234 803 111 2233'
    },
    {
      id: 'rider-2',
      name: 'Bello Matawalle',
      rating: 4.85,
      balance: 12500.00,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      completedTrips: 8,
      status: 'ACTIVE',
      joinedDate: 'Jun 28, 2026',
      email: 'bello@transit.ng',
      phone: '+234 806 444 5566'
    },
    {
      id: 'rider-3',
      name: 'Diana Prince',
      rating: 5.0,
      balance: 120000.00,
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150',
      completedTrips: 45,
      status: 'ACTIVE',
      joinedDate: 'May 15, 2026',
      email: 'diana@transit.ng',
      phone: '+234 813 999 8888'
    }
  ];

  // Initial Drivers fallback
  const INITIAL_DRIVERS = MOCK_DRIVERS.map((d, index) => ({
    id: `driver-${index + 1}`,
    name: d.name,
    rating: d.rating,
    vehicleType: (index % 3 === 2 ? 'Black' : index % 3 === 1 ? 'Comfort' : 'X'),
    vehicleName: d.vehicleName,
    plateNumber: d.plateNumber,
    avatar: d.avatar,
    phone: d.phone,
    completedTrips: d.completedTrips,
    isVerified: true,
    status: 'ACTIVE',
    joinedDate: 'May 1, 2026'
  }));

  // User Management State with Firestore Integration
  const [passengers, setPassengers] = useState<any[]>(() => {
    const saved = localStorage.getItem('zamfara_passengers');
    if (saved) return JSON.parse(saved);
    return INITIAL_PASSENGERS;
  });

  const [drivers, setDrivers] = useState<any[]>(() => {
    const saved = localStorage.getItem('zamfara_drivers');
    if (saved) return JSON.parse(saved);
    return INITIAL_DRIVERS;
  });

  // Seed Firestore on startup and subscribe to real-time changes
  useEffect(() => {
    seedInitialFirestoreData(INITIAL_DRIVERS, INITIAL_PASSENGERS);

    const unsubDrivers = subscribeDrivers((remoteDrivers) => {
      if (remoteDrivers.length > 0) {
        setDrivers(remoteDrivers);
      }
    });

    const unsubPassengers = subscribePassengers((remotePassengers) => {
      if (remotePassengers.length > 0) {
        setPassengers(remotePassengers);
      }
    });

    const unsubTrips = subscribeTrips((remoteTrips) => {
      if (remoteTrips.length > 0) {
        setCompletedTrips(remoteTrips);
      }
    });

    return () => {
      unsubDrivers();
      unsubPassengers();
      unsubTrips();
    };
  }, []);

  const [admins, setAdmins] = useState<any[]>(() => {
    const saved = localStorage.getItem('zamfara_admins');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'admin-1',
        name: 'Shehu Gusau',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        role: 'Super Admin',
        status: 'ACTIVE',
        email: 'shehu.admin@nigeria.gov.ng',
        actionsCount: 5
      },
      {
        id: 'admin-2',
        name: 'Ashiru Shehu (Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        role: 'Fleet Manager',
        status: 'ACTIVE',
        email: 'ashiru.shehu@nigeria.gov.ng',
        actionsCount: 18
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('zamfara_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
        category: 'SYSTEM',
        message: 'Nigeria operations engine initialized successfully with Firebase database persistence.'
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
        category: 'SYSTEM',
        message: 'Federal GPS tracking nodes & Firestore data channels connected.'
      }
    ];
  });

  const addAuditLog = (category: 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'RIDER', message: string) => {
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      category,
      message
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Sync state changes to local storage & Firestore
  useEffect(() => {
    localStorage.setItem('zamfara_passengers', JSON.stringify(passengers));
    passengers.forEach((p) => savePassengerToFirestore(p));
  }, [passengers]);

  useEffect(() => {
    localStorage.setItem('zamfara_drivers', JSON.stringify(drivers));
    drivers.forEach((d) => saveDriverToFirestore(d));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('zamfara_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('zamfara_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedRole = localStorage.getItem('zamfara_user_role') as 'rider' | 'driver' | 'admin' | null;
    const role = savedRole || 'rider';
    
    if (role === 'admin') {
      const savedAdmins = localStorage.getItem('zamfara_admins');
      if (savedAdmins) {
        const parsed = JSON.parse(savedAdmins);
        if (parsed && parsed.length > 0) {
          return {
            name: parsed[0].name,
            rating: 5.0,
            balance: 250000.0,
            isDriver: false,
            avatar: parsed[0].avatar,
            role: 'admin'
          };
        }
      }
      return {
        name: 'Shehu Gusau',
        rating: 5.0,
        balance: 250000.0,
        isDriver: false,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        role: 'admin'
      };
    } else if (role === 'driver') {
      const savedDrivers = localStorage.getItem('zamfara_drivers');
      if (savedDrivers) {
        const parsed = JSON.parse(savedDrivers);
        if (parsed && parsed.length > 0) {
          return {
            name: parsed[0].name,
            rating: parsed[0].rating,
            balance: 0.0,
            isDriver: true,
            avatar: parsed[0].avatar,
            role: 'driver'
          };
        }
      }
      return {
        name: 'Michael Scott',
        rating: 4.85,
        balance: 0.0,
        isDriver: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        role: 'driver'
      };
    } else {
      const savedPassengers = localStorage.getItem('zamfara_passengers');
      if (savedPassengers) {
        const parsed = JSON.parse(savedPassengers);
        if (parsed && parsed.length > 0) {
          return {
            name: parsed[0].name,
            rating: parsed[0].rating,
            balance: parsed[0].balance,
            isDriver: false,
            avatar: parsed[0].avatar,
            role: 'rider'
          };
        }
      }
      return {
        name: 'Ashiru Shehu',
        rating: 4.92,
        balance: 50000.00,
        isDriver: false,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        role: 'rider'
      };
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'rider' | 'driver' | 'settings' | 'users'>('dashboard');

  // Enforce access control and synchronize role to localStorage
  useEffect(() => {
    if (profile.role) {
      localStorage.setItem('zamfara_user_role', profile.role);
    }
  }, [profile.role]);

  // Keep active profile balance in sync with passengers state
  useEffect(() => {
    if (profile.role === 'rider') {
      const activePass = passengers.find((p) => p.name === profile.name || p.email === profile.email || p.id === profile.id);
      if (activePass && typeof activePass.balance === 'number' && !isNaN(activePass.balance)) {
        if (activePass.balance !== profile.balance) {
          setProfile((prev) => ({
            ...prev,
            balance: activePass.balance
          }));
        }
      }
    }
  }, [passengers, profile.name, profile.role, profile.email, profile.id]);

  useEffect(() => {
    if (profile.role === 'rider' && activeTab !== 'rider' && activeTab !== 'settings') {
      setActiveTab('rider');
    } else if (profile.role === 'driver' && activeTab !== 'driver' && activeTab !== 'settings') {
      setActiveTab('driver');
    } else if (profile.role === 'admin' && activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'settings') {
      setActiveTab('dashboard');
    }
  }, [profile.role, activeTab]);
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    const saved = localStorage.getItem('zamfara_view_mode');
    return (saved as 'landing' | 'app') || 'landing';
  });
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);
  const [isSurgeActive, setIsSurgeActive] = useState<boolean>(false);
  const [isPeakTraffic, setIsPeakTraffic] = useState<boolean>(() => {
    return localStorage.getItem('zamfara_peak_traffic') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('zamfara_peak_traffic', String(isPeakTraffic));
  }, [isPeakTraffic]);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [replayingTrip, setReplayingTrip] = useState<Trip | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(false);

  const handleReplayTrip = (tripToReplay: Trip) => {
    setReplayingTrip(tripToReplay);
    addAuditLog('SYSTEM', `Replaying animated route trajectory for Trip #${tripToReplay.id} (${tripToReplay.origin.label} → ${tripToReplay.destination.label})`);
  };

  // Driver positions (used for driver mode navigation)
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Animated Roaming street vehicles (ambient canvas traffic)
  const [roamingCars, setRoamingCars] = useState<any[]>([]);

  // Clear state on city change
  const handleCityChange = (cityId: string) => {
    const found = CITIES.find((c) => c.id === cityId);
    if (found) {
      setCurrentCity(found);
      setOrigin(null);
      setDestination(null);
      setTrip(null);
      setChatMessages([]);
    }
  };

  // 2. Initialize Roaming Cars whenever the current city changes
  useEffect(() => {
    if (!currentCity) return;
    const cars = currentCity.landmarks.slice(0, 5).map((lm, idx) => ({
      id: `roamer-${idx}`,
      lat: lm.lat + (Math.random() - 0.5) * 0.008,
      lng: lm.lng + (Math.random() - 0.5) * 0.008,
      angle: Math.random() * Math.PI * 2,
      type: 'cab',
    }));
    setRoamingCars(cars);
  }, [currentCity]);

  // Ambient Roaming cars position ticker loop (300ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setRoamingCars((prev) =>
        prev.map((car) => {
          const speed = 0.00012; // Coordinate increment step
          let nextLat = car.lat + Math.sin(car.angle) * speed;
          let nextLng = car.lng + Math.cos(car.angle) * speed;

          const maxDelta = 0.035; // Bound boundary delta
          let nextAngle = car.angle;

          if (
            Math.abs(nextLat - currentCity.center.lat) > maxDelta ||
            Math.abs(nextLng - currentCity.center.lng) > maxDelta
          ) {
            // Point the vehicle back toward the center of city
            nextAngle =
              Math.atan2(currentCity.center.lat - car.lat, currentCity.center.lng - car.lng) +
              (Math.random() - 0.5) * 0.4;
          } else if (Math.random() < 0.04) {
            // 4% chance to make minor lane wander turns
            nextAngle += (Math.random() - 0.5) * 1.2;
          }

          return {
            ...car,
            lat: nextLat,
            lng: nextLng,
            angle: nextAngle,
          };
        })
      );
    }, 350);

    return () => clearInterval(interval);
  }, [currentCity]);

  // ==========================================
  // 3. RIDER MODE SIMULATION STATE TICKER
  // ==========================================
  const handleBookTrip = (vehicleType: string, price: number, distance: number, duration: number, isPrepaid?: boolean) => {
    if (!origin || !destination) return;

    const actualDuration = isPeakTraffic ? Math.round(duration * 1.8) : duration;

    // Phase 1: Search mode
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      origin,
      destination,
      vehicleType: vehicleType as any,
      price,
      distanceMiles: distance,
      durationMinutes: actualDuration,
      predictedDurationMinutes: duration,
      driver: {
        name: 'Michael Scott',
        rating: 4.85,
        vehicleType: vehicleType as any,
        vehicleName: 'Silver Chrysler Sebring',
        plateNumber: 'SCRN-1',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        phone: '+1 (555) 321-4567',
        completedTrips: 1140,
      },
      status: 'SEARCHING',
      progress: 0,
      routePoints: [],
      currentPosition: origin,
      timestamp: new Date().toISOString(),
      passengerName: profile.name,
      passengerAvatar: profile.avatar,
      passengerRating: profile.rating,
      isPrepaid: !!isPrepaid
    };

    setTrip(newTrip);
    setChatMessages([]);

    // Step 2: Auto match driver after 3 seconds ONLY if no driver is online/scanning
    if (!isDriverOnline) {
      setTimeout(() => {
        // Pick an active, verified driver from dynamic user state
        const activeVerifiedDrivers = drivers.filter((d: any) => d.isVerified && d.status === 'ACTIVE');
        let matchedDriver;

        if (activeVerifiedDrivers.length > 0) {
          // Find one matching the vehicleType if possible, otherwise any verified driver
          const matchingType = activeVerifiedDrivers.filter((d: any) => d.vehicleType === vehicleType);
          const selectedDrv = matchingType.length > 0 
            ? matchingType[Math.floor(Math.random() * matchingType.length)] 
            : activeVerifiedDrivers[Math.floor(Math.random() * activeVerifiedDrivers.length)];
          
          matchedDriver = {
            name: selectedDrv.name,
            rating: selectedDrv.rating,
            vehicleType: vehicleType as any,
            vehicleName: selectedDrv.vehicleName,
            plateNumber: selectedDrv.plateNumber,
            avatar: selectedDrv.avatar,
            phone: selectedDrv.phone,
            completedTrips: selectedDrv.completedTrips
          };
        } else {
          // Fallback to static config
          const randomDriverIdx = Math.floor(Math.random() * MOCK_DRIVERS.length);
          const matchedMock = MOCK_DRIVERS[randomDriverIdx];
          const vehicleConf = VEHICLE_CONFIGS.find((v) => v.id === vehicleType);
          matchedDriver = {
            ...matchedMock,
            vehicleType: vehicleType as any,
            vehicleName: matchedMock.vehicleName.includes('Sebring')
              ? `${vehicleConf?.name || 'ZamTaxi Green'} • ${matchedMock.vehicleName}`
              : `${vehicleConf?.name || 'ZamTaxi Green'} • ${matchedMock.vehicleName}`,
          };
        }

        setTrip((prev) => {
          if (!prev) return null;
          // Position driver vehicle slightly away initially for Pick-up drive-in effect
          const driverStartPos = {
            lat: prev.origin.lat + (Math.random() - 0.5) * 0.015,
            lng: prev.origin.lng + (Math.random() - 0.5) * 0.015,
          };

          return {
            ...prev,
            driver: matchedDriver,
            status: 'ACCEPTED',
            currentPosition: driverStartPos,
          };
        });

        // Send initial driver greet message
        const driverPhrases = MOCK_DRIVER_CHATBOT_PHRASES.ACCEPTED;
        const initialGreet = driverPhrases[Math.floor(Math.random() * driverPhrases.length)];

        setTimeout(() => {
          setChatMessages([
            {
              id: 'init-greet',
              sender: 'driver',
              text: initialGreet,
              timestamp: new Date().toISOString(),
            },
          ]);
        }, 1000);
      }, 3000);
    } else {
      addAuditLog('SYSTEM', `Rider is searching for a driver. Broadcasting request to online driver consoles...`);
    }
  };

  const handleAcceptTripByDriver = (tripDetails: {
    id: string;
    passengerName: string;
    passengerAvatar: string;
    passengerRating: number;
    origin: Location;
    destination: Location;
    price: number;
    distance: number;
    duration: number;
  }) => {
    setTrip((prev) => {
      if (!prev || prev.id !== tripDetails.id) return prev;
      
      const driverStartPos = {
        lat: prev.origin.lat + (Math.random() - 0.5) * 0.015,
        lng: prev.origin.lng + (Math.random() - 0.5) * 0.015,
      };

      return {
        ...prev,
        status: 'ACCEPTED',
        currentPosition: driverStartPos,
        driver: {
          name: profile.name,
          rating: profile.rating,
          vehicleType: prev.vehicleType,
          vehicleName: 'Silver Chrysler Sebring',
          plateNumber: 'ZMF-001',
          avatar: profile.avatar,
          phone: '+234 803 123 4567',
          completedTrips: 142,
        },
      };
    });

    addAuditLog('DRIVER', `Driver ${profile.name} accepted ride request ${tripDetails.id} from ${tripDetails.passengerName}.`);

    // Send initial driver greet message
    const driverPhrases = MOCK_DRIVER_CHATBOT_PHRASES.ACCEPTED;
    const initialGreet = driverPhrases[Math.floor(Math.random() * driverPhrases.length)];

    setTimeout(() => {
      setChatMessages([
        {
          id: 'init-greet',
          sender: 'driver',
          text: initialGreet,
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 1000);
  };

  // Automated Active Ride Simulation Telemetry Ticker (Runs when trip status changes)
  useEffect(() => {
    if (!trip) return;
    let timer: NodeJS.Timeout;

    // Helper: Linear coordinate interpolation
    const interpolate = (start: { lat: number; lng: number }, end: { lat: number; lng: number }, factor: number) => {
      return {
        lat: start.lat + (end.lat - start.lat) * factor,
        lng: start.lng + (end.lng - start.lng) * factor,
      };
    };

    // DRIVER EN ROUTE TO PICKUP (Leg 1)
    if (trip.status === 'ACCEPTED' || trip.status === 'PICKING_UP') {
      const startPos = { ...trip.currentPosition };
      const targetPos = { lat: trip.origin.lat, lng: trip.origin.lng };

      let localFactor = 0;
      const leg1Interval = isPeakTraffic ? 3600 : 1800; // 2x slower when Peak Traffic is ON
      const leg1Increment = isPeakTraffic ? 0.1 : 0.2;

      timer = setInterval(() => {
        localFactor += leg1Increment;
        if (localFactor >= 1.0) {
          clearInterval(timer);
          setTrip((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: 'ARRIVED',
              progress: 1.0,
              currentPosition: targetPos,
            };
          });

          // Send "I have arrived" greeting
          const arrivedPhrases = MOCK_DRIVER_CHATBOT_PHRASES.ARRIVED;
          const greetArrive = arrivedPhrases[Math.floor(Math.random() * arrivedPhrases.length)]
            .replace('[CAR]', trip.driver.vehicleName.split('•')[1] || 'vehicle');

          setTimeout(() => {
            setChatMessages((prevMsg) => [
              ...prevMsg,
              {
                id: `arrive-greet-${Date.now()}`,
                sender: 'driver',
                text: greetArrive,
                timestamp: new Date().toISOString(),
                status: 'read',
              },
            ]);
          }, 1000);
        } else {
          setTrip((prev) => {
            if (!prev) return null;
            const currentInt = interpolate(startPos, targetPos, localFactor);
            return {
              ...prev,
              status: 'PICKING_UP',
              progress: localFactor,
              currentPosition: currentInt,
            };
          });
        }
      }, leg1Interval);
    }

    // WAITING FOR BOARDING AT PICKUP SPOT
    if (trip.status === 'ARRIVED') {
      // Auto transition to "IN_PROGRESS" after passenger boards (4 seconds)
      timer = setTimeout(() => {
        setTrip((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'TRIP_IN_PROGRESS',
            progress: 0.0,
            currentPosition: { lat: prev.origin.lat, lng: prev.origin.lng },
          };
        });

        // Send travel dialogue
        const ridePhrases = MOCK_DRIVER_CHATBOT_PHRASES.TRIP_IN_PROGRESS;
        const greetTrip = ridePhrases[Math.floor(Math.random() * ridePhrases.length)]
          .replace('[ETA]', String(trip.durationMinutes));

        setTimeout(() => {
          setChatMessages((prevMsg) => [
            ...prevMsg,
            {
              id: `trip-greet-${Date.now()}`,
              sender: 'driver',
              text: greetTrip,
              timestamp: new Date().toISOString(),
              status: 'read',
            },
          ]);
        }, 1500);
      }, 4500);
    }

    // TRIP TO DESTINATION ACTIVE DRIVE (Leg 2)
    if (trip.status === 'TRIP_IN_PROGRESS') {
      const startPos = { lat: trip.origin.lat, lng: trip.origin.lng };
      const targetPos = { lat: trip.destination.lat, lng: trip.destination.lng };

      let localFactor = 0;
      const leg2Interval = isPeakTraffic ? 4000 : 2000; // 2x slower when Peak Traffic is ON
      const leg2Increment = isPeakTraffic ? 0.075 : 0.15;

      timer = setInterval(() => {
        localFactor += leg2Increment;
        if (localFactor >= 1.0) {
          clearInterval(timer);
          // Complete and charge passenger account (if not pre-paid)
          setProfile((prev) => {
            const nextBal = trip.isPrepaid ? prev.balance : parseFloat((prev.balance - trip.price).toFixed(2));
            
            // Sync inside passengers list
            setPassengers((prevList) => prevList.map(p => {
              if (p.name === prev.name) {
                return {
                  ...p,
                  balance: nextBal,
                  completedTrips: p.completedTrips + 1
                };
              }
              return p;
            }));
            
            return {
              ...prev,
              balance: nextBal,
            };
          });

          // Sync inside drivers list
          setDrivers((prevList) => prevList.map(d => {
            if (d.name === trip.driver.name) {
              return {
                ...d,
                completedTrips: d.completedTrips + 1
              };
            }
            return d;
          }));

          // Add dynamic system log
          if (trip.isPrepaid) {
            addAuditLog('SYSTEM', `Trip completed! Pre-paid scheduled ride (₦${trip.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}) fulfilled. Rider ${profile.name} account finalized.`);
          } else {
            addAuditLog('SYSTEM', `Trip completed! Charged Rider ${profile.name} ₦${trip.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Driver ${trip.driver.name} credited.`);
          }

          setTrip((prev) => {
            if (!prev) return null;
            const completedTrip = {
              ...prev,
              status: 'COMPLETED' as const,
              progress: 1.0,
              currentPosition: targetPos,
              rating: 5,
              review: 'Great ride!',
            };
            setCompletedTrips((current) => [...current, completedTrip]);
            saveTripToFirestore(completedTrip);
            return completedTrip;
          });
        } else {
          setTrip((prev) => {
            if (!prev) return null;
            const currentInt = interpolate(startPos, targetPos, localFactor);
            return {
              ...prev,
              status: 'TRIP_IN_PROGRESS',
              progress: localFactor,
              currentPosition: currentInt,
            };
          });
        }
      }, leg2Interval);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [trip?.status, isPeakTraffic]);

  // Cancel ongoing trip
  const handleCancelTrip = () => {
    setTrip(null);
    setChatMessages([]);
  };

  const handleCompleteTripRating = (rating: number, reviewText: string, tipAmount: number = 0) => {
    // Save rating summary and tip to analytics list, update driver balance, then return to idle state
    if (trip) {
      if (tipAmount > 0) {
        // Update driver balance in drivers list
        setDrivers((prevDrivers) =>
          prevDrivers.map((d) => {
            if (d.name === trip.driver.name || d.id === trip.driver.phone) {
              const currentBal = d.balance || 0;
              return {
                ...d,
                balance: currentBal + tipAmount,
              };
            }
            return d;
          })
        );

        // Deduct tip from active rider profile balance if available
        if (profile) {
          setProfile((prev) => ({
            ...prev,
            balance: Math.max(0, (prev.balance || 0) - tipAmount),
          }));
        }

        // Create audit log entry
        addAuditLog(
          'RIDER',
          `${profile.name || 'Rider'} tipped driver ${trip.driver.name} ₦${tipAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for completed trip #${trip.id}.`
        );
      }

      setCompletedTrips((current) => {
        const index = current.findIndex(t => t.id === trip.id);
        let finalTrip: Trip;
        let updated: Trip[];
        if (index !== -1) {
          updated = [...current];
          finalTrip = {
            ...updated[index],
            rating,
            review: reviewText,
            tip: tipAmount
          };
          updated[index] = finalTrip;
        } else {
          finalTrip = { ...trip, rating, review: reviewText, tip: tipAmount, status: 'COMPLETED' as const };
          updated = [...current, finalTrip];
        }
        saveTripToFirestore(finalTrip);
        return updated;
      });
    }
    setTrip(null);
    setChatMessages([]);
    setOrigin(null);
    setDestination(null);
  };

  // Passenger Sends chat message, automatic driver response trigger
  const handleSendMessage = (text: string) => {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: msgId,
      sender: 'rider',
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Step 1: Upgrade to 'delivered' after 600ms
    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === msgId ? { ...msg, status: 'delivered' } : msg))
      );
    }, 600);

    // Step 2: Upgrade to 'read' after 1300ms
    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === msgId ? { ...msg, status: 'read' } : msg))
      );
    }, 1300);

    // Driver automatic reply simulator
    if (trip) {
      setTimeout(() => {
        let reply = '';
        const currentStage = trip.status;

        if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
          reply = `Hello! I'm focused on driving, but navigating to destination safely. See you soon!`;
        } else if (text.toLowerCase().includes('where') || text.toLowerCase().includes('far')) {
          reply = `Checking GPS: The traffic isn't too bad, we should arrive in about ${Math.max(
            1,
            Math.round(trip.durationMinutes * (1 - trip.progress))
          )} minutes!`;
        } else if (text.toLowerCase().includes('ac') || text.toLowerCase().includes('cold') || text.toLowerCase().includes('hot')) {
          reply = `Got it! Adjusting climate controls immediately for your comfort.`;
        } else {
          // Fallback based on stage
          const phraseBank = MOCK_DRIVER_CHATBOT_PHRASES[currentStage] || MOCK_DRIVER_CHATBOT_PHRASES.ACCEPTED;
          reply = phraseBank[Math.floor(Math.random() * phraseBank.length)]
            .replace('[CAR]', trip.driver.vehicleName.split('•')[1] || 'vehicle')
            .replace('[ETA]', String(Math.max(1, Math.round(trip.durationMinutes * (1 - trip.progress)))));
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            sender: 'driver',
            text: reply,
            timestamp: new Date().toISOString(),
            status: 'read',
          },
        ]);
      }, 1800);
    }
  };

  const handleTriggerRandomTrip = (mockTrip: Trip) => {
    setCompletedTrips((prev) => [...prev, mockTrip]);
    saveTripToFirestore(mockTrip);
    // Set the simulated completed trip as the active map view so we see its endpoints!
    setTrip(mockTrip);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        passengers={passengers}
        setPassengers={setPassengers}
        drivers={drivers}
        setDrivers={setDrivers}
        admins={admins}
        setAdmins={setAdmins}
        onLoginSuccess={(role, userProfile, activeTabName) => {
          setProfile(userProfile);
          setActiveTab(activeTabName);
          setCurrentView('app');
          localStorage.setItem('zamfara_view_mode', 'app');
        }}
        addAuditLog={addAuditLog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-zinc-900 flex flex-col font-sans selection:bg-amber-200 selection:text-zinc-900" id="uber-simulator-root">
      
      {/* GLOBAL HIGH-CONTRAST HEADER */}
      <header className="bg-[#FAF7F2] border-b border-[#E5DFD3] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <ZamTaxiLogo size="md" showSubtext={true} />
        </div>

        {/* Core Tab Switch Control */}
        <div className="flex bg-[#F2EDE4] rounded-xl p-1 border border-[#E5DFD3] shadow-inner">
          {profile.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-zinc-900 shadow-md border border-[#E5DFD3]'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                id="tab-select-dashboard"
              >
                <LayoutDashboard size={13} />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('users');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-white text-zinc-900 shadow-md border border-[#E5DFD3]'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                id="tab-select-users"
              >
                <ShieldCheck size={13} />
                User Hub
              </button>
            </>
          )}

          {profile.role === 'rider' && (
            <button
              onClick={() => {
                setActiveTab('rider');
                setProfile((p) => ({ ...p, isDriver: false }));
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rider'
                  ? 'bg-white text-zinc-900 shadow-md border border-[#E5DFD3]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              id="tab-select-rider"
            >
              <User size={13} />
              Rider Mode
            </button>
          )}

          {profile.role === 'driver' && (
            <button
              onClick={() => {
                setActiveTab('driver');
                setProfile((p) => ({ ...p, isDriver: true }));
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'driver'
                  ? 'bg-white text-zinc-900 shadow-md border border-[#E5DFD3]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              id="tab-select-driver"
            >
              <Car size={13} />
              Driver Mode
            </button>
          )}
        </div>

        {/* Secondary Navigation & Balance HUD */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Account Balance</span>
            <div className="text-emerald-700 font-extrabold text-sm">₦{profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <button
            onClick={() => setIsPresentationOpen(true)}
            className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition cursor-pointer flex items-center gap-1.5 font-bold text-xs shadow-2xs"
            title="System Presentation for Stakeholders"
            id="btn-open-presentation-modal"
          >
            <Presentation size={15} className="text-emerald-700" />
            <span className="hidden md:inline">Presentation Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-zinc-900 border-zinc-400 shadow-md font-bold'
                : 'bg-white text-zinc-700 border-[#E5DFD3] hover:text-zinc-900 hover:bg-[#F2EDE4]'
            }`}
            title="Settings & Credentials"
            id="tab-select-settings"
          >
            <Settings size={16} />
          </button>

          <button
            onClick={() => {
              setCurrentView('landing');
              localStorage.setItem('zamfara_view_mode', 'landing');
              addAuditLog('SYSTEM', `${profile.name} logged out of current session. Returned to Landing Portal.`);
            }}
            className="p-2.5 rounded-xl border bg-white text-red-600 border-[#E5DFD3] hover:text-red-700 hover:bg-red-50/80 transition cursor-pointer flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs"
            title="Log Out to Landing"
            id="btn-logout-portal"
          >
            <LogIn size={15} className="rotate-180" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* CORE TWO-COLUMN MAIN FRAME */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: INTERACTIVE INPUT PANEL (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 h-full flex flex-col justify-start">
          {activeTab === 'dashboard' && (
            profile.role === 'admin' ? (
              <DashboardPanel
                completedTrips={completedTrips}
                onTriggerRandomTrip={handleTriggerRandomTrip}
                isSurgeActive={isSurgeActive}
                setIsSurgeActive={setIsSurgeActive}
                isPeakTraffic={isPeakTraffic}
                setIsPeakTraffic={setIsPeakTraffic}
                currentCity={currentCity}
                onReplayTrip={(trip) => {
                  setAdminViewMode('map');
                  handleReplayTrip(trip);
                }}
                activeSection={adminSection}
                onSelectSection={(sec) => {
                  setAdminSection(sec);
                  setAdminViewMode('screen');
                }}
              />
            ) : (
              <div className="bg-white border border-red-200 p-6 rounded-2xl text-center space-y-4 shadow-md">
                <ShieldAlert className="mx-auto text-red-600 animate-bounce" size={48} />
                <h3 className="text-zinc-900 font-extrabold text-lg">Access Denied</h3>
                <p className="text-zinc-600 text-xs">You do not have administrative privileges to access the Operations Dashboard.</p>
              </div>
            )
          )}

          {activeTab === 'rider' && (
            profile.role === 'rider' ? (
              <RiderPanel
                city={currentCity}
                cities={CITIES}
                onCityChange={handleCityChange}
                origin={origin}
                destination={destination}
                setOrigin={setOrigin}
                setDestination={setDestination}
                trip={trip}
                onBookTrip={handleBookTrip}
                onCancelTrip={handleCancelTrip}
                onCompleteTripRating={handleCompleteTripRating}
                chatMessages={chatMessages}
                onSendMessage={handleSendMessage}
                isSurgeActive={isSurgeActive}
                isPeakTraffic={isPeakTraffic}
                travelMode={travelMode}
                setTravelMode={setTravelMode}
                profile={profile}
                setProfile={setProfile}
                passengers={passengers}
                setPassengers={setPassengers}
                addAuditLog={addAuditLog}
                onReplayTrip={handleReplayTrip}
                allTrips={completedTrips}
              />
            ) : (
              <div className="bg-white border border-red-200 p-6 rounded-2xl text-center space-y-4 shadow-md">
                <ShieldAlert className="mx-auto text-red-600" size={48} />
                <h3 className="text-zinc-900 font-extrabold text-lg">Rider Session Required</h3>
                <p className="text-zinc-600 text-xs">Please login with a Rider account to use the Rider booking system.</p>
              </div>
            )
          )}

          {activeTab === 'driver' && (
            profile.role === 'driver' ? (
              <DriverPanel
                city={currentCity}
                profile={profile}
                setProfile={setProfile}
                driverPosition={driverPosition}
                setDriverPosition={setDriverPosition}
                onAcceptTripByDriver={handleAcceptTripByDriver}
                existingTrip={trip}
                setExistingTrip={setTrip}
                isDriverOnline={isDriverOnline}
                setIsDriverOnline={setIsDriverOnline}
                onReplayTrip={handleReplayTrip}
                allTrips={completedTrips}
              />
            ) : (
              <div className="bg-white border border-red-200 p-6 rounded-2xl text-center space-y-4 shadow-md">
                <ShieldAlert className="mx-auto text-red-600" size={48} />
                <h3 className="text-zinc-900 font-extrabold text-lg">Driver Session Required</h3>
                <p className="text-zinc-600 text-xs">Please login with a Driver account to access the Driver console.</p>
              </div>
            )
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              profile={profile}
              setProfile={setProfile}
              addAuditLog={addAuditLog}
              onClearHistory={() => {
                setOrigin(null);
                setDestination(null);
                setTrip(null);
                setChatMessages([]);
              }}
            />
          )}

          {activeTab === 'users' && (
            profile.role === 'admin' ? (
              <UserManagementPanel
                activeProfile={profile}
                setActiveProfile={setProfile}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                passengers={passengers}
                setPassengers={setPassengers}
                drivers={drivers}
                setDrivers={setDrivers}
                admins={admins}
                setAdmins={setAdmins}
                auditLogs={auditLogs}
                addAuditLog={addAuditLog}
                isSurgeActive={isSurgeActive}
                setIsSurgeActive={setIsSurgeActive}
                isPeakTraffic={isPeakTraffic}
                setIsPeakTraffic={setIsPeakTraffic}
                completedTrips={completedTrips}
                subTab={userSubTab}
                onSelectSubTab={(st) => {
                  setUserSubTab(st);
                  setSelectedUser(null);
                  setUsersViewMode('screen');
                }}
                selectedUserId={selectedUser?.id}
                onSelectUser={(userId, type) => {
                  setSelectedUser(userId ? { id: userId, type } : null);
                  setUsersViewMode('screen');
                }}
              />
            ) : (
              <div className="bg-white border border-red-200 p-6 rounded-2xl text-center space-y-4 shadow-md">
                <ShieldAlert className="mx-auto text-red-600 animate-bounce" size={48} />
                <h3 className="text-zinc-900 font-extrabold text-lg">Access Denied</h3>
                <p className="text-zinc-600 text-xs">You do not have administrative privileges to access the User Hub or inspect other users' details.</p>
              </div>
            )
          )}
        </div>

        {/* RIGHT COLUMN: DISPLAY SCREEN OR LARGE MAP CONTAINER (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 min-h-[400px] lg:h-full relative flex flex-col">
          {activeTab === 'dashboard' && profile.role === 'admin' && adminViewMode === 'screen' ? (
            <DashboardDisplayScreen
              activeSection={adminSection}
              setActiveSection={setAdminSection}
              completedTrips={completedTrips}
              onTriggerRandomTrip={handleTriggerRandomTrip}
              isSurgeActive={isSurgeActive}
              setIsSurgeActive={setIsSurgeActive}
              isPeakTraffic={isPeakTraffic}
              setIsPeakTraffic={setIsPeakTraffic}
              currentCity={currentCity}
              onReplayTrip={(trip) => {
                setAdminViewMode('map');
                handleReplayTrip(trip);
              }}
              onShowMap={() => setAdminViewMode('map')}
            />
          ) : activeTab === 'users' && profile.role === 'admin' && usersViewMode === 'screen' ? (
            <UserManagementDisplayScreen
              activeProfile={profile}
              setActiveProfile={setProfile}
              setActiveTab={setActiveTab}
              subTab={userSubTab}
              setSubTab={setUserSubTab}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              passengers={passengers}
              setPassengers={setPassengers}
              drivers={drivers}
              setDrivers={setDrivers}
              admins={admins}
              setAdmins={setAdmins}
              auditLogs={auditLogs}
              addAuditLog={addAuditLog}
              isSurgeActive={isSurgeActive}
              setIsSurgeActive={setIsSurgeActive}
              isPeakTraffic={isPeakTraffic}
              setIsPeakTraffic={setIsPeakTraffic}
              completedTrips={completedTrips}
              onShowMap={() => setUsersViewMode('map')}
              onReplayTrip={(trip) => {
                setUsersViewMode('map');
                handleReplayTrip(trip);
              }}
            />
          ) : (
            <MapContainer
              city={currentCity}
              origin={origin}
              destination={destination}
              setOrigin={setOrigin}
              setDestination={setDestination}
              trip={trip}
              isDriverMode={activeTab === 'driver'}
              driverPosition={driverPosition}
              roamingCars={roamingCars}
              travelMode={travelMode}
              replayingTrip={replayingTrip}
              onStopReplay={() => setReplayingTrip(null)}
            />
          )}
        </div>
      </main>

      {/* FOOTER METRICS HUD */}
      <footer className="bg-[#FAF7F2] border-t border-[#E5DFD3] px-6 py-3.5 text-zinc-600 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span className="font-semibold">Secured Sandboxed Simulation Environment</span>
        </div>
        <div className="flex gap-4 font-mono text-[10px] tracking-tight text-zinc-600">
          <span>SERVER TIME: {new Date().toLocaleTimeString()}</span>
          <span>CITY ID: {currentCity.id.toUpperCase()}</span>
        </div>
      </footer>

      <StakeholderPresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />
    </div>
  );
}
