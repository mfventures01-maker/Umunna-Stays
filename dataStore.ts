import { AppData, TransportService, TransportVendor, FoodVendor, Dish, TransportVehicle, Property, Photo } from './types';

let appData: AppData | null = null;

export const loadAppData = async (): Promise<AppData> => {
  if (appData) return appData;
  try {
    const response = await fetch('./umunna_properties_20.json');
    if (!response.ok) throw new Error('Failed to load data');
    appData = await response.json();
    return appData!;
  } catch (error) {
    console.error('Error loading Umunna data:', error);
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

export const getPropertyById = (data: AppData, id: string): Property | undefined => {
  return data.properties.find(p => p.property_id === id);
};

export const getPhotosByPropertyId = (data: AppData, propertyId: string): Photo[] => {
  const property = getPropertyById(data, propertyId);
  // Filter photos explicitly for the given propertyId
  const galleryPhotos = (data.photo_gallery?.photos || [])
    .filter(p => p.property_id === propertyId)
    .sort((a, b) => a.sequence_order - b.sequence_order);
  
  // Return gallery photos if they exist
  if (galleryPhotos.length > 0) {
    return galleryPhotos;
  }
  
  // Fallback to the hero image if no gallery photos found
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
  return (data.transport_services || [])
    .filter(s => s.is_active === "Yes")
    .sort((a, b) => a.sort_order - b.sort_order);
};

export const buildTransportWhatsAppUrl = (
  vendor: TransportVendor,
  context: { service_type: string; city: string }
): string => {
  const cleanNumber = vendor.whatsapp_number.replace(/\D/g, '');
  const text = `Hello Umunna Rides, I'm interested in the ${context.service_type} service in ${context.city}. Please provide details and availability.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
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
  return (data.transport_vendors || [])
    .filter(v => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
};

export const getVehicleFleet = (data: AppData): TransportVehicle[] => {
  return (data.transport_vehicles || [])
    .sort((a, b) => a.sort_order - b.sort_order);
};

export const extractVehiclePrice = (priceStr: string): string => {
  if (!priceStr || priceStr.toLowerCase() === 'premium') return 'Premium';
  const match = priceStr.match(/\d+/);
  return match ? `₦${parseInt(match[0]).toLocaleString()}/day` : priceStr;
};

export const splitVehicleImages = (imageUrl: string): string[] => {
  if (!imageUrl) return [];
  return imageUrl.split(/[\t\s,]+/).filter(url => url.startsWith('http'));
};

export const getBestServiceForVehicle = (vehicle: TransportVehicle): string => {
  const cat = vehicle.category.toLowerCase();
  if (cat === 'private jet') return 'TRS_004';
  if (cat === 'escort') return 'TRS_002';
  if (cat === 'van') return 'TRS_001';
  return 'TRS_001';
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
  if (typeof priceStr === 'number') return priceStr.toLocaleString();
  const match = priceStr.match(/\d+/);
  return match ? parseInt(match[0]).toLocaleString() : priceStr;
};

export const getActiveTransportVendorsByCity = (data: AppData, city: string): TransportVendor[] => {
  const normalizedCity = city.toLowerCase().trim();
  return getTransportVendors(data).filter(v => 
    v.coverage_cities.some(c => c.toLowerCase().trim() === normalizedCity)
  );
};

export const getFoodVendors = (): FoodVendor[] => [
  {
    vendor_id: "V_001",
    name: "Judith Amazing Kitchen",
    description: "Authentic local delicacies delivered to your stay across Asaba, Benin, and Awka.",
    menu_url: "https://drive.google.com/drive/folders/1a63MYdjZ7XP1JsFqVuJfldByca18OQ0D?usp=drive_link"
  }
];

export const getJudithMenu = (): Dish[] => {
  return [
    { dish_id: "JAK_002", dish_name: "Jollof Rice & Diced Chicken", description: "Rich Jollof rice served with spicy diced chicken and plantains.", price_ngn: 7500, image_url: "https://i.postimg.cc/GmkJdbL4/Jollof-rice-chicken-and-diced-plantains-).jpg", category: "Main Course", is_available: "Yes", sort_order: 1 },
    { dish_id: "JAK_003", dish_name: "Peppered Fish", description: "Freshly grilled fish coated with a spicy African pepper sauce.", price_ngn: 13000, image_url: "https://i.postimg.cc/SKX4nQs8/fish-pepper-tilapia.jpg", category: "Main Course", is_available: "Yes", sort_order: 2 },
    { dish_id: "JAK_004", dish_name: "Stew Jollof (Family Tray)", description: "Large tray of special Jollof rice with premium beef stew.", price_ngn: 50000, image_url: "https://i.postimg.cc/7ZMQHFwv/stew-jollof-wholesale.jpg", category: "Platters", is_available: "Yes", sort_order: 3 },
    { dish_id: "JAK_006", dish_name: "Rich Egusi Soup", description: "Traditional melon seed soup with assorted meat and fish.", price_ngn: 2500, image_url: "https://i.postimg.cc/257wFrMx/Egusi-soup.jpg", category: "Soups", is_available: "Yes", sort_order: 4 },
    { dish_id: "JAK_007", dish_name: "Okra Soup", description: "Slimy okra soup with fresh seafood and traditional spices.", price_ngn: 3000, image_url: "https://i.postimg.cc/vHn5tG6f/Okra-Soup.jpg", category: "Soups", is_available: "Yes", sort_order: 5 },
    { dish_id: "JAK_008", dish_name: "White Soup (Ofe Nsala)", description: "Spicy yam-thickened soup, a signature Igbo delicacy.", price_ngn: 10500, image_url: "https://i.postimg.cc/xCqsPqHz/White-soup.jpg", category: "Soups", is_available: "Yes", sort_order: 6 },
    { dish_id: "JAK_012", dish_name: "Moimoi Elewe", description: "Steamed bean pudding wrapped in local leaves for extra flavor.", price_ngn: 2000, image_url: "https://i.postimg.cc/tJZWfjSL/Moi-Moi-Elewe.jpg", category: "Sides", is_available: "Yes", sort_order: 7 },
    { dish_id: "JAK_013", dish_name: "Fried Plantain", description: "Sweet, ripened plantains fried to golden perfection.", price_ngn: 1000, image_url: "https://i.postimg.cc/JzcJSKxh/Plantain-4-ja1w7o.webp", category: "Sides", is_available: "Yes", sort_order: 8 }
  ];
};

export const RAW_DATA = { whatsapp_main_number: "2347048033575" };