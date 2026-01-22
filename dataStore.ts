import { AppData, TransportService, TransportVendor, FoodVendor, Dish, TransportVehicle, Property, Photo, TransportLead } from './types';
import { supabase } from './src/lib/supabaseClient';

// --- CACHE CONFIGURATION ---
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let lastCacheTime: number | null = null;
let cachedTransportData: {
  services: TransportService[];
  vendors: TransportVendor[];
  vehicles: TransportVehicle[];
} | null = null;

let appData: AppData | null = null;

// --- UTILITIES ---
const isDevelopment = (): boolean => {
  return import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const isCacheValid = (): boolean => {
  if (!lastCacheTime) return false;
  return Date.now() - lastCacheTime < CACHE_DURATION;
};

export const clearCache = () => {
  cachedTransportData = null;
  appData = null;
  lastCacheTime = null;
  if (isDevelopment()) console.log('📦 Cache cleared');
};

// --- CORE DATA LOADING ---
export const loadAppData = async (): Promise<AppData> => {
  if (appData) return appData;
  try {
    const [
      { data: properties },
      { data: images },
      { data: fVendors }, // Food
      { data: fItems }    // Food
    ] = await Promise.all([
      supabase.from('properties').select('*'),
      supabase.from('property_images').select('*'),
      supabase.from('food_vendors').select('*'),
      supabase.from('food_items').select('*')
    ]);

    appData = {
      meta: { brand_name: "Umunna Stays", whatsapp_main_number: "2347048033575", default_city: "Asaba", currency_symbol: "₦" },
      properties: (properties || []) as Property[],
      photo_gallery: { photos: (images || []) as Photo[] },
      transport_services: [], // Lazy loaded
      transport_vendors: [],  // Lazy loaded
      transport_vehicles: [], // Lazy loaded
      city_summary: [],
      services_catalog: [],
      policies_global: {
        check_in: "2:00 PM",
        check_out: "12:00 PM",
        self_check_in: "Contact concierge for access",
        children: "Allowed",
        beds: "Per listing",
        pets: "Not allowed",
        service_animals: "Allowed"
      }
    } as unknown as AppData;

    (appData as any).food_vendors = fVendors || [];
    (appData as any).food_items = fItems || [];

    if (isDevelopment()) console.log('✅ AppData loaded', appData);
    return appData;
  } catch (error) {
    console.error('❌ Error loading Supabase data:', error);
    return {
      meta: { brand_name: "Umunna Stays", whatsapp_main_number: "2347048033575", default_city: "Asaba", currency_symbol: "₦" },
      properties: [],
      photo_gallery: { photos: [] },
      city_summary: [],
      services_catalog: [],
      transport_services: [],
      transport_vendors: [],
      transport_vehicles: [],
      policies_global: {}
    } as AppData;
  }
};

export const loadTransportData = async (): Promise<{
  services: TransportService[];
  vendors: TransportVendor[];
  vehicles: TransportVehicle[];
}> => {
  if (cachedTransportData && isCacheValid()) {
    if (isDevelopment()) console.log('⚡ Using cached transport data');
    return cachedTransportData;
  }

  try {
    const [
      { data: tServices },
      { data: tVendors },
      { data: tVehicles }
    ] = await Promise.all([
      supabase.from('transport_services').select('*'),
      supabase.from('transport_vendors').select('*'),
      supabase.from('transport_vehicles').select('*')
    ]);

    cachedTransportData = {
      services: (tServices || []) as TransportService[],
      vendors: (tVendors || []) as TransportVendor[],
      vehicles: (tVehicles || []) as TransportVehicle[]
    };
    lastCacheTime = Date.now();

    // Backfill main appData so legacy getters still work
    if (appData) {
      appData.transport_services = cachedTransportData.services;
      appData.transport_vendors = cachedTransportData.vendors;
      appData.transport_vehicles = cachedTransportData.vehicles;
    }

    if (isDevelopment()) console.log('🚚 Transport data loaded', cachedTransportData);
    return cachedTransportData;
  } catch (error) {
    console.error('❌ Error loading transport data:', error);
    // Return empty structure so UI doesn't crash or hang
    return {
      services: [],
      vendors: [],
      vehicles: []
    };
  }
};

// --- GETTERS & HELPERS ---

export const getPropertyById = (data: AppData, id: string): Property | undefined => {
  return data.properties.find(p => p.property_id === id);
};

export const getPhotosByPropertyId = (data: AppData, propertyId: string): Photo[] => {
  const property = getPropertyById(data, propertyId);
  const galleryPhotos = (data.photo_gallery?.photos || [])
    .filter(p => p.property_id === propertyId)
    .sort((a, b) => a.sequence_order - b.sequence_order);

  if (galleryPhotos.length > 0) return galleryPhotos;

  if (property) {
    return [{
      photo_id: `hero_${propertyId}`,
      property_id: propertyId,
      sequence_order: 1,
      image_url: property.hero_image_url,
      caption: property.name,
      alt_text: property.name,
      room_category: "Hero View"
    }];
  }

  return [];
};

export const getFeaturedProperties = (data: AppData): Property[] => {
  return data.properties.filter(p => p.is_featured).sort((a, b) => a.display_order - b.display_order);
};

export const getServicesByType = (data: AppData, type: string): any[] => {
  return (data.services_catalog || []).filter(s => s.type === type);
};

export const getCities = (data: AppData): string[] => {
  const cities = new Set(data.properties.map(p => p.city));
  return ['All', ...Array.from(cities).sort()];
};

export const getPropertiesByCity = (data: AppData, city: string): Property[] => {
  if (city === 'All') return data.properties;
  return data.properties.filter(p => p.city === city);
};

export const getTransportServices = (data: AppData): TransportService[] => {
  const services = cachedTransportData?.services || data.transport_services || [];
  return services.sort((a, b) => a.sort_order - b.sort_order);
};

export const generateLeadId = (prefix = "LEAD"): string => {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}_${dateStr}_${random}`;
};

export const nowISO = (): string => new Date().toISOString();

export const buildTransportWhatsAppClickUrl = (vendorWhatsAppNumber: string, prefillText: string): string => {
  const digits = vendorWhatsAppNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(prefillText)}`;
};

