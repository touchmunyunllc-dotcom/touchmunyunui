import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

const defaultTitle = 'Touch Munyun - Sports & Lifestyle Brand | Performance Accessories & Apparel';
const defaultDescription =
  'Touch Munyun is a sports and lifestyle brand for athletes and grinders. Shop performance accessories and apparel — wristbands, headbands, hoodies, shirts, and more. Based in New Orleans, LA.';
const defaultKeywords =
  'Touch Munyun, sports brand, lifestyle brand, athletic accessories, wristbands, headbands, arm bands, towels, hoodies, sportswear, New Orleans, performance apparel';
const defaultImage = '/icons/icon-512x512.png';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com';

export const SEO: React.FC<SEOProps> = ({
  title = defaultTitle,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = defaultImage,
  type = 'website',
  noindex = false,
  nofollow = false,
  canonical,
}) => {
  const router = useRouter();
  const currentUrl = canonical || `${siteUrl}${router.asPath}`;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Touch Munyun LLC" />
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Touch Munyun" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@TouchmunyunLLC" />
      <meta name="twitter:site" content="@TouchmunyunLLC" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
    </Head>
  );
};

