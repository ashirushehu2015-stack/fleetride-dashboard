import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Firestore Helper Functions for Drivers, Passengers, and Trips

// 1. Subscribe to Drivers
export function subscribeDrivers(callback: (drivers: any[]) => void) {
  const colRef = collection(db, 'drivers');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'drivers');
    }
  );
}

// Save or Update Driver
export async function saveDriverToFirestore(driver: any) {
  const path = `drivers/${driver.id}`;
  try {
    await setDoc(doc(db, 'drivers', driver.id), driver, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Driver
export async function deleteDriverFromFirestore(driverId: string) {
  const path = `drivers/${driverId}`;
  try {
    await deleteDoc(doc(db, 'drivers', driverId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Subscribe to Passengers
export function subscribePassengers(callback: (passengers: any[]) => void) {
  const colRef = collection(db, 'passengers');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'passengers');
    }
  );
}

// Save or Update Passenger
export async function savePassengerToFirestore(passenger: any) {
  const path = `passengers/${passenger.id}`;
  try {
    await setDoc(doc(db, 'passengers', passenger.id), passenger, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Passenger
export async function deletePassengerFromFirestore(passengerId: string) {
  const path = `passengers/${passengerId}`;
  try {
    await deleteDoc(doc(db, 'passengers', passengerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Subscribe to Trips
export function subscribeTrips(callback: (trips: any[]) => void) {
  const colRef = collection(db, 'trips');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'trips');
    }
  );
}

// Save or Add Completed Trip
export async function saveTripToFirestore(trip: any) {
  const path = `trips/${trip.id}`;
  try {
    await setDoc(doc(db, 'trips', String(trip.id)), trip, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. Feedback Collection
export async function saveFeedbackToFirestore(feedback: {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  category?: string;
  comment: string;
  rating?: number;
  timestamp: number;
}) {
  const path = `feedback/${feedback.id}`;
  try {
    await setDoc(doc(db, 'feedback', feedback.id), feedback, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeFeedback(callback: (feedbackList: any[]) => void) {
  const colRef = collection(db, 'feedback');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedback');
    }
  );
}

// Seed initial Firestore collections if empty
export async function seedInitialFirestoreData(initialDrivers: any[], initialPassengers: any[]) {
  try {
    const driversSnap = await getDocs(collection(db, 'drivers'));
    if (driversSnap.empty) {
      for (const d of initialDrivers) {
        await setDoc(doc(db, 'drivers', d.id), d);
      }
    }

    const passengersSnap = await getDocs(collection(db, 'passengers'));
    if (passengersSnap.empty) {
      for (const p of initialPassengers) {
        await setDoc(doc(db, 'passengers', p.id), p);
      }
    }
  } catch (error) {
    console.warn("Firestore seeding notice:", error);
  }
}
