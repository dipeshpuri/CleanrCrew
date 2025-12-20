import React, { useState, useEffect } from 'react';
import BookingWizard from './components/BookingWizard';
import BookingHistory from './components/BookingHistory';
import { Sparkles, Star, ShieldCheck, Check, ArrowRight, ArrowLeft, User, LogOut, Loader2, History, Briefcase, MapPin } from 'lucide-react';
import { SERVICE_OPTIONS } from './constants';
import { User as UserType } from './types';
import { loginUser, registerUser, getCurrentSession, logoutUser } from './services/authService';
import { saveApplicant } from './services/applicantService';

// --- HERO IMAGES FOR SLIDESHOW ---
// TO REPLACE IMAGES: Replace the URLs below with links to your own hosted images.
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop", // Modern Living Room with light wood floors
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop", // Bright Modern Kitchen with Island
  "/Screenshot 2025-12-15 050459.png", // Modern Bathroom
  "/1.png"  // Clean Laundry/Mudroom
];

// --- SERVICE AREAS ---
const SERVICE_AREAS = ["Mississauga", "Milton", "Brampton", "Oakville", "Toronto", "Vaughan"];

// --- LOGO OPTIONS ---
const LogoOption1 = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="25" width="70" height="55" rx="10" transform="rotate(-5 50 50)" fill="currentColor" fillOpacity="0.2" />
    <rect x="15" y="25" width="70" height="55" rx="10" transform="rotate(-5 50 50)" stroke="currentColor" strokeWidth="2" />
    <path d="M25 60 C25 60 40 45 60 45 C80 45 85 60 85 60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" transform="rotate(-5 50 50)"/>
    <path d="M25 70 C25 70 40 55 60 55 C80 55 85 70 85 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.5" transform="rotate(-5 50 50)"/>
    <path d="M85 10 L88 18 L96 20 L88 22 L85 30 L82 22 L74 20 L82 18 Z" fill="#2dd4bf" />
    <path d="M50 5 L52 10 L57 12 L52 14 L50 19 L48 14 L43 12 L48 10 Z" fill="#2dd4bf" />
    <path d="M15 15 L17 20 L22 22 L17 24 L15 29 L13 24 L8 22 L13 20 Z" fill="#2dd4bf" />
  </svg>
);

// --- COMPONENT INTERFACES ---

interface ViewProps {
  setView: (view: 'landing' | 'booking' | 'history' | 'services' | 'careers' | 'login' | 'signup' | 'privacy' | 'terms') => void;
  setUser?: (user: UserType | null) => void;
  CleanrLogo?: React.FC<{ className?: string }>;
}

interface LandingPageProps {
    setView: (view: 'landing' | 'booking' | 'history' | 'services' | 'careers' | 'login' | 'signup' | 'privacy' | 'terms') => void;
    user: UserType | null;
    handleLogout: () => void;
    currentHeroIndex: number;
    CleanrLogo: React.FC<{ className?: string }>;
}

// --- SUB-COMPONENTS EXTRACTED TO PREVENT RE-RENDER FOCUS LOSS ---

const LoginView = React.memo(({ setView, setUser, CleanrLogo }: ViewProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const Logo = CleanrLogo || LogoOption1;

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      
      // Simulate network delay
      setTimeout(() => {
        const result = loginUser(email, password);
        if (result.success && result.user) {
            if (setUser) setUser(result.user);
            setView('landing');
        } else {
            setError(result.message || 'Login failed');
        }
        setIsLoading(false);
      }, 800);
    };

    return (
       <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 animate-fade-in relative">
          <button 
              onClick={() => setView('landing')}
              className="absolute top-8 left-4 md:left-8 text-gray-500 hover:text-brand-600 flex items-center gap-2 font-medium transition-colors"
          >
              <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
              <div className="text-center mb-8">
                  <div className="flex justify-center mb-4 text-brand-600">
                      <Logo className="w-16 h-16" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-500">Sign in to manage your bookings</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        placeholder="you@example.com"
                      />
                  </div>
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-semibold text-gray-700">Password</label>
                          <a href="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Forgot?</a>
                      </div>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                  </div>
                  <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex justify-center items-center gap-2"
                  >
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : "Sign In"}
                  </button>
              </form>
              
              <div className="mt-8 text-center pt-6 border-t">
                  <p className="text-gray-500">Don't have an account? <span onClick={() => setView('signup')} className="text-brand-600 font-bold cursor-pointer hover:underline">Sign up</span></p>
              </div>
          </div>
       </div>
    );
});

