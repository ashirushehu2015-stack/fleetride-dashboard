import { Location, VehicleConfig, Driver } from './types';

export const CITIES = [
  {
    id: 'lagos',
    name: 'Lagos (Commercial Hub)',
    center: { lat: 6.4549, lng: 3.3887 },
    zoom: 13,
    landmarks: [
      { lat: 6.4381, lng: 3.4423, label: 'Lekki Toll Plaza' },
      { lat: 6.4921, lng: 3.3512, label: 'Ikeja City Mall' },
      { lat: 6.4712, lng: 3.3683, label: 'National Theatre Iganmu' },
      { lat: 6.4172, lng: 3.4184, label: 'Eko Atlantic City' },
      { lat: 6.4312, lng: 3.4285, label: 'Victoria Island Hub' },
      { lat: 6.4850, lng: 3.3850, label: 'Third Mainland Bridge Gate' }
    ]
  },
  {
    id: 'abuja',
    name: 'Abuja (FCT)',
    center: { lat: 9.0765, lng: 7.3986 },
    zoom: 13,
    landmarks: [
      { lat: 9.0665, lng: 7.4512, label: 'Aso Villa Presidential Palace' },
      { lat: 9.0620, lng: 7.4480, label: 'National Assembly Complex' },
      { lat: 9.0625, lng: 7.4112, label: 'Abuja National Mosque' },
      { lat: 9.0761, lng: 7.3743, label: 'Jabi Lake Mall' },
      { lat: 9.0682, lng: 7.4320, label: 'Millennium Park Garden' },
      { lat: 9.0820, lng: 7.3850, label: 'Wuse Modern Market' }
    ]
  },
  {
    id: 'port-harcourt',
    name: 'Port Harcourt (Oil City)',
    center: { lat: 4.8156, lng: 7.0498 },
    zoom: 13,
    landmarks: [
      { lat: 4.8214, lng: 7.0260, label: 'PH Pleasure Park' },
      { lat: 4.7965, lng: 7.0132, label: 'Mile One Market Terminal' },
      { lat: 4.8112, lng: 7.0395, label: 'GRA Phase II Avenue' },
      { lat: 4.7782, lng: 7.0125, label: 'Rivers State Secretariat' },
      { lat: 4.8150, lng: 7.0650, label: 'Trans-Amadi Commercial Belt' }
    ]
  },
  {
    id: 'kano',
    name: 'Kano (Ancient Hub)',
    center: { lat: 12.0022, lng: 8.5919 },
    zoom: 13,
    landmarks: [
      { lat: 11.9961, lng: 8.5734, label: 'Kurmi Traditional Market' },
      { lat: 11.9912, lng: 8.5818, label: 'Gidan Rumfa (Emir Palace)' },
      { lat: 11.9832, lng: 8.5331, label: 'Bayero University (BUK)' },
      { lat: 12.0482, lng: 8.5643, label: 'Aminu Kano Intl Airport' },
      { lat: 11.9712, lng: 8.6112, label: 'Ado Bayero Luxury Mall' }
    ]
  },
  {
    id: 'enugu',
    name: 'Enugu (Coal City)',
    center: { lat: 6.4483, lng: 7.5139 },
    zoom: 13,
    landmarks: [
      { lat: 6.4295, lng: 7.4998, label: 'Michael Okpara Square' },
      { lat: 6.4821, lng: 7.5385, label: 'Nike Lake Resort Gate' },
      { lat: 6.4520, lng: 7.5052, label: 'Polo Park Plaza Mall' },
      { lat: 6.4150, lng: 7.4812, label: 'Historic Coal Mine Site' },
      { lat: 6.4350, lng: 7.5180, label: 'Independence Layout' }
    ]
  },
  {
    id: 'gusau',
    name: 'Gusau (Northern Gateway)',
    center: { lat: 12.1628, lng: 6.6614 },
    zoom: 13,
    landmarks: [
      { lat: 12.1610, lng: 6.6620, label: 'Gusau Central Mosque' },
      { lat: 12.1550, lng: 6.6550, label: 'Government House Complex' },
      { lat: 12.1950, lng: 6.7050, label: 'Federal University Gusau' },
      { lat: 12.1750, lng: 6.6850, label: 'Gusau Municipal Airstrip' }
    ]
  },
  {
    id: 'kaduna',
    name: 'Kaduna State',
    center: { lat: 10.5105, lng: 7.4165 },
    zoom: 13,
    landmarks: [
      { lat: 10.5265, lng: 7.4420, label: 'Kaduna State Government House' },
      { lat: 10.5120, lng: 7.4210, label: 'Kaduna Central Market' },
      { lat: 10.4200, lng: 7.4100, label: 'Kaduna Refinery' },
      { lat: 10.5310, lng: 7.4460, label: 'Federal Secretariat Kaduna' }
    ]
  },
  {
    id: 'sokoto',
    name: 'Sokoto State',
    center: { lat: 13.0059, lng: 5.2476 },
    zoom: 13,
    landmarks: [
      { lat: 13.0672, lng: 5.2415, label: 'Sultan of Sokoto Palace' },
      { lat: 13.1250, lng: 5.2150, label: 'Usmanu Danfodiyo University' },
      { lat: 13.0480, lng: 5.2420, label: 'Sokoto Central Market' },
      { lat: 12.9160, lng: 5.2070, label: 'Sultan Abubakar III Airport' }
    ]
  },
  {
    id: 'kebbi',
    name: 'Kebbi State',
    center: { lat: 12.4539, lng: 4.1975 },
    zoom: 13,
    landmarks: [
      { lat: 12.4630, lng: 4.2040, label: 'Kebbi State Government House' },
      { lat: 12.4710, lng: 4.2150, label: 'Waziri Umaru Federal Polytechnic' },
      { lat: 12.4480, lng: 4.1920, label: 'Birnin Kebbi Central Market' },
      { lat: 12.4580, lng: 4.1990, label: 'Gwandu Emirate Palace' }
    ]
  },
  {
    id: 'katsina',
    name: 'Katsina State',
    center: { lat: 12.9856, lng: 7.6171 },
    zoom: 13,
    landmarks: [
      { lat: 12.9902, lng: 7.6015, label: 'Katsina Royal Palace' },
      { lat: 12.9110, lng: 7.6320, label: 'Umaru Musa Yar\'Adua University' },
      { lat: 12.9940, lng: 7.6180, label: 'Gobarau Minaret' },
      { lat: 12.9820, lng: 7.6150, label: 'Katsina Central Market' }
    ]
  },
  {
    id: 'niger',
    name: 'Niger State',
    center: { lat: 9.5836, lng: 6.5463 },
    zoom: 13,
    landmarks: [
      { lat: 9.5220, lng: 6.4480, label: 'Federal University of Technology Minna' },
      { lat: 9.6120, lng: 6.5520, label: 'Minna Central Mosque' },
      { lat: 9.5910, lng: 6.5380, label: 'Niger State Secretariat' },
      { lat: 9.6160, lng: 6.5410, label: 'Minna Railway Station' }
    ]
  },
  {
    id: 'nasarawa',
    name: 'Nasarawa State',
    center: { lat: 8.4900, lng: 8.5200 },
    zoom: 13,
    landmarks: [
      { lat: 8.5110, lng: 8.5280, label: 'Nasarawa State Government House' },
      { lat: 8.4810, lng: 8.5630, label: 'Federal University Lafia' },
      { lat: 8.4960, lng: 8.5120, label: 'Lafia Modern Market' },
      { lat: 8.4910, lng: 8.5040, label: 'Lafia City Stadium' }
    ]
  },
  {
    id: 'jigawa',
    name: 'Jigawa State',
    center: { lat: 11.7500, lng: 9.3300 },
    zoom: 13,
    landmarks: [
      { lat: 11.7310, lng: 9.3380, label: 'Jigawa State Secretariat' },
      { lat: 11.6980, lng: 9.3350, label: 'Federal University Dutse' },
      { lat: 11.7220, lng: 9.3510, label: 'Dutse Ultra-Modern Market' },
      { lat: 11.7910, lng: 9.3880, label: 'Dutse International Airport' }
    ]
  },
  {
    id: 'gombe',
    name: 'Gombe State',
    center: { lat: 10.2897, lng: 11.1673 },
    zoom: 13,
    landmarks: [
      { lat: 10.3010, lng: 11.1550, label: 'Gombe State University' },
      { lat: 10.2820, lng: 11.1710, label: 'Gombe Jewel Model Market' },
      { lat: 10.3020, lng: 11.0250, label: 'Gombe Lawanti International Airport' },
      { lat: 10.2790, lng: 11.1630, label: 'Pantami Stadium' }
    ]
  },
  {
    id: 'borno',
    name: 'Borno State',
    center: { lat: 11.8333, lng: 13.1500 },
    zoom: 13,
    landmarks: [
      { lat: 11.8480, lng: 13.1610, label: 'Borno State Government House' },
      { lat: 11.8080, lng: 13.2050, label: 'University of Maiduguri (UNIMAID)' },
      { lat: 11.8390, lng: 13.1520, label: 'Maiduguri Monday Market' },
      { lat: 11.8360, lng: 13.1410, label: 'Shehu of Borno Palace' }
    ]
  },
  {
    id: 'adamawa',
    name: 'Adamawa State',
    center: { lat: 9.2035, lng: 12.4954 },
    zoom: 13,
    landmarks: [
      { lat: 9.2080, lng: 12.4780, label: 'American University of Nigeria' },
      { lat: 9.3510, lng: 12.5020, label: 'Modibbo Adama University' },
      { lat: 9.2560, lng: 12.4310, label: 'Yola International Airport' },
      { lat: 9.2310, lng: 12.4620, label: 'Jimeta Modern Market' }
    ]
  },
  {
    id: 'yobe',
    name: 'Yobe State',
    center: { lat: 11.7400, lng: 11.9600 },
    zoom: 13,
    landmarks: [
      { lat: 11.7510, lng: 11.9510, label: 'Yobe State Secretariat' },
      { lat: 11.7110, lng: 11.9210, label: 'Yobe State University' },
      { lat: 11.7450, lng: 11.9680, label: 'Damaturu Modern Market' },
      { lat: 11.7380, lng: 11.9720, label: 'Emir of Damaturu Palace' }
    ]
  }
];

