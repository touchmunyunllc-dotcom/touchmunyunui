import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms and Conditions - TouchMunyun"
        description="Read TouchMunyun's terms and conditions. Understand the rules and guidelines for using our platform and purchasing our handcrafted products."
        keywords="terms and conditions, terms of service, user agreement, TouchMunyun"
      />
      <StructuredData type="WebSite" />
      <Layout>
        <div className="bg-primary py-20 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-30" style={{
            background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)'
          }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Terms and Conditions
            </h1>
            <p className="text-xl text-foreground/80">
              Please read these terms carefully before using our services
            </p>
          </div>
        </div>

        <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-8 text-foreground/80">
                <div>
                  <p className="text-sm text-foreground/70 mb-2">
                    Touch Munyun LLC
                  </p>
                  <p className="text-sm text-foreground/70 mb-6">
                    Effective Date: February 28, 2026
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Overview</h2>
                  <p className="leading-relaxed mb-4">
                    Welcome to Touch Munyun. By accessing our website and purchasing from us, you agree to be bound by the following Terms and Conditions. Please read them carefully.
                  </p>
                  <p className="leading-relaxed">
                    We reserve the right to update or change these terms at any time without prior notice.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Product</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All product descriptions, images, and prices are subject to change without notice.</li>
                    <li>We strive to display colors and product details accurately, but we cannot guarantee your device screen will reflect exact colors.</li>
                    <li>Availability is not guaranteed. Items may sell out at any time.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Pricing &amp; Payments</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All prices are listed in USD.</li>
                    <li>We reserve the right to modify pricing at any time.</li>
                    <li>Payment must be received in full before orders are processed or shipped.</li>
                    <li>We accept payments through Stripe, including all major credit and debit cards (Visa, Mastercard, American Express, Discover), Apple Pay, and Google Pay.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Shipping Policy</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Orders are processed within 3–5 business days.</li>
                    <li>Shipping times vary depending on location.</li>
                    <li>Once your package is shipped, we are not responsible for carrier delays, lost, or stolen packages.</li>
                    <li>Customers are responsible for providing accurate shipping information.</li>
                    <li>If a package is returned due to incorrect address, additional shipping fees may apply.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Returns &amp; Exchanges Policy</h2>
                  <p className="leading-relaxed mb-4">
                    Due to the nature of wristbands and apparel:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All sales are final unless the item arrives damaged or defective.</li>
                    <li>Claims for damaged items must be submitted within 72 hours of delivery with photo proof.</li>
                    <li>Items must be unworn, unwashed, and in original packaging for exchange consideration.</li>
                    <li>Customers are responsible for return shipping costs unless the error is on our part.</li>
                    <li>We reserve the right to refuse returns that do not meet our policy.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cancellations</h2>
                  <p className="leading-relaxed">
                    Orders may only be canceled within 2 hours of purchase. Once an order has been processed or shipped, it cannot be canceled.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
                  <p className="leading-relaxed">
                    All content on this website—including logos, designs, product images, and written content—is the property of Touch Munyun LLC and may not be copied, reproduced, or distributed without permission.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
                  <p className="leading-relaxed">
                    Touch Munyun LLC shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our products or website.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Privacy Policy</h2>
                  <p className="leading-relaxed mb-4">
                    We respect your privacy. Any personal information collected (name, email, address, payment details) is used solely to process orders and improve your shopping experience.
                  </p>
                  <p className="leading-relaxed">
                    We do not sell or share customer information with third parties, except as required to fulfill orders (e.g., shipping providers).
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Governing Law</h2>
                  <p className="leading-relaxed">
                    These Terms shall be governed in accordance with the laws of the State of Louisiana.
                  </p>
                </div>

                <div className="border-t border-foreground/20 pt-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Summary</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All sales are final.</li>
                    <li>Exchanges only for defective or damaged items within 72 hours of delivery with proof.</li>
                    <li>Shipping fees are non-refundable.</li>
                  </ul>
                </div>

                <div>
                  <p className="leading-relaxed">
                    If you have any questions about these Terms and Conditions, please contact us at{' '}
                    <a href="mailto:TouchMunyunLLC@gmail.com" className="text-button hover:text-button-200">
                      TouchMunyunLLC@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

