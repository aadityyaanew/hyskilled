const skills = [
  "Python", "Generative AI", "Machine Learning", "React", "Next.js", "Figma", "SQL", "Power BI",
  "PyTorch", "Node.js", "AWS", "Docker", "Flutter", "Prompt Engineering", "Data Visualisation",
  "Cybersecurity", "Design Systems", "Kubernetes",
];

/** Infinite skills ticker. Duplicated list + translateX(-50%) for a seamless loop. */
export function SkillsMarquee() {
  const row = [...skills, ...skills];
  return (
    <section aria-label="Skills you can learn" className="border-y bg-white py-5">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-3 pause-on-hover">
          {row.map((s, i) => (
            <li
              key={`${s}-${i}`}
              aria-hidden={i >= skills.length}
              className="flex items-center gap-3 rounded-full border bg-muted/40 px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink-soft"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
