import { Property } from '../../../types';

export function buildPropertySchema(property: Property, domain: string = "https://www.umunnastays.com.ng") {
  const propertyUrl = `${domain}/stays/${property.property_id}`;
  const price = property.pricing?.base_rate || 0;
  
  return {
    "@context": "https://schema.org",
    "@type": ["Accommodation", "Product"],
    "name": property.name,
    "description": property.about_this_space,
    "image": property.photos?.[0] || `${domain}/logo.png`,
    "url": propertyUrl,
    "numberOfRooms": property.bedrooms,
    "bed": property.bedrooms,
    "occupancy": {
      "@type": "QuantitativeValue",
      "value": property.capacity
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressRegion": property.state,
      "addressCountry": "NG"
    },
    "offers": {
      "@type": "Offer",
      "url": propertyUrl,
      "priceCurrency": "NGN",
      "price": price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "LodgingBusiness",
        "name": "Umunna Stays",
        "url": domain
      }
    },
    "brand": {
      "@type": "LodgingBusiness",
      "name": "Umunna Stays"
    }
  };
}
