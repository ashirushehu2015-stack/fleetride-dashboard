import { Trip, Location, Driver, VehicleType } from '../types';
import { MOCK_DRIVERS, CITIES } from '../data';

/**
 * Filter trips associated with a specific passenger (case-insensitive name and id matching).
 */
export function filterTripsForPassenger(
  pass: { id?: string; name?: string },
  trips: Trip[]
): Trip[] {
  if (!pass || !trips) return [];
  const nameLower = (pass.name || '').toLowerCase().trim();
  const idLower = (pass.id || '').toLowerCase().trim();

  return trips.filter((t) => {
    const tPassengerName = (t.passengerName || '').toLowerCase().trim();
    const tPassengerId = ((t as any).passengerId || '').toLowerCase().trim();

    return (
      (nameLower && tPassengerName === nameLower) ||
      (idLower && tPassengerId === idLower) ||
      (nameLower && tPassengerId === nameLower) ||
      (idLower && tPassengerName === idLower)
    );
  });
}

/**
 * Filter trips associated with a specific driver (case-insensitive name and id matching).
 */
export function filterTripsForDriver(
  driver: { id?: string; name?: string },
  trips: Trip[]
): Trip[] {
  if (!driver || !trips) return [];
  const nameLower = (driver.name || '').toLowerCase().trim();
  const idLower = (driver.id || '').toLowerCase().trim();

  return trips.filter((t) => {
    const dName = (t.driver?.name || '').toLowerCase().trim();
    const dId = ((t.driver as any)?.id || '').toLowerCase().trim();

    return (
      (nameLower && dName === nameLower) ||
      (idLower && dId === idLower) ||
      (nameLower && dId === nameLower) ||
      (idLower && dName === idLower)
    );
  });
}

/**
 * Sample routes in Nigeria for realistic history log generation
 */
const SAMPLE_ROUTES: { origin: Location; destination: Location; distance: number; duration: number; fare: number }[] = [
  {
    origin: { lat: 12.1610, lng: 6.6620, label: 'Gusau Central Mosque' },
    destination: { lat: 12.1950, lng: 6.7050, label: 'Federal University Gusau' },
    distance: 8.4,
    duration: 18,
    fare: 4500.00
  },
  {
    origin: { lat: 12.1550, lng: 6.6550, label: 'Government House Complex' },
    destination: { lat: 12.1750, lng: 6.6850, label: 'Gusau Municipal Airstrip' },
    distance: 6.2,
    duration: 14,
    fare: 3800.00
  },
  {
    origin: { lat: 9.0665, lng: 7.4512, label: 'Aso Villa Presidential Palace' },
    destination: { lat: 9.0761, lng: 7.3743, label: 'Jabi Lake Mall' },
    distance: 12.5,
    duration: 25,
    fare: 7500.00
  },
  {
    origin: { lat: 9.0820, lng: 7.3850, label: 'Wuse Modern Market' },
    destination: { lat: 9.0682, lng: 7.4320, label: 'Millennium Park Garden' },
    distance: 7.1,
    duration: 16,
    fare: 4200.00
  },
  {
    origin: { lat: 6.4921, lng: 3.3512, label: 'Ikeja City Mall' },
    destination: { lat: 6.4312, lng: 3.4285, label: 'Victoria Island Hub' },
    distance: 18.2,
    duration: 38,
    fare: 11500.00
  },
  {
    origin: { lat: 6.4381, lng: 3.4423, label: 'Lekki Toll Plaza' },
    destination: { lat: 6.4172, lng: 3.4184, label: 'Eko Atlantic City' },
    distance: 5.6,
    duration: 12,
    fare: 3500.00
  },
  {
    origin: { lat: 11.9961, lng: 8.5734, label: 'Kurmi Traditional Market' },
    destination: { lat: 11.9832, lng: 8.5331, label: 'Bayero University (BUK)' },
    distance: 9.8,
    duration: 22,
    fare: 5800.00
  },
  {
    origin: { lat: 4.8214, lng: 7.0260, label: 'PH Pleasure Park' },
    destination: { lat: 4.8112, lng: 7.0395, label: 'GRA Phase II Avenue' },
    distance: 4.5,
    duration: 10,
    fare: 3200.00
  }
];

/**
 * Generate historical trip logs for a passenger to ensure ride history and total spendings match profile completedTrips count.
 */
export function generatePassengerHistoricalTrips(
  passenger: { id: string; name: string; avatar?: string; rating?: number; completedTrips?: number }
): Trip[] {
  const targetCount = passenger.completedTrips && passenger.completedTrips > 0 ? passenger.completedTrips : 5;
  const trips: Trip[] = [];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < targetCount; i++) {
    const route = SAMPLE_ROUTES[i % SAMPLE_ROUTES.length];
    const rawDriver = MOCK_DRIVERS[i % MOCK_DRIVERS.length];

    const driver: Driver = {
      name: rawDriver.name,
      rating: rawDriver.rating,
      vehicleType: (i % 3 === 2 ? 'Black' : i % 3 === 1 ? 'Comfort' : 'X') as VehicleType,
      vehicleName: rawDriver.vehicleName,
      plateNumber: rawDriver.plateNumber,
      avatar: rawDriver.avatar,
      phone: rawDriver.phone,
      completedTrips: rawDriver.completedTrips
    };

    // Calculate timestamp decreasing into the past
    const tripTime = new Date(now - (i * 2.5 + 0.5) * dayMs).toISOString();

    const trip: Trip = {
      id: `hist-trip-${passenger.id}-${i + 1}`,
      origin: route.origin,
      destination: route.destination,
      vehicleType: driver.vehicleType,
      price: route.fare,
      distanceMiles: route.distance,
      durationMinutes: route.duration,
      driver,
      status: 'COMPLETED',
      progress: 1.0,
      routePoints: [route.origin, route.destination],
      currentPosition: route.destination,
      timestamp: tripTime,
      passengerName: passenger.name,
      passengerAvatar: passenger.avatar,
      passengerRating: passenger.rating || 4.9,
      // @ts-ignore
      passengerId: passenger.id
    };

    trips.push(trip);
  }

  return trips;
}