const SignupView = React.memo(({ setView, setUser }: ViewProps) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      setTimeout(() => {
          const result = registerUser(formData);
          if (result.success && result.user) {
              if (setUser) setUser(result.user);
              setView('landing');
          } else {
              setError(result.message || 'Registration failed');
          }
          setIsLoading(false);
      }, 800);
    };

    return (
       <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 animate-fade-in relative py-12">
          <button 
              onClick={() => setView('landing')}
              className="absolute top-8 left-4 md:left-8 text-gray-500 hover:text-brand-600 flex items-center gap-2 font-medium transition-colors"
          >
              <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
              <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                  <p className="text-gray-500">Join CleanrCrew for easier bookings</p>
              </div>
              
              <form onSubmit={handleSignup} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                        <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                            value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                        <input type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                            value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                      <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                      <input type="password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                          value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (Optional)</label>
                      <input type="tel" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Default Address (Optional)</label>
                      <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                          value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>

                  <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-4 bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex justify-center items-center gap-2"
                  >
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : "Sign Up"}
                  </button>
              </form>
              
              <div className="mt-6 text-center pt-6 border-t">
                  <p className="text-gray-500">Already have an account? <span onClick={() => setView('login')} className="text-brand-600 font-bold cursor-pointer hover:underline">Log in</span></p>
              </div>
          </div>
       </div>
    );
});

