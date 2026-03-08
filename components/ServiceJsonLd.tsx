import React from 'react';

interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  providerName?: string;
  image?: string;
}

export default function ServiceJsonLd({ 
  name, 
  description, 
  url, 
  providerName = "ADWire Agency",
  image = "https://adwire.com.hk/og-image.jpg"
}: ServiceJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": providerName,
      "url": "https://adwire.com.hk"
    },
    "url": url,
    "image": image,
    "areaServed": {
      "@type": "Country",
      "name": "Hong Kong"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${name} Services`,
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": `${name} Consultation`
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
