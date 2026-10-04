import { LegalPageLayout } from "@/features/legal/legal-page-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Refund Policy",
  description: `Refund policy for ${siteConfig.name} courses and programs.`,
  path: ROUTES.refundPolicy,
});

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      description={`Please read our Refund Policy carefully before enrolling in any of our programs.`}
    >
      <section className="space-y-4">
        <p>
          At {siteConfig.name}, operated by {siteConfig.legalName}, we are committed to providing high-quality learning experiences. Before enrolling in any of our programs, please read our Refund Policy carefully.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">No Refund Policy</h2>
        <p>
          All payments made towards any course, program, workshop, or training under {siteConfig.name} are non-refundable, under any circumstances. This includes, but is not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Change of mind after purchase</li>
          <li>Lack of participation or incomplete attendance</li>
          <li>Inability to attend due to personal reasons or scheduling conflicts</li>
          <li>Dissatisfaction with course content or delivery method</li>
          <li>Technical issues on the learner’s end</li>
        </ul>
        <p>By enrolling in any of our offerings, you agree to this strict no-refund policy.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Exception Clause</h2>
        <p>
          In rare and exceptional situations, where {siteConfig.legalName} finds it appropriate to process a refund (e.g., full course cancellation initiated by us), a refund may be issued at our sole discretion.
        </p>
        <p>
          Any approved refund will be processed within 30 working days from the date of refund approval.
        </p>
        <p>
          The refund amount and mode of refund will also be determined by the company, based on the circumstances and original payment method.
        </p>
        <p>
          Processing time does not include weekends, public holidays, or bank delays.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Acceptance of Policy</h2>
        <p>
          By registering and making a payment for any course offered by {siteConfig.name}, you confirm that you have read, understood, and agreed to this Refund Policy, including the no-refund clause and the terms of any potential exceptions.
        </p>
      </section>
    </LegalPageLayout>
  );
}
