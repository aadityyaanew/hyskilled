import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/**
 * Syllabus *overview* for the sales page (module titles + summaries).
 * Deliberately not a lesson list – lessons live in the Hyskilled app.
 */
export function CourseSyllabus({ modules }) {
  return (
    <Accordion type="single" collapsible defaultValue="m-0">
      {modules.map((m, i) => (
        <AccordionItem
          key={m.title}
          value={`m-${i}`}
          className="mb-3 rounded-2xl border bg-card px-5 last:mb-0 data-[state=open]:border-brand-200 data-[state=open]:bg-brand-50/40"
        >
          <AccordionTrigger className="items-center py-4 text-left hover:no-underline">
            <span className="flex items-center gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-semibold text-ink">{m.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 pl-[3.25rem] text-[15px] text-muted-foreground">
            {m.summary}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
