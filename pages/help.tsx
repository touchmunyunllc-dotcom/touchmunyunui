import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import Link from 'next/link';

const faqs = [
    {
      category: 'Shopping',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Browse our products, add items to your cart, then go to checkout. You need to sign in or create an account to complete your order and save addresses. Guests can browse and build a cart in this browser; paid checkout uses your account.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and Google Pay — all processed securely through Stripe.',
        },
        {
          q: 'Can I modify or cancel my order?',
          a: 'You can modify or cancel your order within 24 hours of placement. After that, please contact our support team for assistance.',
        },
        {
          q: 'How do I track my order?',
          a: 'Once your order ships, you will receive a tracking number via email. You can also track your order in your account dashboard.',
        },
      ],
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          q: 'What are your shipping options?',
          a: 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Shipping costs are calculated at checkout.',
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we ship within the United States. International shipping options will be available soon.',
        },
        {
          q: 'What if my order is damaged or incorrect?',
          a: 'Please contact us immediately with photos of the damaged item or incorrect order. We will arrange a replacement or refund.',
        },
      ],
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy for unused items in original packaging. Items must be in their original condition.',
        },
        {
          q: 'How do I return an item?',
          a: 'Log into your account, go to Orders, select the order you want to return, and follow the return instructions. You will receive a return label.',
        },
        {
          q: 'When will I receive my refund?',
          a: 'Refunds are processed within 5-7 business days after we receive your returned item. The refund will appear in your original payment method.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Sign Up" in the navigation menu, fill in your details, and verify your email address. Creating an account allows you to track orders and save addresses.',
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email.',
        },
        {
          q: 'How do I update my account information?',
          a: 'Log into your account and go to your profile settings. You can update your name, email, password, and shipping addresses.',
        },
      ],
    },
  ];

export default function HelpCenter() {
  return (
    <>
      <SEO
        title="Help Center - TouchMunyun | FAQs & Support"
        description="Find answers to common questions about shopping, shipping, returns, and account management at TouchMunyun. Get the support you need."
        keywords="help center, FAQs, support, TouchMunyun help, customer service, frequently asked questions"
      />
      <StructuredData
        type="WebSite"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.flatMap((section) =>
            section.questions.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            }))
          ),
        }}
      />
      <Layout>
      <div className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-xl text-foreground/80">
            Find answers to common questions and get the support you need
          </p>
        </div>
      </div>

      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 border-2 border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 text-lg bg-primary/80 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {faqs.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="bg-primary/80 backdrop-blur-md rounded-lg p-6 hover:shadow-glass-lg transition-all duration-300 border border-foreground/20 hover:border-button/30"
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {faq.q}
                      </h3>
                      <p className="text-foreground/80 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div className="mt-16 bg-button rounded-2xl p-8 text-center text-button-text">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-primary-100 mb-6">
              Our support team is here to assist you with any questions or concerns.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary/80 backdrop-blur-md text-button font-semibold rounded-xl hover:bg-primary hover:text-button-200 transform hover:scale-105 transition-all duration-200 shadow-glass-lg border border-foreground/20 hover:border-button/50"
            >
              Contact Support
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
      </section>
      </Layout>
    </>
  );
}

