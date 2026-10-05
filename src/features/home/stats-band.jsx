import { CountUp } from "@/components/shared/count-up";
import { siteConfig } from "@/config/site";

export function StatsBand() {
  return (
    <section aria-label="Hyskilled in numbers" className="relative overflow-hidden bg-ink py-14">
      <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/30 blur-3xl"
      />
      <dl className="container-page relative grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {siteConfig.stats.map((s, i) => (
          <div
            key={s.label}
            className={`text-center ${i % 2 !== 0 ? "sm:border-l sm:border-white/10" : ""} ${i > 1 ? "lg:border-l lg:border-white/10" : ""}`}
          >
            <dd className="font-heading text-4xl font-extrabold text-white sm:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </dd>
            <dt className="mt-2 text-sm font-medium text-white/60">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
