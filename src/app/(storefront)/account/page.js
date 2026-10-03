import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AccountView } from "@/features/auth/account-view";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "My account",
  description: "Manage your Hyskilled profile and view your orders.",
  path: ROUTES.account,
  noIndex: true,
});

export default function AccountPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="My account"
        breadcrumbs={[{ label: "My account", href: ROUTES.account }]}
      />
      <section className="section-y !pt-10">
        <div className="container-page max-w-5xl">
          <Suspense fallback={<div className="skeleton-shimmer h-64 rounded-3xl" />}>
            <AccountView />
          </Suspense>
        </div>
      </section>
    </>
  );
}
