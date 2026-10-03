import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";
import { AlertCircle, ShieldCheck } from "lucide-react";

export function LegalPageLayout({
  title,
  lastUpdated = "October 2026",
  description,
  sections,
  children,
}) {
  return (
    <>
      <PageHeader
        eyebrow="Legal & Policies"
        title={title}
        description={description}
        breadcrumbs={[{ label: title, href: "#" }]}
      />

      <section className="section-y">
        <div className="container-page max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            {/* Sidebar quick links */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Legal Documents
                  </p>
                  <nav className="mt-3 flex flex-col space-y-1.5 text-sm">
                    <Link
                      href={ROUTES.terms}
                      className="rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-muted text-ink"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href={ROUTES.privacy}
                      className="rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-muted text-ink"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href={ROUTES.refundPolicy}
                      className="rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-muted text-ink"
                    >
                      Refund Policy
                    </Link>
                  </nav>
                </div>


              </div>
            </aside>

            {/* Document body */}
            <article className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-ink prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {siteConfig.legalName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Last updated: {lastUpdated}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
                  <AlertCircle className="size-3.5 text-primary" />
                  <span>Version 1.0</span>
                </div>
              </div>

              <div className="mt-8 space-y-8">{children}</div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
