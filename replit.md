# Umunna Stays

## Overview

Umunna Stays is a premium, concierge-driven hospitality marketplace for Nigeria. The platform offers curated short-stay apartments, transport services, food ordering, and lifestyle concierge experiences. It functions as a mobile-first web application where users can browse properties, view details, and contact hosts directly via WhatsApp for bookings.

The application is a single-page React application with client-side routing using hash-based navigation. All property and service data is loaded from static JSON files, making this a content-driven platform without a traditional backend database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 19** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Tailwind CSS** loaded via CDN for utility-first styling
- Custom fonts: Montserrat for headings, Inter for body text

### Routing Pattern
Hash-based client-side routing implemented in `App.tsx`:
- `#home` - Landing page
- `#stays` - Property listings
- `#stays/{property_id}` - Individual property detail
- `#services` - Lifestyle concierge services
- `#food` - Food ordering (Judith Amazing Kitchen)
- `#transport` - Vehicle hire and transport services
- `#host` - Property host registration

### Data Management
- **Static JSON files** (`umunna_properties_20.json`) serve as the data source
- `dataStore.ts` provides a centralized data access layer with helper functions
- Data is loaded once on app initialization and cached in memory
- No backend API or database - all data is bundled with the application

### Key Data Entities
- **Properties**: Short-stay apartments with photos, amenities, pricing
- **Photo Gallery**: Property images with sequencing and categorization
- **Transport Services**: Car hire, escort services, private jets
- **Transport Vendors**: Service providers with coverage areas
- **Transport Vehicles**: Fleet inventory with specifications
- **Food Vendors/Menu**: Restaurant partners and dish catalogs
- **Services Catalog**: Lifestyle concierge offerings

### Component Architecture
- **Pages**: Route-level components (`Home`, `Stays`, `PropertyDetail`, etc.)
- **Components**: Reusable UI elements (`PropertyCard`, `BookingWidget`, `Header`, etc.)
- **Carousels**: Custom touch-enabled image galleries with drag support

### Booking Flow
The platform uses WhatsApp as the primary booking channel:
1. User browses properties/services
2. Pre-filled WhatsApp messages are generated with booking details
3. User clicks to open WhatsApp and send inquiry
4. Concierge team handles booking offline

## External Dependencies

### Third-Party Services
- **WhatsApp Business API**: All bookings and inquiries route through WhatsApp using `wa.me` links with pre-filled messages
- **PostImg CDN**: Property images and branding assets hosted externally
- **Google Fonts**: Montserrat and Inter font families

### NPM Packages
- `react` / `react-dom`: UI framework
- `lucide-react`: Icon library
- `vite`: Build tooling
- `@vitejs/plugin-react`: React plugin for Vite
- `typescript`: Type checking

### Environment Variables
- `GEMINI_API_KEY`: Referenced in Vite config but not actively used in current codebase (likely for future AI features)

### External Assets
- Logo: `https://i.postimg.cc/gk40BMZB/umunna-logo.png`
- Property photos: Various PostImg URLs defined in JSON data
- Background pattern: Dreamstime stock image for Adinkra pattern