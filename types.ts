
export interface Photo {
  photo_id: string;
  property_id?: string;
  sequence_order: number;
  image_url: string;
  caption: string;
  alt_text: string;
  room_category: string;
  video_url?: string | null;
}

export interface Amenity {
  id: string;
  name: string;
  category: string;
  sort_rank: number;
  icon_name: string;
}

export interface PropertyAmenity {
  property_id: string;
  amenity_id: string;
  is_verified: boolean;
  amenity: Amenity;
}

export interface Property {
  property_id: string;
  name: string;
  city: string;
  state: string;
  capacity: string;
  nightly_rate: number;
  hero_image_url: string;
  badges: string[];
  is_featured: boolean;
  display_order: number;
  category: string;
  bedrooms: number;
  about_this_space: string;
  host: {
    host_name: string;
    host_whatsapp: string;
    host_photo_url: string;
  };
  booking: {
    whatsapp_prefill: string;
    minimum_stay: number;
  };
}

export interface TransportService {
  service_id: string;
  vendor_id: string;
  service_type: 'car_hire' | 'car_hire_escort' | 'escort_only' | 'private_jet';
  service_title: string;
  description: string;
  starting_price_ngn: string | number;
  pricing_unit: string;
  lead_time_hours: number;
  includes: string;
  excludes: string;
  available_24_7: string;
  is_active: string;
  sort_order: number;
}

export interface TransportVendor {
  vendor_id: string;
  vendor_name: string;
  service_types: string[];
  coverage_cities: string[];
  whatsapp_number: string;
  whatsapp_prefill: string;
  logo_url: string;
  primary_contact_name?: string;
  is_active: boolean;
  sort_order: number;
  notes?: string;
}

export interface TransportVehicle {
  vehicle_id: string;
  vendor_id: string;
  vehicle_type: string;
  make_model: string;
  category: 'SUV' | 'Sedan' | 'Van' | 'Escort' | 'private jet' | string;
  seats: number;
  features: string; // Pipe-separated
  daily_rate_ngn: string; // "From 320000" or "Premium"
  image_url: string; // Can be space/tab separated for multiple images
  is_available: string; // "Yes" or empty/null
  sort_order: number;
}

export interface VehicleImageGallery {
  images: string[];
}

export interface FoodVendor {
  vendor_id: string;
  name: string;
  description: string;
  menu_url: string;
}

export interface Dish {
  dish_id: string;
  dish_name: string;
  description: string;
  image_url: string;
  price_ngn: number;
  is_available: string;
  category: string;
  sort_order: number;
}

export interface TransportLead {
  lead_id: string;
  created_at: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  city: string;
  property_id?: string;
  service_type: string;
  service_id?: string;
  vendor_id: string;
  pickup_location: string;
  dropoff_location?: string;
  date_needed: string;
  time_needed?: string;
  passengers?: number | string;
  budget_ngn?: number | string;
  notes?: string;
  status: "new" | "contacted" | "quoted" | "booked" | "closed";
  assigned_to: string;
  whatsapp_click_url: string;
}

export interface AppData {
  meta: {
    brand_name: string;
    whatsapp_main_number: string;
    default_city: string;
    currency_symbol: string;
    leads_endpoint_url?: string;
  };
  properties: Property[];
  photo_gallery: {
    photos: Photo[];
  };
  city_summary: any[];
  services_catalog: any[];
  transport_services: TransportService[];
  transport_vendors: TransportVendor[];
  transport_vehicles: TransportVehicle[];
  food_vendors?: FoodVendor[];
  food_items?: Dish[];
  amenities_master?: Amenity[];
  policies_global: any;
}

export type View = 'home' | 'stays' | 'services' | 'host' | 'property-detail' | 'food' | 'transport' | 'profile' | 'favorites';
