export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export type VehicleType = 'X' | 'Comfort' | 'Black';

export interface VehicleConfig {
  id: VehicleType;
  name: string;
  multiplier: number;
  capacity: number;
  description: string;
  etaMinutes: number;
  icon: string;
}

export interface Driver {
  name: string;
  rating: number;
  vehicleType: VehicleType;
  vehicleName: string;
  plateNumber: string;
  avatar: string;
  phone: string;
  completedTrips: number;
}

export type TripStatus =
  | 'IDLE'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'PICKING_UP'
  | 'ARRIVED'
  | 'TRIP_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Trip {
  id: string;
  origin: Location;
  destination: Location;
  vehicleType: VehicleType;
  price: number;
  distanceMiles: number;
  durationMinutes: number;
  driver: Driver;
  status: TripStatus;
  progress: number; // 0 to 1 representing the current leg
  routePoints: { lat: number; lng: number }[];
  currentPosition: { lat: number; lng: number };
  rating?: number;
  review?: string;
  timestamp: string;
  passengerName?: string;
  passengerAvatar?: string;
  passengerRating?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'rider' | 'driver';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  rating: number;
  balance: number;
  isDriver: boolean;
  avatar: string;
  role: 'rider' | 'driver' | 'admin';
}
