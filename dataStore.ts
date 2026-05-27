/**
 * LEGACY SYSTEM
 * Scheduled for deprecation.
 * DO NOT ADD NEW LOGIC HERE.
 * 
 * Note: This file currently acts as a hidden state manager.
 */

const foodEnabled = import.meta.env.VITE_ENABLE_FOOD_VERTICAL !== 'false';
const transportEnabled = import.meta.env.VITE_ENABLE_TRANSPORT_VERTICAL !== 'false';

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

export const mockFoodVendors: FoodVendor[] = [
  {
    vendor_id: "V_001",
    name: "Judith Amazing Kitchen",
    description: "Authentic local delicacies delivered to your stay across Asaba, Benin, and Awka.",
    logo_url: "https://i.postimg.cc/gk40BMZB/umunna-logo.png",
    menu_url: "https://drive.google.com/drive/folders/1a63MYdjZ7XP1JsFqVuJfldByca18OQ0D?usp=drive_link",
    whatsapp_number: "2347048033575",
    is_active: true,
    sort_order: 1
  } as any
];

export const mockFoodItems: Dish[] = [
  { dish_id: "JAK_002", dish_name: "Jollof Rice & Diced Chicken", description: "Rich Jollof rice served with spicy diced chicken and plantains.", price_ngn: 7500, image_url: "https://i.postimg.cc/GmkJdbL4/Jollof-rice-chicken-and-diced-plantains-).jpg", category: "Main Course", is_available: "Yes", sort_order: 1, vendor_id: "V_001" },
  { dish_id: "JAK_003", dish_name: "Peppered Fish", description: "Freshly grilled fish coated with a spicy African pepper sauce.", price_ngn: 13000, image_url: "https://i.postimg.cc/SKX4nQs8/fish-pepper-tilapia.jpg", category: "Main Course", is_available: "Yes", sort_order: 2, vendor_id: "V_001" },
  { dish_id: "JAK_004", dish_name: "Stew Jollof (Family Tray)", description: "Large tray of special Jollof rice with premium beef stew.", price_ngn: 50000, image_url: "https://i.postimg.cc/7ZMQHFwv/stew-jollof-wholesale.jpg", category: "Platters", is_available: "Yes", sort_order: 3, vendor_id: "V_001" },
  { dish_id: "JAK_006", dish_name: "Rich Egusi Soup", description: "Traditional melon seed soup with assorted meat and fish.", price_ngn: 2500, image_url: "https://i.postimg.cc/257wFrMx/Egusi-soup.jpg", category: "Soups", is_available: "Yes", sort_order: 4, vendor_id: "V_001" },
  { dish_id: "JAK_007", dish_name: "Okra Soup", description: "Slimy okra soup with fresh seafood and traditional spices.", price_ngn: 3000, image_url: "https://i.postimg.cc/vHn5tG6f/Okra-Soup.jpg", category: "Soups", is_available: "Yes", sort_order: 5, vendor_id: "V_001" },
  { dish_id: "JAK_008", dish_name: "White Soup (Ofe Nsala)", description: "Spicy yam-thickened soup, a signature Igbo delicacy.", price_ngn: 10500, image_url: "https://i.postimg.cc/xCqsPqHz/White-soup.jpg", category: "Soups", is_available: "Yes", sort_order: 6, vendor_id: "V_001" },
  { dish_id: "JAK_012", dish_name: "Moimoi Elewe", description: "Steamed bean pudding wrapped in local leaves for extra flavor.", price_ngn: 2000, image_url: "https://i.postimg.cc/tJZWfjSL/Moi-Moi-Elewe.jpg", category: "Sides", is_available: "Yes", sort_order: 7, vendor_id: "V_001" },
  { dish_id: "JAK_013", dish_name: "Fried Plantain", description: "Sweet, ripened plantains fried to golden perfection.", price_ngn: 1000, image_url: "https://i.postimg.cc/JzcJSKxh/Plantain-4-ja1w7o.webp", category: "Sides", is_available: "Yes", sort_order: 8, vendor_id: "V_001" }
];

