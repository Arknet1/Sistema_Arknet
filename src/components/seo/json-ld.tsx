import React from 'react'

export interface OrganizationSchemaProps {
  url?: string
}

export function OrganizationJsonLd({ url = 'https://www.arknet.co.ao' }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}/#organization`,
    name: 'ARKNET — Soluções de Telecomunicações e TI',
    alternateName: 'ARKNET Angola',
    url: url,
    logo: {
      '@type': 'ImageObject',
      url: `${url}/icon18.png`,
      caption: 'ARKNET Logo',
    },
    image: `${url}/icon18.png`,
    description:
      'Empresa líder em Telecomunicações, Internet Dedicada Empresarial, Cibersegurança, Computação em Nuvem, Cabeamento Estruturado e Infraestrutura de TI em Angola.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Directa do Kero, Casa Nº32 R/C, Cidade do Kilamba',
      addressLocality: 'Luanda',
      addressRegion: 'Luanda',
      addressCountry: 'AO',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+244935208449',
        contactType: 'customer support',
        areaServed: 'AO',
        availableLanguage: ['Portuguese', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+244935208449',
        contactType: 'sales',
        areaServed: 'AO',
        availableLanguage: ['Portuguese'],
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/arknet',
      'https://www.facebook.com/arknet',
      'https://www.instagram.com/arknet',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function LocalBusinessJsonLd({ url = 'https://www.arknet.co.ao' }: { url?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#localbusiness`,
    name: 'ARKNET Angola',
    image: `${url}/icon18.png`,
    telephone: '+244935208449',
    email: 'info@arknet.co.ao',
    url: url,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Directa do Kero, Casa Nº32 R/C, Cidade do Kilamba',
      addressLocality: 'Luanda',
      addressRegion: 'Luanda',
      addressCountry: 'AO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -8.83833,
      longitude: 13.23444,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:30',
        closes: '13:00',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ServiceJsonLd({
  name,
  description,
  url,
  providerName = 'ARKNET Angola',
  providerUrl = 'https://www.arknet.co.ao',
}: {
  name: string
  description: string
  url: string
  providerName?: string
  providerUrl?: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: name,
    description: description,
    url: url,
    areaServed: {
      '@type': 'Country',
      name: 'Angola',
    },
    provider: {
      '@type': 'Organization',
      name: providerName,
      url: providerUrl,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs || faqs.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
