import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy - TouchMunyun"
        description="Read TouchMunyun's privacy policy. Learn how we collect, use, and protect your personal information when you use our platform."
        keywords="privacy policy, data protection, personal information, TouchMunyun"
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
              Privacy Policy
            </h1>
            <p className="text-xl text-foreground/80">
              Your privacy is important to us
            </p>
          </div>
        </div>

        <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-8 text-foreground/80">
                <div>
                  <p className="text-sm text-foreground/70 mb-6">
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                  <p className="leading-relaxed">
                    TouchMunyun (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                  <p className="leading-relaxed mb-4">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, shipping address, and billing information</li>
                    <li><strong className="text-foreground">Account Information:</strong> Username, password, and profile information</li>
                    <li><strong className="text-foreground">Order Information:</strong> Purchase history, payment details, and shipping preferences</li>
                    <li><strong className="text-foreground">Communication Data:</strong> Messages, feedback, and correspondence with us</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We also automatically collect certain information when you visit our website, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP address and browser type</li>
                    <li>Device information and operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                  <p className="leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Process and fulfill your orders</li>
                    <li>Manage your account and provide customer support</li>
                    <li>Send you order confirmations, updates, and shipping notifications</li>
                    <li>Respond to your inquiries and requests</li>
                    <li>Send you marketing communications (with your consent)</li>
                    <li>Improve our website, products, and services</li>
                    <li>Detect and prevent fraud and abuse</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing and Disclosure</h2>
                  <p className="leading-relaxed mb-4">
                    We do not sell your personal information. We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, shipping, and data analysis</li>
                    <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities</li>
                    <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                    <li><strong className="text-foreground">With Your Consent:</strong> We may share information with your explicit consent</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                  <p className="leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking Technologies</h2>
                  <p className="leading-relaxed mb-4">
                    We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                  <p className="leading-relaxed mb-4">
                    Depending on your location, you may have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">Access:</strong> Request access to your personal information</li>
                    <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong className="text-foreground">Objection:</strong> Object to processing of your personal information</li>
                    <li><strong className="text-foreground">Portability:</strong> Request transfer of your personal information</li>
                    <li><strong className="text-foreground">Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children&apos;s Privacy</h2>
                  <p className="leading-relaxed">
                    Our website is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
                  <p className="leading-relaxed">
                    Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our service, you consent to the transfer of your information to these facilities.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to This Privacy Policy</h2>
                  <p className="leading-relaxed">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
                  <p className="leading-relaxed">
                    If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-primary/80 rounded-lg border border-foreground/20">
                    <p className="text-foreground">
                      <strong>Email:</strong>{' '}
                      <a href="mailto:TouchMunyunLLC@gmail.com" className="text-button hover:text-button-200">
                        TouchMunyunLLC@gmail.com
                      </a>
                    </p>
                    <p className="text-foreground mt-2">
                      <strong>Support:</strong>{' '}
                      <a href="mailto:TouchMunyunLLC@gmail.com" className="text-button hover:text-button-200">
                        TouchMunyunLLC@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