const CareersPage = React.memo(({ setView }: ViewProps) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: 'Cleaner',
        experience: '',
        about: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        
        // Simulate API call
        setTimeout(() => {
            saveApplicant(formData);
            setStatus('success');
            setFormData({ fullName: '', email: '', phone: '', position: 'Cleaner', experience: '', about: '' });
        }, 1500);
    };

    return (
        <div className="animate-fade-in py-12 px-4 max-w-6xl mx-auto">
             <button 
                onClick={() => setView('landing')}
                className="mb-8 text-gray-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="text-center mb-16">
                <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">We are Hiring</span>
                <h1 className="text-4xl font-bold text-gray-900 mt-4">Join the CleanrCrew Team</h1>
                <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                    Build a career with a company that cares about your success. We are looking for dedicated professionals to join our growing family.
                </p>
            </div>

            {status === 'success' ? (
                <div className="bg-brand-900 text-white rounded-2xl p-12 text-center max-w-4xl mx-auto mb-20 animate-fade-in shadow-xl">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-teal-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Application Received!</h3>
                    <p className="text-brand-100 text-lg mb-8">Thank you for applying to CleanrCrew. Our team will review your application and get back to you shortly.</p>
                    <button 
                        onClick={() => setStatus('idle')} 
                        className="bg-white text-brand-900 px-6 py-2 rounded-lg font-bold hover:bg-teal-50 transition-colors"
                    >
                        Submit another application
                    </button>
                </div>
            ) : (
                <div className="bg-white border rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                    <div className="bg-brand-900 p-8 md:p-12 text-white md:w-1/3 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
                                <circle cx="0" cy="0" r="40" />
                                <circle cx="100" cy="100" r="40" />
                            </svg>
                        </div>
                        <Briefcase className="w-12 h-12 text-teal-400 mb-6 relative z-10" />
                        <h2 className="text-3xl font-bold mb-4 relative z-10">Why Join Us?</h2>
                        <p className="text-brand-100 mb-6 relative z-10">
                            We offer competitive pay, flexible schedules, and a supportive environment.
                        </p>
                        <ul className="space-y-3 text-sm text-brand-200 relative z-10">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400"/> Competitive Hourly Rate</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400"/> Flexible Hours</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400"/> Paid Training</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400"/> Supplies Provided</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400"/> Must be Bondable</li>
                        </ul>
                    </div>

                    <div className="p-8 md:p-12 md:w-2/3 bg-gray-50">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Apply Now</h3>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        name="fullName"
                                        type="text" 
                                        required 
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                    <input 
                                        name="email"
                                        type="email" 
                                        required 
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                                        placeholder="jane@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                    <input 
                                        name="phone"
                                        type="tel" 
                                        required 
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Position</label>
                                    <select 
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white cursor-pointer"
                                    >
                                        <option value="Cleaner">Professional Cleaner</option>
                                        <option value="Team Lead">Team Leader</option>
                                        <option value="Admin">Admin / Support</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
                                <input 
                                    name="experience"
                                    type="text" 
                                    required 
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                                    placeholder="e.g. 2 years residential cleaning"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Why do you want to join us?</label>
                                <textarea 
                                    name="about"
                                    required 
                                    value={formData.about}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                            >
                                {status === 'submitting' ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : "Submit Application"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
});

const PrivacyPolicyPage = React.memo(({ setView }: ViewProps) => {
    return (
        <div className="animate-fade-in py-12 px-4 max-w-5xl mx-auto">
             <button 
                onClick={() => setView('landing')}
                className="mb-8 text-gray-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last Updated: December 15, 2025</p>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        CleanrCrew ("we," "us," or "our") operates the website <span className="font-medium text-brand-600">www.cleanrcrew.ca</span> (the "Website") and provides professional cleaning services in Mississauga and surrounding areas in Ontario, Canada. We are committed to protecting your privacy and handling your personal information responsibly in accordance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable laws.
                    </p>
                    <p>
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our Website, book our services, or interact with us. By using our Website or services, you consent to the practices described in this policy.
                    </p>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at the details provided in the "Contact Us" section below.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Personal Information We Collect</h2>
                        <p className="mb-4">We collect personal information only when necessary to provide our services or improve your experience.</p>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">Information You Provide Directly:</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>Name, email address, phone number, and postal address (e.g., when booking a cleaning service or submitting a contact form).</li>
                            <li>Billing information (e.g., payment details for services).</li>
                            <li>Details about your property (e.g., address, size, special instructions for cleaning).</li>
                            <li>Preferences or feedback (e.g., preferred cleaning products or service reviews).</li>
                        </ul>

                        <h3 className="font-semibold text-gray-900 mb-2">Information Collected Automatically:</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>Device and browser information, IP address, and usage data (e.g., pages visited, time spent on the site) via cookies and similar technologies.</li>
                            <li>Analytics data from tools like Google Analytics to understand Website traffic and improve functionality.</li>
                        </ul>
                        <p>We do not collect sensitive personal information (e.g., health data) unless voluntarily provided and relevant to our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Personal Information</h2>
                        <p className="mb-4">We use your information for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To schedule, provide, and manage cleaning services (e.g., confirming appointments, sending reminders).</li>
                            <li>To process payments and issue invoices.</li>
                            <li>To communicate with you (e.g., service updates, responses to inquiries).</li>
                            <li>To improve our Website and services (e.g., analyzing usage patterns).</li>
                            <li>To send promotional materials or newsletters (with your consent; you can opt out at any time).</li>
                            <li>To comply with legal obligations or protect our rights.</li>
                        </ul>
                        <p className="mt-4">We only use personal information for purposes that a reasonable person would consider appropriate.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. How We Share Your Personal Information</h2>
                        <p className="mb-4">We do not sell your personal information. We may share it with:</p>
                        <ul className="list-disc pl-5 space-y-2">
                             <li>Service providers (e.g., payment processors, scheduling software like Jobber, or email tools) who are contractually required to protect your data and use it only for our purposes.</li>
                             <li>Cleaning crew members (e.g., your address and instructions to perform services).</li>
                             <li>Legal authorities if required by law (e.g., subpoenas or investigations).</li>
                        </ul>
                        <p className="mt-4">If information is transferred outside Canada (e.g., to U.S.-based providers), it may be subject to foreign laws.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Cookies and Tracking Technologies</h2>
                        <p>Our Website uses cookies to enhance functionality (e.g., remembering preferences) and analytics. You can manage cookies through your browser settings. Third-party tools (e.g., Google Analytics) may collect anonymous data for site improvement.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Security of Your Information</h2>
                        <p>We implement reasonable safeguards (e.g., encryption, secure servers, access controls) to protect your information from unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Retention of Your Information</h2>
                        <p>We retain personal information only as long as necessary for the purposes outlined or as required by law (e.g., tax records). Once no longer needed, we securely delete or anonymize it.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Your Rights Under PIPEDA</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Access your personal information we hold.</li>
                            <li>Request corrections if information is inaccurate.</li>
                            <li>Withdraw consent (where applicable), subject to legal limitations.</li>
                            <li>File a complaint with the Office of the Privacy Commissioner of Canada.</li>
                        </ul>
                        <p className="mt-4">To exercise these rights, contact us using the details below.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
                        <p>Our services are not directed to children under 13. We do not knowingly collect information from children.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
                        <p>We may update this policy periodically. Changes will be posted here with an updated "Last Updated" date. Significant changes will be notified via email or on the Website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                        <p className="mb-2">If you have questions, requests, or concerns about this Privacy Policy or our practices, please contact our Privacy Officer:</p>
                        <p className="font-medium text-brand-600">Email: <a href="mailto:support@cleanrcrew.ca" className="underline">support@cleanrcrew.ca</a></p>
                    </section>

                     <p className="pt-8 text-sm text-gray-400">Thank you for trusting CleanrCrew with your cleaning needs. We value your privacy and strive to maintain your confidence.</p>
                </div>
            </div>
        </div>
    );
});

const TermsPage = React.memo(({ setView }: ViewProps) => {
    return (
        <div className="animate-fade-in py-12 px-4 max-w-5xl mx-auto">
             <button 
                onClick={() => setView('landing')}
                className="mb-8 text-gray-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last Updated: December 15, 2025</p>

                <div className="space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        CleanrCrew ("we," "us," "our," or "CleanrCrew") operates the website <span className="font-medium text-brand-600">www.cleanrcrew.com</span> (the "Website") and provides professional cleaning services in Mississauga and surrounding areas in Ontario, Canada. These Terms of Service ("Agreement") govern your access to and use of the Website, booking of our services, and any related interactions with CleanrCrew.
                    </p>
                    <p>
                        By accessing the Website, booking our services, or otherwise using our offerings, you agree to be bound by this Agreement. This Agreement constitutes a legal agreement between you and CleanrCrew. If you are booking services on behalf of an entity (e.g., a business or property management company), you represent that you are authorized to bind that entity to these Terms.
                    </p>
                    <p className="font-bold text-gray-800">
                        IF YOU DO NOT AGREE TO THESE TERMS, YOU MAY NOT USE OUR WEBSITE OR SERVICES.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Definitions</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>“User” or “you”</strong> refers to any individual or entity that accesses the Website or books our services.</li>
                            <li><strong>“Customer”</strong> refers to a User who books and pays for cleaning services.</li>
                            <li><strong>“Services”</strong> refers to the residential and/or commercial cleaning services provided by CleanrCrew.</li>
                            <li><strong>“Website”</strong> refers to www.cleanrcrew.com and any associated mobile applications or platforms.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
                        <p>You must be at least 18 years old to book Services or use the Website for commercial purposes. By using our Services, you represent that you meet this requirement and have the legal capacity to enter into this Agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Use of the Website and Services</h2>
                        <p className="mb-2">3.1 You may use the Website to browse information, request quotes, and book cleaning services.</p>
                        <p className="mb-2">3.2 When booking Services, you must provide accurate, complete, and up-to-date information (e.g., address, contact details, special instructions).</p>
                        <p className="mb-2">3.3 You are responsible for ensuring that the premises are safe and accessible for our cleaning crew on the scheduled date.</p>
                        <p className="mb-2">3.4 You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Use the Website or Services for any unlawful purpose;</li>
                            <li>Impersonate any person or entity;</li>
                            <li>Interfere with or disrupt the Website (e.g., through viruses or automated scripts);</li>
                            <li>Attempt to gain unauthorized access to our systems.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Booking, Scheduling, and Payment</h2>
                        <p className="mb-2">4.1 Quotes and bookings are subject to availability and confirmation by CleanrCrew.</p>
                        <p className="mb-2">4.2 Payment for Services is due at the time of booking or upon completion of the service, as specified during the booking process. We accept payments via Stripe or other processors indicated on the Website.</p>
                        <p className="mb-2">4.3 All fees are quoted in Canadian Dollars (CAD) and are exclusive of applicable taxes (e.g., HST) unless otherwise stated.</p>
                        <p className="mb-2">4.4 You authorize CleanrCrew and our payment processors to charge your provided payment method for the agreed amount.</p>
                        <p className="mb-2">4.5 Taxes: You are responsible for all applicable sales, use, or other taxes associated with the Services, other than taxes based on CleanrCrew’s income.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cancellations and Rescheduling</h2>
                        <p className="mb-2">5.1 You may cancel or reschedule a booking free of charge with at least 48 hours’ notice prior to the scheduled start time.</p>
                        <p className="mb-2">5.2 Cancellations or rescheduling with less than 48 hours’ notice may incur a fee of up to 50% of the booked service price.</p>
                        <p className="mb-2">5.3 No-shows or same-day cancellations will be charged the full service amount.</p>
                        <p className="mb-2">5.4 CleanrCrew reserves the right to cancel or reschedule bookings due to unforeseen circumstances (e.g., crew illness, severe weather). In such cases, we will provide as much notice as possible and offer a full refund or rescheduling option.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Service Performance and Satisfaction</h2>
                        <p className="mb-2">6.1 We strive to deliver high-quality cleaning services, but results may vary based on the condition of the premises, time allocated, and other factors.</p>
                        <p className="mb-2">6.2 If you are not satisfied with the service, please notify us within 24 hours of completion. We will make reasonable efforts to address your concerns, which may include a complimentary re-clean of affected areas (subject to availability).</p>
                        <p className="mb-2">6.3 CleanrCrew is not responsible for damage caused by pre-existing conditions, improper use of premises, or items not disclosed prior to service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Liability and Insurance</h2>
                        <p className="mb-2">7.1 CleanrCrew maintains commercial general liability insurance and janitorial bonding to protect against accidental damage or theft.</p>
                        <p className="mb-2">7.2 We are not liable for:</p>
                        <ul className="list-disc pl-5 space-y-2">
                             <li>Damage to fragile, valuable, or irreplaceable items not disclosed in advance;</li>
                             <li>Loss or damage beyond the coverage limits of our insurance;</li>
                             <li>Indirect, consequential, or punitive damages.</li>
                        </ul>
                        <p className="mt-2">7.3 Our total liability for any claim arising from the Services shall not exceed the amount paid for the specific service giving rise to the claim.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Customer Property and Privacy</h2>
                        <p className="mb-2">8.1 You grant CleanrCrew and its crew temporary access to your premises solely for the purpose of performing the Services.</p>
                        <p className="mb-2">8.2 Our crew members are instructed to respect your privacy and property. We maintain strict confidentiality regarding any personal information observed during service.</p>
                        <p className="mb-2">8.3 Your personal data is handled in accordance with our Privacy Policy, available at <span className="text-brand-600 underline cursor-pointer" onClick={() => setView('privacy')}>www.cleanrcrew.com/privacy</span>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
                        <p>The Website, CleanrCrew branding, logos, and content are owned by CleanrCrew or its licensors. You receive no ownership rights and may not reproduce or use them without written permission.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">10. Third-Party Services</h2>
                        <p>The Website may link to or integrate with third-party services (e.g., payment processors, scheduling tools). These are governed by their own terms and privacy policies. CleanrCrew is not responsible for their availability or performance.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">11. Warranties and Disclaimers</h2>
                        <p>The Services and Website are provided “as is” and “as available.” To the maximum extent permitted by law, CleanrCrew disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">12. Termination</h2>
                        <p>CleanrCrew may refuse service or terminate access to the Website for any reason, including breach of these Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
                        <p>We may update these Terms from time to time. Material changes will be posted on the Website with an updated “Last Updated” date. Continued use of the Website or Services after changes constitutes acceptance of the revised Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">14. Governing Law and Dispute Resolution</h2>
                        <p>This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">15. General Provisions</h2>
                        <p className="mb-2">15.1 This Agreement constitutes the entire understanding between you and CleanrCrew regarding the Services and Website.</p>
                        <p className="mb-2">15.2 If any provision is held invalid, the remainder shall continue in full force.</p>
                        <p className="mb-2">15.3 Notices to CleanrCrew should be sent to <a href="mailto:support@cleanrcrew.com" className="text-brand-600 underline">support@cleanrcrew.com</a>.</p>
                    </section>

                    <p className="pt-8 text-sm text-gray-400">Thank you for choosing CleanrCrew. We look forward to providing you with exceptional cleaning services!</p>
                </div>
            </div>
        </div>
    );
});

const ServicesPage = React.memo(({ setView }: ViewProps) => {
    return (
    <div className="animate-fade-in py-12 px-4 max-w-6xl mx-auto">
        <button 
            onClick={() => setView('landing')}
            className="mb-8 text-gray-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1 transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                No hidden fees. No contracts. Just professional cleaning at a fair hourly rate.
            </p>
        </div>

        {/* Pricing Structure Info */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 mb-16 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-4 md:w-2/3">
                <h3 className="text-2xl font-bold text-brand-900">How our pricing works</h3>
                <p className="text-brand-800 leading-relaxed">
                    We charge a flat hourly rate per cleaner based on the service type. 
                    This ensures you only pay for the time we actually spend making your home sparkle.
                </p>
                <ul className="space-y-2 text-brand-700">
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-brand-500" /> 30% deposit to secure your slot</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-brand-500" /> Remaining balance due only after completion</li>
                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-brand-500" /> Minimum 2-hour booking</li>
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 md:w-1/3 w-full">
                 <div className="text-center">
                    <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Starting at</p>
                    <p className="text-5xl font-bold text-brand-600 my-2">$45<span className="text-lg text-gray-400 font-normal">/hr</span></p>
                    <button 
                        onClick={() => setView('booking')}
                        className="w-full mt-4 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                    >
                        Book Now
                    </button>
                 </div>
            </div>
        </div>

        {/* Service Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
            {SERVICE_OPTIONS.map((service) => (
                <div key={service.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    <div className="p-8 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-brand-50 text-2xl w-12 h-12 rounded-lg flex items-center justify-center text-brand-600">
                                {service.icon}
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-brand-600">${service.hourlyRate}</span>
                                <span className="text-sm text-gray-500">per hour</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                        
                        <p className="text-gray-600 mb-6">{service.description}</p>
                        
                        <div className="space-y-4 mb-8 flex-grow">
                            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Includes:</h4>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                {service.id === 'Standard Clean' && [
                                    "Dusting all surfaces",
                                    "Vacuuming and mopping floors",
                                    "Bathroom sanitation",
                                    "Kitchen counter & sink cleaning",
                                    "Making beds"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                                {service.id === 'Deep Clean' && [
                                    "All Standard Clean items",
                                    "Inside oven and fridge cleaning",
                                    "Baseboards and door frames",
                                    "Interior window cleaning",
                                    "Heavy scale removal in bathrooms"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                                {service.id === 'Move-in/Move-out' && [
                                    "Deep cleaning of empty home",
                                    "Inside all cabinets and drawers",
                                    "Spot cleaning walls",
                                    "Light fixtures and fans",
                                    "Guarantee for deposit return"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                                 {service.id === 'Office Clean' && [
                                    "Desk and workstation dusting",
                                    "Trash removal & bin lining",
                                    "Kitchenette and breakroom cleaning",
                                    "Restroom sanitization",
                                    "Glass door cleaning"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-6 border-t mt-auto">
                            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                                 <span>Recommended time:</span>
                                 <span className="font-medium text-gray-900">{service.recommendedHours} hours</span>
                            </div>
                            <button 
                                onClick={() => setView('booking')}
                                className="w-full border-2 border-brand-100 text-brand-700 py-3 rounded-lg font-bold hover:bg-brand-50 hover:border-brand-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Choose {service.title} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

         {/* Coming Soon Section */}
         <div className="mb-20">
            <div className="text-center mb-10">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Roadmap</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-4">Coming Soon</h2>
                <p className="text-gray-600 mt-2">We are expanding our services to better serve your specialized needs.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Post Renovation & Construction", icon: "🚧", desc: "Heavy duty cleanup after building work." },
                    { title: "Real Estate & Contractor Services", icon: "🔑", desc: "Reliable partnerships for agents & builders." },
                    { title: "Home Staging Cleaning", icon: "🏡", desc: "Make the property shine for potential buyers." },
                    { title: "House Cleaning for Seniors", icon: "💝", desc: "Gentle, trustworthy service for peace of mind." }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center text-center group hover:border-brand-300 transition-colors">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
                        <span className="mt-auto text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">Coming Soon</span>
                    </div>
                ))}
            </div>
        </div>

        {/* FAQ Preview */}
        <div className="max-w-3xl mx-auto text-center space-y-8">
            <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
            <div className="grid gap-6 text-left">
                <div className="bg-white p-6 rounded-xl border">
                    <h4 className="font-bold text-gray-900 mb-2">Do I need to provide cleaning supplies?</h4>
                    <p className="text-gray-600">No, our cleaners come fully equipped with professional-grade supplies and equipment. If you have specific products you'd like us to use, just let us know!</p>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                    <h4 className="font-bold text-gray-900 mb-2">What if I'm not satisfied?</h4>
                    <p className="text-gray-600">We offer a 100% satisfaction guarantee. If you're unhappy with any area we've cleaned, call us within 24 hours and we'll come back and reclean it for free.</p>
                </div>
            </div>
        </div>
    </div>
    );
});

