import { LegalPageLayout } from "@/features/legal/legal-page-layout";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Terms and Conditions",
  description: `Terms and conditions governing the purchase and access of courses on ${siteConfig.name}.`,
  path: ROUTES.terms,
});

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description={`Please read these terms carefully before purchasing courses on the ${siteConfig.name} platform.`}
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">1. Overview & Service Scope</h2>
        <p>
          Welcome to {siteConfig.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operated by{" "}
          {siteConfig.legalName}. {siteConfig.name} is a course discovery and purchasing portal. Our
          website allows users to discover, evaluate, and purchase licenses for technology courses and
          bundles.
        </p>
        <p>
          <strong>Separation of Web Storefront and Mobile Application:</strong> This website handles
          course marketing, user registration, pricing, cart management, payments, and order confirmation.
          The interactive learning experience (video lessons, resources, and progress) is delivered
          separately via the {siteConfig.app.name} available on iOS and Android platforms. Upon completing
          a purchase on this website, course access will be automatically provisioned for the email
          address provided during checkout.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">2. User Accounts & Registration</h2>
        <p>
          To purchase courses, you may register for an account using your legal name, a valid email address,
          and a mobile number. You agree that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are at least 18 years of age or possess legal parental/guardian consent.</li>
          <li>The information you provide is true, accurate, current, and complete.</li>
          <li>
            You will maintain the security of your password and accept all risks of unauthorized access
            to your account.
          </li>
          <li>
            Account sharing, group access, or reselling licenses without written authorization is strictly
            prohibited and will result in immediate termination of access without refund.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">3. Purchases, Pricing & Taxes</h2>
        <p>
          Course prices, bundle packages, and promotional offers are listed on the website in Indian
          Rupees (INR). All stated prices are inclusive of Goods and Services Tax (GST) at the prevailing
          statutory rate (18%), unless explicitly noted otherwise.
        </p>
        <p>
          We reserve the right to revise pricing, discontinue courses, or introduce new bundles at any
          time. Any price changes will not affect previously completed purchases.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">4. Intellectual Property & Lifetime License</h2>
        <p>
          All course materials, syllabi, software code samples, design assets, and video streams are the
          exclusive intellectual property of {siteConfig.legalName} and its instructors.
        </p>
        <p>
          Purchasing a course grants you a personal, non-exclusive, non-transferable, revocable lifetime
          license to access the course content inside the {siteConfig.app.name} for self-paced educational
          purposes. You may not record, reproduce, distribute, or reverse-engineer the content.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">5. Disclaimers & Limitation of Liability</h2>
        <p>
          While our curriculum is designed around modern job market standards and industry best practices,{" "}
          {siteConfig.name} does not guarantee employment, salary increases, or job placement. Career
          outcomes depend on individual dedication, practice, and market factors.
        </p>
        <p>
          In no event shall {siteConfig.legalName}, its directors, or its affiliates be liable for any
          indirect, incidental, or consequential damages resulting from the use or inability to use our
          services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">6. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the laws of India.
          Any dispute arising under or in connection with these terms shall be subject to the exclusive
          jurisdiction of the courts of India.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">7. Contact Information</h2>
        <p>
          If you have any questions regarding these Terms, please contact our legal team at{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
