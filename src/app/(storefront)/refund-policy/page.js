import { LegalPageLayout } from "@/features/legal/legal-page-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Refund Policy",
  description: `Learn about our ${siteConfig.guarantee.label} and how to request a refund for courses purchased on ${siteConfig.name}.`,
  path: ROUTES.refundPolicy,
});

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      description={`Everything you need to know about our ${siteConfig.guarantee.label} and how refunds are processed.`}
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">1. Our 7-Day Money-Back Guarantee</h2>
        <p>
          At {siteConfig.name}, we believe in the quality and practical rigor of our courses. We want
          you to enroll with complete confidence.
        </p>
        <p>
          If you purchase a course or bundle and determine within <strong>7 calendar days</strong> from
          the date and time of purchase that it is not right for your learning goals, you are eligible
          to request a 100% full refund.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">2. Eligibility Conditions</h2>
        <p>To ensure fairness and prevent curriculum exploitation, the following conditions apply:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Timeframe:</strong> The refund request must be submitted within 7 days of the original
            transaction timestamp.
          </li>
          <li>
            <strong>Fair Usage:</strong> You must not have consumed or completed more than 25% of the
            video lessons or downloaded the bulk repository/code archives in the {siteConfig.app.name}.
          </li>
          <li>
            <strong>Account Standing:</strong> Your account must be in good standing, with no prior terms
            violations or repeated refund abuse patterns.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">3. Bundle Purchases</h2>
        <p>
          If you purchase a career-track bundle, the 7-day guarantee applies to the entire bundle.
          Partial refunds for individual courses within a bundle are not supported because bundle
          discounts are calculated as an integrated learning package.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">4. How to Request a Refund</h2>
        <p>Requesting a refund is simple and hassle-free:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Send an email to{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
              {siteConfig.contact.email}
            </a>{" "}
            from the registered email address linked to your purchase.
          </li>
          <li>Include your <strong>Order ID</strong> (e.g., &quot;ord_...&quot;) found in your receipt email or account dashboard.</li>
          <li>
            (Optional) Share a brief note explaining why the course wasn't suitable. Your feedback helps
            us continuously refine our instructors and syllabus.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">5. Processing & Payout Timeline</h2>
        <p>
          Once your request is received and verified, our finance team will authorize the refund within
          <strong> 24 to 48 business hours</strong>.
        </p>
        <p>
          Refunds are credited back to the original payment source (UPI account, credit/debit card, or
          bank account). Depending on your bank or payment gateway, funds typically reflect in your
          account within <strong>5 to 7 business days</strong>.
        </p>
        <p>
          Upon approval of the refund, access to the corresponding course(s) will be automatically
          revoked in the {siteConfig.app.name}.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">6. Questions?</h2>
        <p>
          If you have questions regarding a recent order or the status of a pending refund, reach out
          to our support team anytime at{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