export const validateTransportLead = (lead: Partial<TransportLead>): void => {
  if (!lead.guest_name) throw new Error("Name is required");
  if (!lead.guest_phone) throw new Error("Phone is required");
  if (!lead.city) throw new Error("City is required");
  if (!lead.service_type) throw new Error("Service type is required");
};

export const saveTransportLead = async (lead: TransportLead, endpointUrl?: string) => {
  validateTransportLead(lead);

  // 1. Supabase Insert (Primary)
  try {
    const { error } = await supabase.from('leads').insert({
      user_id: null, // or auth user id if available
      full_name: lead.guest_name,
      phone: lead.guest_phone,
      city: lead.city,
      service_type: 'TRANSPORT',
      status: lead.status || 'new',
      details: {
        email: lead.guest_email,
        pickup: lead.pickup_location,
        dropoff: lead.dropoff_location,
        date: lead.date_needed,
        time: lead.time_needed,
        passengers: lead.passengers,
        budget: lead.budget_ngn,
        notes: lead.notes,
        vehicle_id: (lead as any).vehicle_id, // Ensure TS compliance or cast
        vendor_id: lead.vendor_id
      }
    });

    if (error) throw error;
    if (isDevelopment()) console.log('✅ Lead saved to Supabase');

  } catch (sbError) {
    console.warn('⚠️ Supabase insert failed, falling back to local storage', sbError);
    // 2. Local Storage Fallback
    const existingLeads = JSON.parse(localStorage.getItem('umunna_transport_leads') || '[]');
    existingLeads.push(lead);
    localStorage.setItem('umunna_transport_leads', JSON.stringify(existingLeads));
  }
};

