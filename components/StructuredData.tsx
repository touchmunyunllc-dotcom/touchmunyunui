import { useRouter } from 'next/router';

interface StructuredDataProps {
  type?: 'Organization' | 'WebSite' | 'Product' | 'BreadcrumbList';
  data?: any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({
  type = 'Organization',
  data,
}) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com';

  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Touch Munyun',
          url: siteUrl,
          logo: `${siteUrl}/icons/icon-512x512.png`,
          description:
            'Touch Munyun is a sports and lifestyle brand created for athletes and everyday grinders. Performance accessories and apparel — wristbands, headbands, hoodies, shirts, and more. Based in New Orleans, LA.',
          founder: {
            '@type': 'Person',
            name: 'Warren Newman III',
          },
          foundingLocation: {
            '@type': 'Place',
            name: 'New Orleans, Louisiana',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'TouchMunyunLLC@gmail.com',
            areaServed: 'US',
            availableLanguage: 'English',
          },
          sameAs: [
            'https://www.instagram.com/_touchmunyun',
            'https://twitter.com/TouchmunyunLLC',
          ],
        };

      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Touch Munyun',
          url: siteUrl,
          description:
            'Touch Munyun is a sports and lifestyle brand for athletes and grinders. Performance accessories and apparel based in New Orleans, LA.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/products?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'Product':
        return data || {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Product Name',
          description: 'Product Description',
          image: `${siteUrl}/images/product.jpg`,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: '0.00',
            availability: 'https://schema.org/InStock',
          },
        };

      case 'BreadcrumbList':
        return data || {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: siteUrl,
            },
          ],
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