const LandingPage = React.memo(({ setView, user, handleLogout, currentHeroIndex, CleanrLogo }: LandingPageProps) => {
    const Logo = CleanrLogo || LogoOption1;
    
    return (
    <div className="animate-fade-in">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand-900 text-white pb-20 pt-10 px-6">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-teal-400 rounded-full blur-3xl opacity-20"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <nav className="flex justify-between items-center mb-16">
                    <div 
                        className="flex items-center gap-3 text-2xl font-bold cursor-pointer group"
                        onClick={() => setView('landing')}
                    >
                        <div className="text-brand-500 group-hover:text-teal-300 transition-colors duration-300">
                            <Logo className="w-12 h-12" />
                        </div>
                        <span>Cleanr<span className="text-teal-400">Crew</span></span>
                    </div>
                    <div className="flex gap-6 items-center">
                        {user ? (
                            <div className="flex items-center gap-4 animate-fade-in">
                                <button
                                    onClick={() => setView('history')}
                                    className="text-sm font-medium text-brand-100 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <History className="w-4 h-4" /> My Bookings
                                </button>
                                <div className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                                    <User className="w-4 h-4 text-teal-300" />
                                    <span className="text-sm font-medium">Hi, {user.firstName}</span>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-brand-200 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setView('login')}
                                className="text-sm font-medium hover:text-teal-300 transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                            >
                                Log In
                            </button>
                        )}
                    </div>
                </nav>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Your Home, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-brand-200">Perfectly Cleaned.</span>
                        </h1>
                        <p className="text-brand-100 text-lg max-w-md leading-relaxed">
                            Helping you handle the mess so you can handle the rest.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button 
                                onClick={() => setView('booking')}
                                className="bg-white text-brand-900 px-8 py-4 rounded-full font-bold shadow-lg shadow-brand-900/50 hover:bg-teal-50 transition-all transform hover:-translate-y-1"
                            >
                                Book a Clean Now
                            </button>
                            <button 
                                onClick={() => setView('services')}
                                className="border border-brand-700 px-8 py-4 rounded-full font-medium hover:bg-brand-800 transition-colors"
                            >
                                View Services
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        {/* Slideshow Container */}
                        <div className="relative h-[400px] w-full rounded-2xl shadow-2xl border-4 border-brand-800/50 overflow-hidden bg-brand-800">
                             {HERO_IMAGES.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt="Cleaning Service" 
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                        index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                                />
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">Why CleanrCrew?</h2>
                    <p className="text-gray-500 mt-2">The smartest way to keep your home shining.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Star, title: "Customized Cleaning", text: "Spotless Home without breaking the bank." },
                        { icon: ShieldCheck, title: "Vetted Professionals", text: "Every cleaner is background checked, insured, and rated." },
                        { icon: Sparkles, title: "Satisfaction Guarantee", text: "Your satisfaction is our priority. Let us know of any issues within 24 hours and we will make it right." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-brand-100 w-12 h-12 rounded-lg flex items-center justify-center text-brand-600 mb-6">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
    );
});

