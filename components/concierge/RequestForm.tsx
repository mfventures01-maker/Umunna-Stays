import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Wallet, Briefcase, Users, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

export type RequestType = 'STAY' | 'TRANSPORT';

export interface RequestFormContext {
    property_id?: string;
    property_name?: string;
    vehicle_id?: string;
    vehicle_name?: string;
    vehicle_type?: string;
}

interface RequestFormProps {
    defaultRequestType?: RequestType;
    context?: RequestFormContext;
    className?: string;
    onSubmit?: (payload: RequestPayload) => void;
}

export interface RequestPayload {
    full_name: string;
    phone: string;
    city: string;
    request_type: RequestType;
    date_start: string;
    date_end: string;
    guests_or_passengers: number;
    budget: string;
    context?: RequestFormContext;
}

interface FormData {
    full_name: string;
    phone: string;
    city: string;
    request_type: RequestType;
    date_start: string;
    date_end: string;
    guests_or_passengers: number;
    budget: string;
}

const RequestForm: React.FC<RequestFormProps> = ({
    defaultRequestType = 'STAY',
    context,
    className = '',
    onSubmit
}) => {
    const [formData, setFormData] = useState<FormData>({
        full_name: '',
        phone: '',
        city: 'Asaba',
        request_type: defaultRequestType,
        date_start: '',
        date_end: '',
        guests_or_passengers: 1,
        budget: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(prev => ({ ...prev, request_type: defaultRequestType }));
    }, [defaultRequestType]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Phone must be at least 10 digits';
        }
        if (!formData.city.trim()) newErrors.city = 'City is required';

        // Dates
        if (!formData.date_start) newErrors.date_start = 'Start date is required';
        // Date end is optional based on prompt ("date_end optional but if present must be >= date_start")
        // We will treat it as optional for validation, but logic below ensures integrity if present.
        if (formData.date_end && formData.date_start) {
            if (new Date(formData.date_end) < new Date(formData.date_start)) {
                newErrors.date_end = 'End date cannot be before start date';
            }
        }

        if (formData.guests_or_passengers < 1) newErrors.guests_or_passengers = 'Must have at least 1 guest/passenger';
        if (!formData.budget.trim()) newErrors.budget = 'Budget preference is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        // Simulate processing or just pass up
        const payload: RequestPayload = {
            ...formData,
            context
        };

        if (onSubmit) {
            onSubmit(payload);
        } else {
            console.log('RequestForm Submitted:', payload);
            alert('Form submitted! (Check console for payload)');
        }

        setIsSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 ${className}`}>
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Concierge Request</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                    {defaultRequestType === 'STAY' ? 'Find your perfect stay' : 'Book premium transport'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Request Type (Hidden/Visual if needed, but field exists) & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Request Type</label>
                        <div className="relative">
                            <select
                                name="request_type"
                                value={formData.request_type}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pl-10 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-[#C46210] transition-all"
                            >
                                <option value="STAY">Accommodation</option>
                                <option value="TRANSPORT">Transport / Flight</option>
                            </select>
                            <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">City</label>
                        <div className="relative">
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.city ? 'border-red-500' : 'border-gray-100'}`}
                            >
                                {['Asaba', 'Benin', 'Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Other'].map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.city && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.city}</p>}
                    </div>
                </div>

                {/* Row 2: Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.full_name ? 'border-red-500' : 'border-gray-100'}`}
                            />
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.full_name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.full_name}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Phone (WhatsApp)</label>
                        <div className="relative">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="08012345678"
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
                            />
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                    </div>
                </div>

                {/* Row 3: Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                            {formData.request_type === 'STAY' ? 'Check-in' : 'Date Needed'}
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                name="date_start"
                                value={formData.date_start}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.date_start ? 'border-red-500' : 'border-gray-100'}`}
                            />
                            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.date_start && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.date_start}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                            {formData.request_type === 'STAY' ? 'Check-out' : 'End Date (Opt)'}
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                name="date_end"
                                value={formData.date_end}
                                onChange={handleChange}
                                min={formData.date_start || new Date().toISOString().split('T')[0]}
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.date_end ? 'border-red-500' : 'border-gray-100'}`}
                            />
                            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.date_end && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.date_end}</p>}
                    </div>
                </div>

                {/* Row 4: Guests & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                            {formData.request_type === 'STAY' ? 'Guests' : 'Passengers'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="guests_or_passengers"
                                value={formData.guests_or_passengers}
                                onChange={handleChange}
                                min={1}
                                max={50}
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.guests_or_passengers ? 'border-red-500' : 'border-gray-100'}`}
                            />
                            <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.guests_or_passengers && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.guests_or_passengers}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Budget Range</label>
                        <div className="relative">
                            <select
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.budget ? 'border-red-500' : 'border-gray-100'}`}
                            >
                                <option value="">Select Budget...</option>
                                <option value="economy">Economy / Standard</option>
                                <option value="comfort">Comfort (₦80k - ₦150k)</option>
                                <option value="premium">Premium (₦150k - ₦300k)</option>
                                <option value="luxury">Luxury / VIP (300k+)</option>
                            </select>
                            <Wallet size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors.budget && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.budget}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#C46210] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-100 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit Request <MessageSquare size={18} /></>}
                </button>

            </form>
        </div>
    );
};

export default RequestForm;
