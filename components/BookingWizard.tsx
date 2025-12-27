import React, { useState, useEffect, useRef } from 'react';
import { BookingState, ServiceType, InvoiceData, TimeSlot, User, BookingRecord } from '../types';
import { SERVICE_OPTIONS } from '../constants';
import { generateEmailContent } from '../services/geminiService';
import { getRealAvailability } from '../services/calendarService';
import { saveBooking } from '../services/bookingStorageService';
import { CheckCircle, Clock, Calendar as CalendarIcon, CreditCard, ChevronRight, ChevronLeft, Mail, Star, Loader2, Flag, MapPin, Plus, Minus } from 'lucide-react';

const INITIAL_STATE: BookingState = {
  step: 1,
  service: null,
  hours: 3,
  date: null,
  timeSlot: null,
  clientDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  },
  paymentStatus: 'pending'
};

const HST_RATE = 0.13;

const COUNTRY_CODES = [ /* unchanged */ ];

interface BookingWizardProps {
  currentUser: User | null;
}

export default function BookingWizard({ currentUser }: BookingWizardProps) {
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailsSent, setEmailsSent] = useState<string[]>([]);
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);
  const [selectedCountryIso, setSelectedCountryIso] = useState('CA');

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [isLocating, setIsLocating] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressError, setAddressError] = useState('');
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Separate estimators
  const [homeEstimator, setHomeEstimator] = useState({
    bedrooms: 2,
    bathrooms: 1,
    kitchen: 1,
    living: 1
  });

  const [officeEstimator, setOfficeEstimator] = useState({
    rooms: 6,
    cafeteria: 0,
    desks: 20,
    washrooms: 2
  });

  // Auto-fill user details if logged in
  useEffect(() => {
    if (currentUser) {
      setBooking(prev => ({
        ...prev,
        clientDetails: {
          ...prev.clientDetails,
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || ''
        }
      }));
    }
  }, [currentUser]);

  const currentService = SERVICE_OPTIONS.find(s => s.id === booking.service);
  const isOfficeService = currentService?.id === 'office'; // CHANGE THIS if your office service has a different ID (e.g., 'commercial')

  // Cost Calculations
  const subtotal = currentService ? currentService.hourlyRate * booking.hours : 0;
  const hstAmount = subtotal * HST_RATE;
  const totalCost = subtotal + hstAmount;
  const depositAmount = totalCost * 0.30;
  const remainingAmount = totalCost * 0.70;

  // Fetch availability
  useEffect(() => {
    setAvailableSlots([]);
    const fetchSlots = async () => {
      if (booking.date && booking.hours) {
        setIsLoadingSlots(true);
        try {
          const duration = Math.ceil(booking.hours);
          const slots = await getRealAvailability(booking.date, duration);
          setAvailableSlots(slots);
        } catch (err) {
          console.error("Failed to load slots", err);
        } finally {
          setIsLoadingSlots(false);
        }
      }
    };
    fetchSlots();
  }, [booking.date, booking.hours]);

  const handleNext = () => setBooking(prev => ({ ...prev, step: prev.step + 1 }));
  const handleBack = () => setBooking(prev => ({ ...prev, step: prev.step - 1 }));

  // Home Estimator Logic
  const handleHomeChange = (field: keyof typeof homeEstimator, delta: number) => {
    setHomeEstimator(prev => {
      const nextValue = Math.max(0, prev[field] + delta);
      const newState = { ...prev, [field]: nextValue };

      let hours = 0;
      hours += newState.kitchen * 0.75;
      hours += newState.bathrooms * 0.5;
      hours += newState.bedrooms * 0.3;
      hours += newState.living * 0.25;

      const rounded = Math.ceil(hours * 2) / 2;
      const finalHours = Math.max(2, rounded);

      setBooking(b => ({ ...b, hours: finalHours }));
      return newState;
    });
  };

  // Office Estimator Logic
  const handleOfficeChange = (field: keyof typeof officeEstimator, delta: number) => {
    setOfficeEstimator(prev => {
      const nextValue = Math.max(0, prev[field] + delta);
      const newState = { ...prev, [field]: nextValue };

      let hours = 0;
      hours += newState.rooms * 0.3;        // ~18 min per room
      hours += newState.cafeteria * 0.67;   // ~40 min per cafeteria
      hours += newState.desks * 0.133;     // ~8 min per desk
      hours += newState.washrooms * 0.42;  // ~25 min per washroom
      hours += 0.75; // Base time (setup, travel, etc.)

      const rounded = Math.ceil(hours * 2) / 2;
      const finalHours = Math.max(3, rounded); // Minimum 3 hours for office

      setBooking(b => ({ ...b, hours: finalHours }));
      return newState;
    });
  };

  // Counter Component (with optional note)
  const Counter = ({ label, value, onChange, note }: { label: string; value: number; onChange: (d: number) => void; note?: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div>
        <span className="font-medium text-gray-700 text-sm">{label}</span>
        {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(-1)} disabled={value === 0} className="w-8 h-8 rounded-full bg-white border shadow-sm hover:text-brand-600 disabled:opacity-50">
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-bold text-gray-900">{value}</span>
        <button onClick={() => onChange(1)} className="w-8 h-8 rounded-full bg-white border shadow-sm hover:text-brand-600">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ... [processPayment, handleUseLocation, handleAddressChange, validators remain unchanged]

  const renderDurationSelection = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">2. How long do we clean?</h2>
      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center">
            <span className="text-5xl font-bold text-brand-600">{booking.hours}</span>
            <span className="text-gray-500 ml-2 text-xl">Hours</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Estimated Subtotal</p>
            <p className="text-3xl font-bold text-gray-900">${subtotal.toFixed(2)}</p>
            <p className="text-xs text-gray-400">+ HST (13%) calculated at checkout</p>
          </div>
        </div>

        <input
          type="range"
          min="2"
          max="10"
          step="0.5"
          value={booking.hours}
          onChange={(e) => setBooking({ ...booking, hours: parseFloat(e.target.value) })}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>2 hours</span>
          <span>10 hours</span>
        </div>

        <p className="mt-6 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <span className="font-semibold">Tip:</span> Based on your selection of <strong>{currentService?.title}</strong>, we recommend at least {currentService?.recommendedHours} hours.
        </p>

        {/* Time Estimator Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            Time Estimator
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {isOfficeService
              ? "Tell us about your office layout for a precise estimate."
              : "Add your rooms below to automatically adjust the booking time."
            }
          </p>

          {isOfficeService ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Counter label="General Rooms/Open Areas" value={officeEstimator.rooms} onChange={(d) => handleOfficeChange('rooms', d)} note="Conference rooms, open floors" />
              <Counter label="Cafeteria/Break Rooms" value={officeEstimator.cafeteria} onChange={(d) => handleOfficeChange('cafeteria', d)} note="Food areas take longer" />
              <Counter label="Desks/Workstations" value={officeEstimator.desks} onChange={(d) => handleOfficeChange('desks', d)} note="Quick wipe per desk" />
              <Counter label="Washrooms/Restrooms" value={officeEstimator.washrooms} onChange={(d) => handleOfficeChange('washrooms', d)} note="Full disinfection" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Counter label="Bedrooms" value={homeEstimator.bedrooms} onChange={(d) => handleHomeChange('bedrooms', d)} />
              <Counter label="Bathrooms" value={homeEstimator.bathrooms} onChange={(d) => handleHomeChange('bathrooms', d)} />
              <Counter label="Kitchens" value={homeEstimator.kitchen} onChange={(d) => handleHomeChange('kitchen', d)} />
              <Counter label="Living Areas" value={homeEstimator.living} onChange={(d) => handleHomeChange('living', d)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ... [renderServiceSelection, renderDateTimeSelection, renderClientDetails, renderPaymentStep, renderSuccessStep, canProceed, return JSX all remain exactly the same]

  // Keep everything else unchanged below this line
  // (including render functions and return statement)

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
      {/* Header, Body, Footer — unchanged */}
      {/* ... your existing JSX ... */}
    </div>
  );
}
