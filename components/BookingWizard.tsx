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

const COUNTRY_CODES = [
    { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
    { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
    { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
    { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
    { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
    { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
    { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
    { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
    { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
    { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
    { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
];

interface BookingWizardProps {
  currentUser: User | null;
}

export default function BookingWizard({ currentUser }: BookingWizardProps) {
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailsSent, setEmailsSent] = useState<string[]>([]);
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);
  const [selectedCountryIso, setSelectedCountryIso] = useState('CA');

  // New State for Real Calendar
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // State for Location & Address Validation
  const [isLocating, setIsLocating] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressError, setAddressError] = useState('');
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Time Estimator State
  const [estimator, setEstimator] = useState({
      bedrooms: 2,
      bathrooms: 1,
      kitchen: 1,
      living: 1
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
  
  // Cost Calculations
  const subtotal = currentService ? currentService.hourlyRate * booking.hours : 0;
  const hstAmount = subtotal * HST_RATE;
  const totalCost = subtotal + hstAmount;

  const depositAmount = totalCost * 0.30;
  const remainingAmount = totalCost * 0.70;

  // Fetch slots when date or duration changes
  useEffect(() => {
    // Clear slots immediately when date changes to prevent stale data
    setAvailableSlots([]);
    
    const fetchSlots = async () => {
        if (booking.date && booking.hours) {
            setIsLoadingSlots(true);
            try {
                // Determine duration based on hours (round up to nearest integer)
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


  const handleNext = () => {
    setBooking(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handleBack = () => {
    setBooking(prev => ({ ...prev, step: prev.step - 1 }));
  };

  const handleEstimatorChange = (field: keyof typeof estimator, delta: number) => {
      setEstimator(prev => {
          const nextValue = Math.max(0, prev[field] + delta);
          const newState = { ...prev, [field]: nextValue };
          
          // Calculate new hours based on rooms
          let hours = 0;
          hours += newState.kitchen * 0.75;
          hours += newState.bathrooms * 0.5;
          hours += newState.bedrooms * 0.3;
          hours += newState.living * 0.25;
          
          const rounded = Math.ceil(hours * 2) / 2;
          const finalHours = Math.max(2, rounded);
          
          // Automatically update booking hours
          setBooking(b => ({ ...b, hours: finalHours }));
          
          return newState;
      });
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    // 1. Simulate Payment Gateway Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Generate Invoice Data
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    
    const invoice: InvoiceData = {
      id: invoiceId,
      date: new Date().toLocaleDateString(),
      service: currentService?.title || 'Service',
      totalAmount: totalCost,
      depositAmount: depositAmount,
      remainingAmount: remainingAmount,
      clientName: `${booking.clientDetails.firstName} ${booking.clientDetails.lastName}`,
      status: 'Deposit Paid'
    };
    setGeneratedInvoice(invoice);
    setBooking(prev => ({ ...prev, paymentStatus: 'deposit_paid' }));

    // 3. Save to History (if user logged in)
    if (currentUser && booking.service && booking.date) {
        const newBooking: BookingRecord = {
            id: invoiceId,
            userId: currentUser.id,
            serviceType: booking.service,
            serviceTitle: currentService?.title || 'Cleaning Service',
            date: booking.date.toISOString(),
            timeSlot: booking.timeSlot || '',
            hours: booking.hours,
            totalCost: totalCost,
            address: booking.clientDetails.address,
            status: 'upcoming', // Default status
            createdAt: new Date().toISOString()
        };
        saveBooking(newBooking);
    }

    // 4. Trigger Gemini to send Invoice/Confirmation Email
    try {
        const emailContent = await generateEmailContent('confirmation', booking, currentService);
        console.log("Sending Email:", emailContent);
        setEmailsSent(prev => [...prev, 'Confirmation & Invoice Email Sent']);
    } catch (e) {
        console.error("Failed to generate email", e);
    }
    
    setIsProcessing(false);
    handleNext(); // Go to success step
  };
  
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setAddressError(''); // Clear previous errors

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Using Nominatim for reverse geocoding (OpenStreetMap) - Free and requires no key
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.address) {
            const addr = data.address;
            const houseNumber = addr.house_number || '';
            const road = addr.road || addr.pedestrian || '';
            const city = addr.city || addr.town || addr.village || addr.municipality || '';
            const state = addr.state || ''; 
            const postcode = addr.postcode || '';
            
            const parts = [
                houseNumber ? `${houseNumber} ${road}` : road,
                city,
                state,
                postcode
            ].filter(Boolean);
            
            const formattedAddress = parts.join(', ');
            
            setBooking(prev => ({
                ...prev,
                clientDetails: {
                    ...prev.clientDetails,
                    address: formattedAddress
                }
            }));
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        alert("Could not automatically retrieve address. Please enter it manually.");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      setIsLocating(false);
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBooking(prev => ({...prev, clientDetails: {...prev.clientDetails, address: val}}));
    
    // Address Validation
    if (val.length > 0) {
        if (val.length < 5) {
            setAddressError("Address is too short");
        } else if (!/\d/.test(val)) {
            setAddressError("Please include a house/building number");
        } else {
            setAddressError("");
        }
    } else {
        setAddressError("");
    }

    // Autocomplete Suggestions
    if (val.length > 2) {
        if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
        addressDebounceRef.current = setTimeout(async () => {
            try {
                // Prioritize results based on the selected country
                const countryCode = selectedCountryIso.toLowerCase();
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=${countryCode}&addressdetails=1&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setAddressSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Address autocomplete failed", err);
            }
        }, 300); // 300ms debounce
    } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setBooking(prev => ({...prev, clientDetails: {...prev.clientDetails, address: suggestion.display_name}}));
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setAddressError("");
  };

  // Validators
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
      return phone.length >= 7; // Basic loose check
  };

  // Render Functions
  const Counter = ({ label, value, onChange }: { label: string, value: number, onChange: (d: number) => void }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
        <span className="font-medium text-gray-700 text-sm">{label}</span>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => onChange(-1)}
                disabled={value === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow-sm text-gray-600 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-4 text-center font-bold text-gray-900">{value}</span>
            <button 
                onClick={() => onChange(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow-sm text-gray-600 hover:text-brand-600 transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    </div>
  );

  const renderServiceSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">1. Choose your cleaning type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setBooking({ ...booking, service: option.id, hours: option.recommendedHours })}
            className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg flex flex-col gap-3 ${
              booking.service === option.id 
                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                : 'border-gray-200 bg-white hover:border-brand-300'
            }`}
          >
            <div className="text-4xl">{option.icon}</div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{option.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
            </div>
            <div className="mt-auto pt-4 flex justify-between items-center w-full">
                <span className="font-semibold text-brand-700">${option.hourlyRate}/hr</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">Rec: {option.recommendedHours}h</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

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
            onChange={(e) => setBooking({...booking, hours: parseFloat(e.target.value)})}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>2 hours</span>
            <span>10 hours</span>
        </div>
        
        <p className="mt-6 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <span className="font-semibold">Tip:</span> Based on your selection of <strong>{currentService?.title}</strong>, we recommend at least {currentService?.recommendedHours} hours for an average-sized home.
        </p>

        {/* Time Estimator */}
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" />
                Time Estimator
            </h3>
            <p className="text-xs text-gray-500 mb-4">Add your rooms below to automatically adjust the booking time.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Counter label="Bedrooms" value={estimator.bedrooms} onChange={(d) => handleEstimatorChange('bedrooms', d)} />
                 <Counter label="Bathrooms" value={estimator.bathrooms} onChange={(d) => handleEstimatorChange('bathrooms', d)} />
                 <Counter label="Kitchens" value={estimator.kitchen} onChange={(d) => handleEstimatorChange('kitchen', d)} />
                 <Counter label="Living Areas" value={estimator.living} onChange={(d) => handleEstimatorChange('living', d)} />
            </div>
        </div>
      </div>
    </div>
  );

  const renderDateTimeSelection = () => {
    // Generate next 7 days starting from today
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i); // Start from today
        return d;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">3. Select a Date & Time</h2>
            
            {/* Calendar Strip */}
            <div className="flex gap-3 overflow-x-auto pb-4">
                {dates.map((date, idx) => {
                    const isSelected = booking.date?.toDateString() === date.toDateString();
                    return (
                        <button
                            key={idx}
                            onClick={() => setBooking({ ...booking, date: date, timeSlot: null })}
                            className={`flex-shrink-0 w-24 h-28 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                                isSelected ? 'border-brand-500 bg-brand-600 text-white' : 'border-gray-200 bg-white hover:border-brand-300'
                            }`}
                        >
                            <span className={`text-xs uppercase font-bold ${isSelected ? 'text-brand-100' : 'text-gray-400'}`}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-3xl font-bold">
                                {date.getDate()}
                            </span>
                            <span className="text-xs">
                                {date.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Time Slots (REAL GOOGLE CALENDAR) */}
            {booking.date && (
                <div className="animate-fade-in">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> Available Slots for {booking.date.toLocaleDateString()}
                    </h3>
                    
                    {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            Checking availability...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        disabled={!slot.available}
                                        onClick={() => setBooking({ ...booking, timeSlot: slot.time })}
                                        className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all ${
                                            !slot.available 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent opacity-60'
                                                : booking.timeSlot === slot.time
                                                    ? 'bg-brand-100 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                                    : 'bg-white border-gray-200 hover:border-brand-400 text-gray-700'
                                        }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                                    No slots available for this date.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
  };

  const renderClientDetails = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800">4. Your Details</h2>
         {currentUser && (
             <span className="text-sm bg-brand-100 text-brand-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                 <CheckCircle className="w-3 h-3" /> Auto-filled
             </span>
         )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Jane"
                value={booking.clientDetails.firstName}
                onChange={e => setBooking({...booking, clientDetails: {...booking.clientDetails, firstName: e.target.value}})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input 
                type="text" 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Doe"
                value={booking.clientDetails.lastName}
                onChange={e => setBooking({...booking, clientDetails: {...booking.clientDetails, lastName: e.target.value}})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
                type="email" 
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none ${
                    booking.clientDetails.email && !isValidEmail(booking.clientDetails.email) ? 'border-red-300 focus:ring-red-200' : ''
                }`}
                placeholder="jane@example.com"
                value={booking.clientDetails.email}
                onChange={e => setBooking({...booking, clientDetails: {...booking.clientDetails, email: e.target.value}})}
            />
            {booking.clientDetails.email && !isValidEmail(booking.clientDetails.email) && (
                <p className="text-xs text-red-500">Please enter a valid email (e.g., user@domain.com)</p>
            )}
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <div className="flex gap-2">
                <div className="relative w-32">
                    <select
                        value={selectedCountryIso}
                        onChange={(e) => setSelectedCountryIso(e.target.value)}
                        className="appearance-none h-full w-full pl-3 pr-8 py-3 border rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                    >
                        {COUNTRY_CODES.slice(0, 10).map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.flag} {c.code} ({c.dial_code})
                            </option>
                        ))}
                    </select>
                </div>
                <input 
                    type="tel" 
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="000 000 0000"
                    value={booking.clientDetails.phone}
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                        setBooking({...booking, clientDetails: {...booking.clientDetails, phone: val}});
                    }}
                />
            </div>
            {booking.clientDetails.phone && !isValidPhone(booking.clientDetails.phone) && (
                <p className="text-xs text-red-500">Phone number must be at least 10 digits</p>
            )}
        </div>
        <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <button
                    onClick={handleUseLocation}
                    type="button"
                    disabled={isLocating}
                    className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    {isLocating ? 'Locating...' : 'Use current location'}
                </button>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none ${addressError ? 'border-red-300 focus:ring-red-200' : ''}`}
                    placeholder="123 Clean Street, Toronto, ON"
                    value={booking.clientDetails.address}
                    onChange={handleAddressChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hiding to allow click
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                        {addressSuggestions.map((item, idx) => (
                            <li 
                                key={idx} 
                                onClick={() => handleSelectSuggestion(item)}
                                className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-b-0 text-gray-700 flex items-start gap-2"
                            >
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                <span>{item.display_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {addressError ? (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <Flag className="w-3 h-3" /> {addressError}
                </p>
            ) : isLocating && (
                <p className="text-xs text-brand-500 animate-pulse">Requesting location permissions...</p>
            )}
        </div>
        <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Special Notes / Instructions</label>
            <textarea 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-24"
                placeholder="Gate code is 1234. Please be careful with the cat."
                value={booking.clientDetails.notes}
                onChange={e => setBooking({...booking, clientDetails: {...booking.clientDetails, notes: e.target.value}})}
            />
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">5. Secure Payment</h2>
        
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Booking Summary</h3>
            </div>
            <div className="p-6 space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">{currentService?.title} x {booking.hours} hrs</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>HST (13%)</span>
                    <span>${hstAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${totalCost.toFixed(2)}</span>
                </div>
            </div>
            <div className="bg-brand-50 p-6 border-t border-brand-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-brand-800">Required Deposit (30%)</span>
                    <span className="font-bold text-2xl text-brand-700">${depositAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-brand-600">The remaining ${remainingAmount.toFixed(2)} will be charged after the service is completed.</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border space-y-4">
             <div className="flex items-center gap-2 mb-4">
                 <CreditCard className="text-gray-400" />
                 <span className="font-medium text-gray-700">Card Details (Mock)</span>
             </div>
             <input type="text" placeholder="Card Number" className="w-full p-3 border rounded-lg bg-gray-50" disabled value="4242 4242 4242 4242" />
             <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="MM/YY" className="w-full p-3 border rounded-lg bg-gray-50" disabled value="12/25" />
                 <input type="text" placeholder="CVC" className="w-full p-3 border rounded-lg bg-gray-50" disabled value="123" />
             </div>
        </div>

        <button
            onClick={processPayment}
            disabled={isProcessing}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
        >
            {isProcessing ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
            ) : (
                `Pay $${depositAmount.toFixed(2)} Deposit`
            )}
        </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-8 animate-fade-in max-w-2xl mx-auto">
        <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
        </div>
        <div>
            <h2 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h2>
            <p className="text-gray-500 mt-2">Thank you, {booking.clientDetails.firstName}. We've sent a confirmation email to {booking.clientDetails.email}.</p>
        </div>

        {/* Invoice Preview */}
        {generatedInvoice && (
            <div className="bg-white border rounded-xl p-6 text-left shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    PAID
                </div>
                <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-4">Invoice Receipt</h3>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Invoice ID</span>
                    <span className="font-mono">{generatedInvoice.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Deposit Amount</span>
                    <span className="font-semibold text-gray-900">${generatedInvoice.depositAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Status</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Deposit Received
                    </span>
                </div>
                <div className="border-t pt-4 text-xs text-gray-400">
                    * Automated invoice generated securely.
                </div>
            </div>
        )}

        <div className="space-y-3">
            {emailsSent.map((msg, i) => (
                <div key={i} className="flex items-center justify-center gap-2 text-sm text-brand-600 bg-brand-50 py-2 px-4 rounded-full inline-block">
                    <Mail className="w-4 h-4" /> {msg}
                </div>
            ))}
        </div>

        <div className="pt-8 border-t">
            <p className="text-sm text-gray-500 mb-4">Simulating Post-Service workflow...</p>
            <button
                onClick={async () => {
                     const email = await generateEmailContent('review', booking, currentService);
                     console.log("Review Email:", email);
                     alert(`[Simulation] 24hrs later...\n\nEmail Sent:\nSubject: ${email.subject}\n\n${email.body}`);
                }}
                className="text-brand-600 hover:text-brand-800 underline text-sm"
            >
                Simulate "24hrs Later" Review Email
            </button>
        </div>
    </div>
  );

  // Render Logic
  const canProceed = () => {
      if (booking.step === 1) return !!booking.service;
      if (booking.step === 2) return booking.hours > 0;
      if (booking.step === 3) return !!booking.date && !!booking.timeSlot;
      if (booking.step === 4) {
          const { firstName, lastName, email, phone, address } = booking.clientDetails;
          return !!firstName && 
                 !!lastName && 
                 !!email && isValidEmail(email) && 
                 !!phone && isValidPhone(phone) && 
                 !!address && 
                 !addressError; // Also check if address is valid
      }
      return true;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
      {/* Header Progress */}
      <div className="bg-gray-50 p-6 border-b">
         <div className="flex items-center justify-between mb-4">
             <h1 className="font-bold text-xl text-brand-900">Book Service</h1>
             <span className="text-sm text-gray-500">Step {booking.step} of 6</span>
         </div>
         <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
             <div 
                className="bg-brand-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${(booking.step / 6) * 100}%` }}
             ></div>
         </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 md:p-10">
        {booking.step === 1 && renderServiceSelection()}
        {booking.step === 2 && renderDurationSelection()}
        {booking.step === 3 && renderDateTimeSelection()}
        {booking.step === 4 && renderClientDetails()}
        {booking.step === 5 && renderPaymentStep()}
        {booking.step === 6 && renderSuccessStep()}
      </div>

      {/* Footer Controls */}
      {booking.step < 6 && (
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            <button
                onClick={handleBack}
                disabled={booking.step === 1}
                className={`flex items-center gap-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    booking.step === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
                <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            {booking.step === 5 ? null : (
                 <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md ${
                        !canProceed()
                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                        : 'bg-brand-600 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200'
                    }`}
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
      )}
    </div>
  );
}
