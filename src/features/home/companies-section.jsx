import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import Image from "next/image";

const companies = [
  { name: "Infosys", file: "infosys.png" },
  { name: "Wipro", file: "wipro.png" },
  { name: "Tech Mahindra", file: "tech-mahindra.png" },
  { name: "Reliance", file: "reliance.png" },
  { name: "Mahindra", file: "mahindra.png" },
  { name: "Bajaj Auto", file: "bajaj-auto.png" },
  { name: "L&T", file: "l-t.png" },
  { name: "HDFC Bank", file: "hdfc-bank.png" },
  { name: "ICICI Bank", file: "icici-bank.png" },
  { name: "Axis Bank", file: "axis-bank.png" },
  { name: "Kotak", file: "kotak.png" },
  { name: "Zomato", file: "zomato.png" },
  { name: "Swiggy", file: "swiggy.png" },
  { name: "Flipkart", file: "flipkart.png" },
  { name: "Paytm", file: "paytm.png" }
];

export function CompaniesSection() {
  const row = [...companies, ...companies];
  
  return (
    <section className="section-y bg-slate-50/50 border-t">
      <div className="container-page text-center">
        <Reveal>
          <SectionHeading
            eyebrow="Career Opportunities"
            title="Explore Careers Across Leading Companies"
            description="Build in-demand skills and prepare yourself for career opportunities across leading organizations."
          />
        </Reveal>

        <div className="mt-14 relative overflow-hidden flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
          <ul className="flex w-max animate-marquee gap-6 pause-on-hover items-center">
            {row.map((c, i) => (
              <li
                key={`row1-${c.name}-${i}`}
                aria-hidden={i >= companies.length}
                className="flex items-center gap-4 rounded-full border bg-white px-6 py-3 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md duration-300"
              >
                <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={`/logos/${c.file}`}
                    alt={`${c.name} logo`}
                    fill
                    sizes="32px"
                    className="object-contain bg-white"
                  />
                </div>
                <span className="font-bold text-ink whitespace-nowrap tracking-tight">{c.name}</span>
              </li>
            ))}
          </ul>
          
          <ul className="flex w-max animate-marquee gap-6 pause-on-hover items-center [animation-direction:reverse]">
            {[...companies].reverse().concat([...companies].reverse()).map((c, i) => (
              <li
                key={`row2-${c.name}-${i}`}
                aria-hidden={i >= companies.length}
                className="flex items-center gap-4 rounded-full border bg-white px-6 py-3 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md duration-300"
              >
                <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={`/logos/${c.file}`}
                    alt={`${c.name} logo`}
                    fill
                    sizes="32px"
                    className="object-contain bg-white"
                  />
                </div>
                <span className="font-bold text-ink whitespace-nowrap tracking-tight">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={100}>
          <p className="mt-16 mx-auto max-w-3xl text-[11px] text-muted-foreground/60 leading-relaxed text-center font-medium">
            Disclaimer: Company names and logos are trademarks of their respective owners. Their inclusion is for illustrative and career-awareness purposes only and does not imply partnership, affiliation, endorsement, recruitment, or placement guarantee.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
