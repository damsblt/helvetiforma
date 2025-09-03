export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HelvetiForma",
    "url": "https://helvetiforma.ch",
    "logo": "https://helvetiforma.ch/favicon.svg",
    "description": "Plateforme de formations professionnelles en Suisse",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CH",
      "addressLocality": "Suisse"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@helvetiforma.ch"
    },
    "sameAs": [
      "https://helvetiforma.ch"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Formations professionnelles",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "Formations continues",
            "description": "Formations professionnelles pour entreprises et particuliers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "E-learning",
            "description": "Plateforme d'apprentissage en ligne"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