export const VEHICLE_CONFIGS: VehicleConfig[] = [
  {
    id: 'X',
    name: 'ZamTaxi Standard',
    multiplier: 1.0,
    capacity: 4,
    description: 'Affordable, everyday standard rides',
    etaMinutes: 3,
    icon: 'Car'
  },
  {
    id: 'Comfort',
    name: 'ZamTaxi Comfort',
    multiplier: 1.25,
    capacity: 4,
    description: 'Newer state vehicles with extra legroom & AC',
    etaMinutes: 4,
    icon: 'Sparkles'
  },
  {
    id: 'Black',
    name: 'ZamTaxi Premium',
    multiplier: 2.3,
    capacity: 4,
    description: 'Premium executive rides with professional drivers',
    etaMinutes: 5,
    icon: 'Award'
  }
];

export const MOCK_DRIVERS: Omit<Driver, 'vehicleType'>[] = [
  {
    name: 'Olumide Adebayo',
    rating: 4.88,
    vehicleName: 'Silver Toyota Corolla',
    plateNumber: 'LAG-102-IKJ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    phone: '+234 803 112 3456',
    completedTrips: 1840
  },
  {
    name: 'Chinedu Okafor',
    rating: 4.96,
    vehicleName: 'Black Lexus ES350',
    plateNumber: 'ENU-454-WTC',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phone: '+234 816 789 0123',
    completedTrips: 3412
  },
  {
    name: 'Fatima Yusuf',
    rating: 4.78,
    vehicleName: 'Blue Hyundai Elantra',
    plateNumber: 'ABJ-771-MTA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    phone: '+234 809 234 5678',
    completedTrips: 920
  },
  {
    name: 'Aminu Ibrahim',
    rating: 4.91,
    vehicleName: 'White Honda Accord',
    plateNumber: 'KAN-889-MNC',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    phone: '+234 812 901 2345',
    completedTrips: 2150
  },
  {
    name: 'Blessing Egwu',
    rating: 4.82,
    vehicleName: 'Grey Kia Rio',
    plateNumber: 'PHC-302-GRA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    phone: '+234 805 456 7890',
    completedTrips: 680
  }
];

