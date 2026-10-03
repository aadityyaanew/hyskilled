import { LegalPageLayout } from "@/features/legal/legal-page-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: `Privacy policy explaining how ${siteConfig.name} collects, protects, and uses your personal information.`,
  path: ROUTES.privacy,
});

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description={`How ${siteConfig.name} collects, protects, and processes your personal data across our web platform.`}
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">1. Information We Collect</h2>
        <p>
          We collect personal details necessary to create your account, process course purchases, and
          provision access to the {siteConfig.app.name}:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account and Contact Data:</strong> Your full name, email address, mobile phone number,
            and hashed credentials.
          </li>
          <li>
            <strong>Billing & Transaction Details:</strong> Order items, currency, transaction identifiers,
            tax/GST breakdowns, and coupon codes applied. We do not store full credit card numbers, CVVs,
            or UPI MPINs on our servers; payments are processed securely through certified payment
            gateways.
          </li>
          <li>
            <strong>Device & Usage Information:</strong> Browser type, operating system, IP address, referral
            URLs, and interaction metrics to improve web performance and security.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">2. How We Use Your Data</h2>
        <p>Your information is used strictly for legitimate business and educational purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To process transactions, generate tax invoices, and issue purchase receipts.</li>
          <li>
            To synchronize your course entitlements with your {siteConfig.app.name} account so you can
            access curriculum lessons immediately upon login.
          </li>
          <li>To communicate order status, critical security notices, and course updates.</li>
          <li>To prevent fraudulent payments, spam, or unauthorized access.</li>
          <li>To evaluate platform analytics and optimize user navigation.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">3. Data Sharing & Third Parties</h2>
        <p>
          We do not sell, rent, or trade your personal information. We share data only with trusted
          service providers required to deliver our service:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Payment Processors:</strong> Certified payment gateways (e.g., Razorpay, Stripe) to
            tokenize and execute transactions safely.
          </li>
          <li>
            <strong>Authentication & Infrastructure:</strong> Cloud hosting, database, and transactional
            email infrastructure.
          </li>
          <li>
            <strong>Legal Requirements:</strong> Regulatory or law enforcement bodies when strictly required
            by applicable Indian law or court order.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">4. Data Security</h2>
        <p>
          We implement industry-standard encryption protocols (TLS/HTTPS), secure hashing, and role-based
          database access controls to protect your data against unauthorized interception or modification.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">5. Your Rights & Data Retention</h2>
        <p>
          You have the right to request access to the personal data we hold about you, request corrections
          to your profile, or request deletion of your account (subject to statutory financial record
          retention requirements under Indian tax law).
        </p>
        <p>
          For privacy inquiries or data requests, please write to{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
