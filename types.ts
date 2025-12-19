export enum ServiceType {
  STANDARD = 'Standard Clean',
  DEEP = 'Deep Clean',
  MOVE = 'Move-in/Move-out',
  OFFICE = 'Office Clean'
}

export interface ServiceOption {
  id: ServiceType;
  title: string;
  description: string;
  hourlyRate: number;
  icon: string;
  recommendedHours: number;
  image: string;
}

export interface TimeSlot {
  id: string;
  time: string; // "09:00 AM"
  available: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string; // In a real app, never store plain text passwords
}

export interface BookingState {
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  date: Date;
  timeSlot: string;
  serviceId?: string;
  notes?: string;
}
  paymentStatus: 'pending' | 'deposit_paid' | 'fully_paid';
}

export interface InvoiceData {
  id: string;
  date: string;
  service: string;
  totalAmount: number;
  depositAmount: number; // 30%
  remainingAmount: number; // 70%
  clientName: string;
  status: 'Deposit Paid' | 'Paid';
}

export interface EmailDraft {
  subject: string;
  body: string;
  type: 'confirmation' | 'invoice' | 'review';
}

export interface BookingRecord {
  id: string;
  userId: string;
  serviceType: ServiceType;
  serviceTitle: string;
  date: string; // ISO String
  timeSlot: string;
  hours: number;
  totalCost: number;
  address: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}
