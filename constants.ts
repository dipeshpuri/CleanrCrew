import { ServiceOption, ServiceType, TimeSlot } from './types';

// TODO: REPLACE THIS WITH YOUR REAL GOOGLE CALENDAR ID
// 1. Go to Google Calendar Settings > Integrate Calendar > Copy Calendar ID
// 2. Ensure the calendar is set to "Public" (See only free/busy)
export const GOOGLE_CALENDAR_ID = 'cleanrcrew@gmail.com';

// TO REPLACE SERVICE IMAGES:
// Update the 'image' property with URLs to your own images.
export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: ServiceType.STANDARD,
    title: 'Standard Clean',
    description: 'Regular maintenance cleaning for keeping your home fresh.',
    hourlyRate: 45,
    icon: '✨',
    recommendedHours: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: ServiceType.DEEP,
    title: 'Deep Clean',
    description: 'Thorough top-to-bottom cleaning for neglected spaces.',
    hourlyRate: 60,
    icon: '🧽',
    recommendedHours: 5,
    image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: ServiceType.MOVE,
    title: 'Move-in / Move-out',
    description: 'Empty home cleaning ensuring you get your deposit back.',
    hourlyRate: 65,
    icon: '📦',
    recommendedHours: 6,
    image: "1.png"
  },
  {
    id: ServiceType.OFFICE,
    title: 'Office Space',
    description: 'Professional cleaning for workspaces and commercial areas.',
    hourlyRate: 50,
    icon: '🏢',
    recommendedHours: 4,
    image: "Screenshot 2025-12-15 050459.png"
  }
];

// Fallback Mock Time Slots (used if API fails or Calendar ID is invalid)
export const MOCK_TIME_SLOTS: TimeSlot[] = [
  { id: '1', time: '08:00 AM', available: true },
  { id: '2', time: '09:00 AM', available: true },
  { id: '3', time: '10:00 AM', available: false }, // Booked
  { id: '4', time: '11:00 AM', available: true },
  { id: '5', time: '12:00 PM', available: true },
  { id: '6', time: '01:00 PM', available: true },
  { id: '7', time: '02:00 PM', available: true },
  { id: '8', time: '03:00 PM', available: false }, // Booked
  { id: '9', time: '04:00 PM', available: true },
];
