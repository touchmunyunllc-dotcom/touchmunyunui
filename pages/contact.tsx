import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { notificationService } from '@/services/notificationService';
import apiClient from '@/services/apiClient';
import { useRecaptcha } from '@/utils/useRecaptcha';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get reCAPTCHA token
      const captchaToken = await executeRecaptcha('contact');

      const response = await apiClient.post('/contact', { ...formData, captchaToken });
      notificationService.success(response.data.message || 'Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to send message. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <SEO
        title="Contact Us - TouchMunyun | Get in Touch"
        description="Contact TouchMunyun for support, inquiries, or assistance. We're here to help with your questions about our handcrafted fashion and premium sportswear."
        keywords="contact TouchMunyun, customer support, help, inquiries, TouchMunyun support"
      />
      <StructuredData
        type="Organization"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'TouchMunyun',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-504-248-6331',
            contactType: 'Customer Service',
            email: 'TouchMunyunLLC@gmail.com',
            areaServed: 'US',
            availableLanguage: 'English',
          },
        }}
      />
      <Layout>
      <div className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-foreground/80">
            We&apos;d love to hear from you. Get in touch with our team.
          </p>
        </div>
      </div>

      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
              <p className="text-foreground/80 mb-8">
                Have a question or need assistance? We&apos;re here to help. Reach out to us through
                any of the following channels.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-button/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-button/30 shadow-glass">
                    <svg
                      className="w-6 h-6 text-button"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a
                      href="mailto:TouchMunyunLLC@gmail.com"
                      className="text-button hover:text-button-200"
                    >
                      TouchMunyunLLC@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-button/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-button/30 shadow-glass">
                    <svg
                      className="w-6 h-6 text-button"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <a
                      href="tel:+15042486331"
                      className="text-button hover:text-button-200"
                    >
                      +1 (504) 248-6331
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-button/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-button/30 shadow-glass">
                    <svg
                      className="w-6 h-6 text-button"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-foreground/80">
                      New Orleans, Louisiana<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-button/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-button/30 shadow-glass">
                    <svg
                      className="w-6 h-6 text-button"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                    <p className="text-foreground/80">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 4:00 PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/80 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/80 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/80 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="product">Product Question</option>
                    <option value="account">Account Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-800/50 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 bg-gray-900/60 backdrop-blur-sm text-gray-300 placeholder-gray-500 resize-none shadow-glass"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-button text-button-text font-semibold py-3 px-6 rounded-xl hover:bg-button-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
}

