import type { Metadata } from "next";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the terms and conditions for using Amaken Real Estate services and website.",
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbBanner
        title="Terms & Conditions"
        crumbs={[{ label: "Terms & Conditions" }]}
      />

      <section className="py-12">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none text-amaken-gray prose-headings:text-navy prose-a:text-primary">
            <h2>1. Introduction</h2>
            <p>Welcome to Amaken Real Estate. These Terms and Conditions govern your use of our website and services. By accessing or using our website, you agree to be bound by these terms.</p>

            <h2>2. Use of Website</h2>
            <p>You may use our website for lawful purposes only. You agree not to use the website in any way that could damage, disable, or impair the site or interfere with any other party&apos;s use of the site.</p>

            <h2>3. Property Listings</h2>
            <p>All property listings on our website are provided for informational purposes only. While we strive to ensure accuracy, Amaken Real Estate does not guarantee the completeness or accuracy of any listing information.</p>

            <h2>4. Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of Amaken Real Estate and is protected by applicable intellectual property laws.</p>

            <h2>5. Third-Party Services</h2>
            <p>Our website may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party sites.</p>

            <h2>6. Liability Disclaimer</h2>
            <p>Amaken Real Estate shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our website or services.</p>

            <h2>7. User Responsibilities</h2>
            <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>

            <h2>8. Privacy Policy</h2>
            <p>Your use of our website is also governed by our <a href="/privacy">Privacy Policy</a>, which is incorporated into these terms by reference.</p>

            <h2>9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the website.</p>

            <h2>10. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:info@amaken-realestate.com">info@amaken-realestate.com</a> or call <a href="tel:+971552615993">+971 55 261 5993</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
}
