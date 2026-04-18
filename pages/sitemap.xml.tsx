import { GetServerSideProps } from 'next';

interface ProductData {
  id: string;
  name: string;
  imageUrl: string;
  updatedAt: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemap(products: ProductData[] = []) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com';
  const currentDate = new Date().toISOString();

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/new-arrivals', priority: '0.8', changefreq: 'weekly' },
    { url: '/best-sellers', priority: '0.8', changefreq: 'weekly' },
    { url: '/collections', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/help', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  ];

  const staticEntries = staticPages
    .map(
      (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  const productEntries = products
    .map(
      (product) => `  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${product.updatedAt || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${
      product.imageUrl
        ? `
    <image:image>
      <image:loc>${escapeXml(product.imageUrl)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>`
        : ''
    }
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticEntries}
${productEntries}
</urlset>`;
}

export default function Sitemap() {
  // This will be handled by getServerSideProps
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let products: ProductData[] = [];
  
  try {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://touchmunyunapi.onrender.com/api';
    const trimmedApiUrl = rawApiUrl.replace(/\/+$/, '');
    const apiUrl = trimmedApiUrl.endsWith('/api') ? trimmedApiUrl : `${trimmedApiUrl}/api`;
    const response = await fetch(`${apiUrl}/products?pageSize=500`);
    if (response.ok) {
      const data = await response.json();
      products = (data.products || data.Products || data || []).map((p: any) => ({
        id: p.id || p.Id,
        name: p.name || p.Name || '',
        imageUrl: p.imageUrl || p.ImageUrl || '',
        updatedAt: p.updatedAt || p.UpdatedAt || new Date().toISOString(),
      }));
    }
  } catch (error) {
    // Fallback to static-only sitemap if API is unavailable
    console.error('Sitemap: Failed to fetch products', error);
  }

  const sitemap = generateSitemap(products);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

