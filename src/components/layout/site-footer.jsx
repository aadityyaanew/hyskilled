import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Lock } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { XIcon, LinkedinIcon, InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/shared/brand-icons";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

const socials = [
  { label: "X (Twitter)", href: siteConfig.socials.twitter, Icon: XIcon },
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinIcon },
  { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
  { label: "YouTube", href: siteConfig.socials.youtube, Icon: YoutubeIcon },
];

export function SiteFooter({ categories = [] }) {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white/80">
      <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
      />

      <div className="container-page relative pt-16 pb-24 sm:pb-8">
        {/* main grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr] lg:gap-12 lg:py-14">
          <div className="col-span-2 max-w-sm md:col-span-3 lg:col-span-1">
            <Logo tone="white" height={40} />
            <p className="mt-3 text-lg font-bold tracking-wide text-white">
              Build What's Next.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Master in-demand skills with expert-led courses in AI, Data Science, UI/UX, and Web Development. Pay once, own it forever, and learn on the go with the {siteConfig.app.name}.
            </p>
            <ul className="mt-6 flex gap-2.5">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="focus-ring grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-600 hover:text-white"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title} className="col-span-1">
              <h3 className="font-heading text-sm font-bold tracking-wide text-white">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-ring rounded text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h3 className="font-heading text-sm font-bold tracking-wide text-white">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>{siteConfig.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="border-t border-white/10 py-6">
            <p className="mb-3 text-xs font-bold tracking-wider text-white/40 uppercase">Popular topics</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={ROUTES.category(c.slug)} className="text-white/60 hover:text-white">
                    {c.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* bottom */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-emerald-400" /> 256-bit secure payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
