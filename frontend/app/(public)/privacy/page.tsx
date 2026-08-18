import type { Metadata } from "next";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Amaken Real Estate privacy policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbBanner
        title="Privacy Policy"
        crumbs={[{ label: "Privacy Policy" }]}
      />

      <section className="py-12">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none text-amaken-gray prose-headings:text-navy prose-a:text-primary">
            <p><strong>Last Updated:</strong> December 2024</p>

            <h2>1. Introduction</h2>
            <p>Amaken Real Estate (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>

            <h2>2. Information We Collect</h2>
            <p>We may collect information about you in various ways, including:</p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, and other contact information you provide when registering or submitting inquiries.</li>
              <li><strong>Property Data:</strong> Information about properties you list, search for, or inquire about.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, and pages visited.</li>
              <li><strong>Device Information:</strong> Information about the device you use to access our website.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process property transactions and inquiries</li>
              <li>Communicate with you about properties and services</li>
              <li>Improve our website and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Property agents and brokers for transaction processing</li>
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

            <h2>6. Cookies</h2>
            <p>We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookies through your browser settings.</p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>8. Data Retention</h2>
            <p>We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law.</p>

            <h2>9. GDPR Compliance</h2>
            <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR).</p>

            <h2>10. CCPA Compliance</h2>
            <p>If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including the right to know, delete, and opt-out.</p>

            <h2>11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

            <h2>12. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@amaken-realestate.com">info@amaken-realestate.com</a> or call <a href="tel:+971552615993">+971 55 261 5993</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
}