// --- CORE DATA LOADING ---
export const loadAppData = async (): Promise<AppData> => {
  if (appData) return appData;
  try {


    // CORE QUERIES ONLY: properties + property_images
    const [
      { data: properties },
      { data: images }
    ] = await Promise.all([
      supabase.from('properties').select(`
        property_id,
        name,
        city,
        state,
        capacity,
        nightly_rate,
        hero_image_url,
        badges,
        is_featured,
        display_order,
        category,
        bedrooms,
        about_this_space,
        host_name,
        host_whatsapp,
        host_photo_url,
        booking_whatsapp_prefill,
        booking_minimum_stay,
        created_at,
        updated_at
      `),
      supabase.from('property_images').select('photo_id, property_id, image_url, caption, alt_text, sequence_order, room_category')
    ]);

    // Map property flat fields to the nested host and booking structures
    const mappedProperties = (properties || []).map((p: any) => ({
      ...p,
      host: {
        host_name: p.host_name || '',
        host_whatsapp: p.host_whatsapp || '',
        host_photo_url: p.host_photo_url || ''
      },
      booking: {
        whatsapp_prefill: p.booking_whatsapp_prefill || '',
        minimum_stay: p.booking_minimum_stay || 1
      }
    }));

    appData = {
      meta: { brand_name: "Umunna Stays", whatsapp_main_number: "2347048033575", default_city: "Asaba", currency_symbol: "₦" },
      properties: mappedProperties as unknown as Property[],
      photo_gallery: { photos: (images || []) as Photo[] },
      transport_services: [], 
      transport_vendors: [],  
      transport_vehicles: [], 
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

    // PHASE 1 ALIGNMENT: food_vendors/food_items tables do not exist in Supabase.
    // Mock data IS the production data source. No network calls needed.
    const foodVendorsData = foodEnabled ? mockFoodVendors : [];
    const foodItemsData = foodEnabled ? mockFoodItems : [];

    (appData as any).food_vendors = foodVendorsData;
    (appData as any).food_items = foodItemsData;

    console.log('properties loaded');
    console.log('property_images loaded');
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

const mockTransportData = {
  services: [
    {
      service_id: "TRS_001",
      vendor_id: "UMR_001",
      service_type: "car_hire" as const,
      service_title: "Car Hire (Self/Chauffeur)",
      description: "Comfortable city rides for errands and local movement.",
      starting_price_ngn: "Starting from 100000",
      pricing_unit: "per_day",
      lead_time_hours: 6,
      includes: "Driver|Fuel optional|AC",
      excludes: "Tolls|Parking",
      available_24_7: "Yes",
      is_active: "Yes",
      sort_order: 1
    },
    {
      service_id: "TRS_002",
      vendor_id: "UMR_001",
      service_type: "car_hire_escort" as const,
      service_title: "Car Hire + Escort Service",
      description: "Convoy support + professional escort for VIP movement.",
      starting_price_ngn: "Starting from 500000",
      pricing_unit: "per_day",
      lead_time_hours: 12,
      includes: "Lead car|Escort team|Route planning",
      excludes: "Hotel security",
      available_24_7: "Yes",
      is_active: "Yes",
      sort_order: 2
    },
    {
      service_id: "TRS_004",
      vendor_id: "UMR_001",
      service_type: "private_jet" as const,
      service_title: "Private Jet Itinerary",
      description: "Jet itinerary planning + ground handling support.",
      starting_price_ngn: "Premium",
      pricing_unit: "quote",
      lead_time_hours: 24,
      includes: "Itinerary|Coordination|Airport pickup option",
      excludes: "Jet ticket cost",
      available_24_7: "No",
      is_active: "Yes",
      sort_order: 4
    }
  ],
  vendors: [
    {
      vendor_id: "UMR_001",
      vendor_name: "Umunna Rides",
      service_types: ["car_hire", "car_hire_escort", "escort_only", "private_jet"],
      coverage_cities: ["Asaba", "Benin", "Lagos", "Portharcourt", "Uyo", "Abuja"],
      whatsapp_number: "+2347048033575",
      whatsapp_prefill: "Hello Umunna Stays, I need transport service: [service_type] in [city] on [date]. Pickup: [pickup_location].",
      logo_url: "https://i.postimg.cc/gk40BMZB/umunna-logo.png",
      primary_contact_name: "Concierge Lead",
      is_active: true,
      sort_order: 1
    }
  ],
  vehicles: [
    {
      vehicle_id: "UMRV_001",
      vendor_id: "UMR_001",
      vehicle_type: "SUV",
      make_model: "Toyota Prado",
      category: "SUV",
      seats: 7,
      features: "Leather seats|AC|Airport-ready",
      daily_rate_ngn: "From 320000",
      image_url: "https://i.postimg.cc/FRsy8Drz/Save_Inta_com_488621108_18021914246690295_5868630574891386945_n.jpg",
      is_available: "Yes",
      sort_order: 1
    },
    {
      vehicle_id: "UMRV_002",
      vendor_id: "UMR_001",
      vehicle_type: "SEDAN",
      make_model: "Toyota Camry",
      category: "Sedan",
      seats: 4,
      features: "Comfortable|AC|City-ready",
      daily_rate_ngn: "From 150000",
      image_url: "https://res.cloudinary.com/dgxsq0kjh/image/upload/v1738377554/luxury_suv.jpg",
      is_available: "Yes",
      sort_order: 2
    }
  ]
};

export const loadTransportData = async (): Promise<{
  services: TransportService[];
  vendors: TransportVendor[];
  vehicles: TransportVehicle[];
}> => {
  // PHASE 1 ALIGNMENT: transport_services/transport_vendors/transport_vehicles
  // tables do not exist in Supabase. Mock data IS the production data source.
  // No network calls needed — eliminates 3 × 404 requests per page load.

  if (!transportEnabled) {
    return mockTransportData;
  }

  if (cachedTransportData && isCacheValid()) {
    return cachedTransportData;
  }

  cachedTransportData = mockTransportData;
  lastCacheTime = Date.now();

  // Backfill main appData so legacy getters still work
  if (appData) {
    appData.transport_services = cachedTransportData.services;
    appData.transport_vendors = cachedTransportData.vendors;
    appData.transport_vehicles = cachedTransportData.vehicles;
  }

  return cachedTransportData;
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
  if (!transportEnabled) {
    console.log('🚚 Transport module disabled — skipping Supabase calls');
    return;
  }

  // 1. Supabase Insert (Primary)
  try {
    const data = await createTransportLead('Frontend', {
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

    if (isDevelopment()) console.log('✅ Lead saved to Supabase');

  } catch (sbError) {
    console.error('⚠️ Supabase insert failed', sbError);
    // PH1 LOCK: LocalStorage fallback removed to prevent silent dependency.
    throw sbError;
  }
};

export const exportLeadsToCSV = () => {
  // PH1 LOCK: Export from LocalStorage is disabled.
  // Requires Phase 2 Supabase Dashboard or authenticated endpoint.
  console.warn("exportLeadsToCSV is disabled in Phase 1 lock.");
  return;
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
  if (!foodEnabled) return [];
  const source = data || appData;
  if (source && (source as any).food_vendors && (source as any).food_vendors.length > 0) {
    return (source as any).food_vendors;
  }
  return mockFoodVendors;
};

export const getFoodVendorById = (vendorId: string): FoodVendor | undefined => {
  if (!foodEnabled) return undefined;
  return getFoodVendors().find(v => v.vendor_id === vendorId);
};

export const getDishesByVendor = (vendorId: string): Dish[] => {
  if (!foodEnabled) return [];
  if (appData && (appData as any).food_items && (appData as any).food_items.length > 0) {
    return (appData as any).food_items;
  }
  return mockFoodItems;
};

export const getJudithMenu = (): Dish[] => {
  if (!foodEnabled) return [];
  if (appData && (appData as any).food_items && (appData as any).food_items.length > 0) {
    return (appData as any).food_items;
  }
  return mockFoodItems;
};

export const RAW_DATA = { whatsapp_main_number: "2347048033575" };

export const getStoredLeads = () => {
  // PH1 LOCK: Disabling local storage getter
  return [];
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