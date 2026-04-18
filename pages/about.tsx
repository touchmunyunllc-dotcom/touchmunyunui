import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import Link from 'next/link';

export default function About() {
  return (
    <>
      <SEO
        title="About Us - Touch Munyun | Our Story"
        description="Meet Warren Newman III, founder of Touch Munyun — a sports and lifestyle brand born in New Orleans for athletes and everyday grinders who are putting in the work."
        keywords="Touch Munyun, Warren Newman III, New Orleans, sports brand, lifestyle brand, athlete accessories, apparel"
      />
      <StructuredData type="Organization" />
      <Layout>
      <div className="bg-primary py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="block text-foreground">
              Our Story
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80">
            Born in New Orleans. Built on Hustle.
          </p>
        </div>
      </div>

      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            <div className="space-y-8 text-foreground/80">
              <p className="text-xl leading-relaxed">
                My name is <span className="text-foreground font-semibold">Warren Newman III</span>, founder of Touch Munyun, proudly based out of <span className="text-foreground font-semibold">New Orleans, Louisiana</span>.
              </p>

              <p className="leading-relaxed">
                As a young entrepreneur and former football athlete who competed in various football leagues, the game shaped my mindset, discipline, and grind. From a kid from NOLA, I had a love for the details — wristbands, headbands, towels, arm bands. The accessories that made you feel confident, prepared, and locked in before stepping on the field.
              </p>

              <div className="border-l-4 border-red-600 pl-6 my-10">
                <p className="text-xl text-foreground font-medium italic leading-relaxed">
                  Those details meant something. They represented focus. They represented work. They represented hunger.
                </p>
              </div>

              <p className="leading-relaxed">
                That passion turned into <span className="text-foreground font-semibold">Touch Munyun</span> — a sports and lifestyle brand created for athletes and everyday grinders who are putting in the work and truly &ldquo;Touching Munyun.&rdquo;
              </p>

              <p className="leading-relaxed">
                We offer performance accessories and apparel for men and women, including shirts, pants, hoodies, socks, wristbands, headbands, arm bands, and towels. Every piece represents hustle, discipline, and the mindset of someone who refuses to settle.
              </p>

              <div className="bg-contrast/50 border border-foreground/10 rounded-2xl p-8 my-10 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground leading-snug">
                  Touch Munyun isn&apos;t just clothing.
                </p>
                <p className="text-xl text-red-500 font-semibold mt-4 tracking-wide">
                  It&apos;s culture. It&apos;s preparation. It&apos;s pressure. It&apos;s purpose.
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                If you&apos;re working hard and Touch(ing) Munyun — this brand is for you.
              </p>

              <div className="mt-12 pt-8 border-t border-foreground/10">
                <p className="text-foreground font-semibold text-lg">Warren Newman III</p>
                <p className="text-foreground/60">New Orleans, LA</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-button-text bg-button rounded-xl hover:bg-button-200 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Our Collections
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
}

