const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Space People",
      description:
        "Consulta cuántas personas hay actualmente en órbita, quiénes están arriba y la ubicación de la ISS.",
      url: "https://spacepeople.elelier.com/",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web Browser",
      isAccessibleForFree: true,
      inLanguage: "es-MX",
      author: {
        "@type": "Person",
        name: "elelier",
        url: "https://www.elelier.com",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué cuenta como una persona en el espacio?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Actualmente contamos personas en órbita terrestre en estaciones o misiones orbitales activas. Los vuelos suborbitales quedan fuera del conteo.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cada cuánto se actualiza?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "La app consulta periódicamente sus fuentes y actualiza el conteo cuando hay datos nuevos.",
          },
        },
        {
          "@type": "Question",
          name: "¿Por qué puede cambiar el número?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El número cambia principalmente por lanzamientos, retornos de tripulaciones y cambios de misión.",
          },
        },
      ],
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
