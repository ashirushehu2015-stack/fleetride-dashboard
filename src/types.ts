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

export interface ScheduledRide {
  id: string;
  origin: Location;
  destination: Location;
  vehicleType: VehicleType;
  estimatedPrice: number;
  scheduledDate: string; // e.g. YYYY-MM-DD
  scheduledTime: string; // e.g. HH:mm
  scheduledTimestamp: string; // ISO String
  status: 'SCHEDULED' | 'DISPATCHED' | 'CANCELLED';
  createdAt: string;
  notes?: string;
  travelMode?: 'municipal' | 'interstate';
  isPaid?: boolean;
  paidAmount?: number;
}

export type TripStatus =
  | 'IDLE'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'PICKING_UP'
  | 'ARRIVED'
  | 'TRIP_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PENDING'
  | 'Pending'
  | 'SCHEDULED';

export interface Trip {
  id: string;
  origin: Location;
  destination: Location;
  vehicleType: VehicleType;
  price: number;
  distanceMiles: number;
  durationMinutes: number;
  predictedDurationMinutes?: number;
  driver: Driver;
  status: TripStatus;
  progress: number; // 0 to 1 representing the current leg
  routePoints: { lat: number; lng: number }[];
  currentPosition: { lat: number; lng: number };
  rating?: number;
  review?: string;
  tip?: number;
  timestamp: string;
  passengerName?: string;
  passengerAvatar?: string;
  passengerRating?: number;
  isPrepaid?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  travelMode?: 'municipal' | 'interstate';
}

export interface ChatMessage {
  id: string;
  sender: 'rider' | 'driver';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface UserProfile {
  name: string;
  rating: number;
  balance: number;
  isDriver: boolean;
  avatar: string;
  role: 'rider' | 'driver' | 'admin';
  id?: string;
  vehicleType?: VehicleType;
  vehicleName?: string;
  plateNumber?: string;
  phone?: string;
  email?: string;
  completedTrips?: number;
  is2FAEnabled?: boolean;
  twoFactorMethod?: 'SMS' | 'TOTP' | 'EMAIL';
  twoFactorPhone?: string;
  twoFactorSecret?: string;
}

export interface UserFeedback {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  category?: string;
  comment: string;
  rating?: number;
  timestamp: number;
}