export const MOCK_PASSENGERS = [
  {
    name: 'Alice Cooper',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },
  {
    name: 'Bruce Wayne',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'
  },
  {
    name: 'Diana Prince',
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150'
  },
  {
    name: 'Peter Parker',
    rating: 4.65,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
  }
];

export const MOCK_DRIVER_CHATBOT_PHRASES: Record<string, string[]> = {
  ACCEPTED: [
    "Hello! I have accepted your ride request. I'm on my way!",
    "Hi there, heading towards your pickup location now. Be there shortly!",
    "Got your request. I am navigating to you. See you soon!"
  ],
  PICKING_UP: [
    "Just passed some traffic, but I'll be there in 2 minutes.",
    "Almost there! I'm about 1 block away.",
    "I have arrived at your pickup spot. Look for a [CAR]."
  ],
  ARRIVED: [
    "I'm here! I'm parked near the curb.",
    "I've arrived. Whenever you're ready, look for my [CAR].",
    "Arrived! Let me know if you have trouble finding me."
  ],
  TRIP_IN_PROGRESS: [
    "Smooth ride today. Taking the fastest route to bypass traffic.",
    "Hope you are comfortable! Let me know if you want the AC adjusted or a change in music.",
    "The navigation shows we will arrive in about [ETA] minutes."
  ]
};