function App() {
  const [view, setView] = useState<'landing' | 'booking' | 'history' | 'services' | 'careers' | 'login' | 'signup' | 'privacy' | 'terms'>('landing');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [user, setUser] = useState<UserType | null>(null);

  // Default Logo
  const CleanrLogo = LogoOption1;

  // Init
  useEffect(() => {
    // Check for existing session
    const session = getCurrentSession();
    if (session) {
      setUser(session);
    }
    
    // Slideshow interval
    const interval = setInterval(() => {
        setCurrentHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {view === 'booking' ? (
        <div className="py-12 px-4">
             <div className="max-w-4xl mx-auto mb-6">
                <button 
                    onClick={() => setView('landing')}
                    className="text-gray-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
             </div>
             <BookingWizard currentUser={user} />
        </div>
      ) : view === 'history' ? (
        <BookingHistory currentUser={user} onBack={() => setView('landing')} />
      ) : view === 'services' ? (
         <ServicesPage setView={setView} />
      ) : view === 'careers' ? (
         <CareersPage setView={setView} />
      ) : view === 'privacy' ? (
         <PrivacyPolicyPage setView={setView} />
      ) : view === 'terms' ? (
         <TermsPage setView={setView} />
      ) : view === 'login' ? (
         <LoginView setView={setView} setUser={setUser} CleanrLogo={CleanrLogo} />
      ) : view === 'signup' ? (
         <SignupView setView={setView} setUser={setUser} />
      ) : (
        <LandingPage 
            setView={setView} 
            user={user} 
            handleLogout={handleLogout} 
            currentHeroIndex={currentHeroIndex}
            CleanrLogo={CleanrLogo}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-white border-t py-12 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-sm text-gray-500">
              <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-2 mb-4 text-brand-600">
                      <CleanrLogo className="w-8 h-8" />
                      <span className="font-bold text-gray-900 text-lg">CleanrCrew</span>
                  </div>
                  <p className="mb-4">&copy; 2024 CleanrCrew Inc.<br/>All rights reserved.</p>
              </div>
              
              <div>
                  <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                  <div className="flex flex-col gap-2">
                      <button onClick={() => setView('services')} className="text-left hover:text-brand-600">Services</button>
                      <button onClick={() => setView('careers')} className="text-left hover:text-brand-600">Careers</button>
                      <button onClick={() => setView('privacy')} className="text-left hover:text-brand-600">Privacy Policy</button>
                      <button onClick={() => setView('terms')} className="text-left hover:text-brand-600">Terms of Service</button>
                  </div>
              </div>

              <div>
                  <h4 className="font-bold text-gray-900 mb-4">Service Areas</h4>
                  <ul className="space-y-2">
                      {SERVICE_AREAS.map(area => (
                          <li key={area}>{area}</li>
                      ))}
                  </ul>
              </div>

               <div>
                  <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
                  <p>support@cleanrcrew.ca</p>
              </div>
          </div>
      </footer>
    </div>
  );
}

export default App;