export const exportLeadsToCSV = () => {
  const leads: TransportLead[] = JSON.parse(localStorage.getItem('umunna_transport_leads') || '[]');
  if (leads.length === 0) return;

  const columns = [
    'lead_id', 'created_at', 'guest_name', 'guest_phone', 'guest_email', 'city', 'property_id',
    'service_type', 'service_id', 'vendor_id', 'pickup_location', 'dropoff_location',
    'date_needed', 'time_needed', 'passengers', 'budget_ngn', 'notes', 'status',
    'assigned_to', 'whatsapp_click_url'
  ];

  const csvRows = [
    columns.join(','),
    ...leads.map(lead => columns.map(col => {
      const val = (lead as any)[col] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(','))
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'umunna_transport_leads.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const buildTransportWhatsAppLink = (params: {
  vendorWhatsapp: string;
  fallbackWhatsapp: string;
  template: string;
  formValues: any;
}): string => {
  const whatsappNumber = (params.vendorWhatsapp || params.fallbackWhatsapp).replace(/\D/g, '');
  let message = params.template || "Hello, I'm interested in a transport service.";

  const details = `\n\nDetails:\nName: ${params.formValues.guest_name}\nPhone: ${params.formValues.guest_phone}\nService: ${params.formValues.service_type}\nCity: ${params.formValues.city}\nPickup: ${params.formValues.pickup_location}\nDate: ${params.formValues.date_needed}\nNotes: ${params.formValues.notes}`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message + details)}`;
};

export const getTransportVendors = (data: AppData): TransportVendor[] => {
  const vendors = cachedTransportData?.vendors || data.transport_vendors || [];
  return vendors
    .filter(v => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
};

export const getVehicleFleet = (data: AppData): TransportVehicle[] => {
  const vehicles = cachedTransportData?.vehicles || data.transport_vehicles || [];
  return vehicles.sort((a, b) => a.sort_order - b.sort_order);
};

export const extractVehiclePrice = (priceStr: string | number | null | undefined): string => {
  if (priceStr === null || priceStr === undefined || priceStr === '') return 'Quote';
  const str = String(priceStr);
  if (str.toLowerCase() === 'premium') return 'Premium';

  const match = str.match(/\d+/);
  return match ? `₦${parseInt(match[0]).toLocaleString()}/day` : str;
};

export const splitVehicleImages = (imageUrl: string | null | undefined): string[] => {
  if (!imageUrl || typeof imageUrl !== 'string') return [];
  if (imageUrl.includes('|')) {
    return imageUrl.split('|').map(s => s.trim()).filter(s => s.startsWith('http'));
  }
  return imageUrl.split(/[\t\s,]+/).filter(url => url.startsWith('http'));
};

export const getBestServiceForVehicle = (vehicle: TransportVehicle): string => {
  const cat = vehicle.category.toLowerCase();
  if (cat === 'private jet') return 'TRS_004';
  if (cat === 'escort') return 'TRS_002';
  if (cat === 'van') return 'TRS_001';
  return 'TRS_001';
};

export const getBestTransportVendor = (data: AppData, city: string, serviceType: string): TransportVendor | null => {
  const normalizedCity = city.toLowerCase().trim();
  const activeVendors = getTransportVendors(data);

  const matches = activeVendors.filter(v =>
    v.coverage_cities.some(c => c.toLowerCase().trim() === normalizedCity) &&
    v.service_types.some(s => s.toLowerCase().trim() === serviceType.toLowerCase().trim())
  );

  return matches.length > 0 ? matches.sort((a, b) => a.sort_order - b.sort_order)[0] : null;
};

export const getVehiclesByVendor = (data: AppData, vendorId: string): TransportVehicle[] => {
  const vehicles = cachedTransportData?.vehicles || data.transport_vehicles || [];
  return vehicles
    .filter(v => v.vendor_id === vendorId)
    .sort((a, b) => a.sort_order - b.sort_order);
};

export const buildVehicleWhatsAppUrl = (
  vendor: TransportVendor,
  vehicle: TransportVehicle,
  city: string
): string => {
  const cleanNumber = vendor.whatsapp_number.replace(/\D/g, '');
  const serviceId = getBestServiceForVehicle(vehicle);
  const text = `Hello Umunna Rides, I'm interested in ${vehicle.make_model} (ID: ${vehicle.vehicle_id}) in ${city}. Please confirm availability and booking details for service ${serviceId}.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

export const parsePipes = (str: string): string[] => {
  if (!str) return [];
  return str.split('|').map(item => item.trim());
};

export const extractPrice = (priceStr: string | number): string => {
  if (typeof priceStr === 'number') return `₦${priceStr.toLocaleString()}`;
  if (!priceStr) return "Quote";
  if (priceStr.toLowerCase() === 'premium') return "Premium";

  const match = priceStr.match(/\d+/);
  if (match) {
    const amount = parseInt(match[0]).toLocaleString();
    return `Starting from ₦${amount}`;
  }

  return priceStr;
};

export const getActiveTransportVendorsByCity = (data: AppData, city: string): TransportVendor[] => {
  const normalizedCity = city.toLowerCase().trim();
  return getTransportVendors(data).filter(v =>
    v.coverage_cities.some(c => c.toLowerCase().trim() === normalizedCity)
  );
};

// --- FOOD HELPERS ---

export const getFoodVendors = (data?: AppData): FoodVendor[] => {
  // Use passed data, or global cache, or empty
  const source = data || appData;
  if (source && (source as any).food_vendors) return (source as any).food_vendors;
  return [];
};

export const getFoodVendorById = (vendorId: string): FoodVendor | undefined => {
  return getFoodVendors().find(v => v.vendor_id === vendorId);
};

export const getDishesByVendor = (vendorId: string): Dish[] => {
  if (appData && (appData as any).food_items) {
    // Assuming food_items might link to vendor? 
    // The interface Dish in types.ts doesn't explicitly show vendor_id, 
    // but typically it should. If not, we return basic filtering if possible or just all items (if menu is global/small)
    // For now returning all items as 'Judith's Kitchen' implies single vendor mostly.
    return (appData as any).food_items;
  }
  return [];
};

export const getJudithMenu = (): Dish[] => {
  if (appData && (appData as any).food_items) return (appData as any).food_items;
  return [];
};

export const RAW_DATA = { whatsapp_main_number: "2347048033575" };

export const getStoredLeads = () => {
  return JSON.parse(localStorage.getItem('umunna_transport_leads') || '[]');
};

// --- DEBUG / VERIFICATION HELPERS ---
if (typeof window !== 'undefined') {
  (window as any).__dataStore = {
    clearCache: clearCache,
    getStoredLeads: getStoredLeads,
    getTransportCache: () => cachedTransportData,
    isCacheValid: isCacheValid
  };
}