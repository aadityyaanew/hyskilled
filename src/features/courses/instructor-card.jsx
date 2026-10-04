import { Award, BookOpen, Star, Users } from "lucide-react";
import { initials, formatNumber } from "@/lib/format";

export function InstructorCard({ instructor }) {
  if (!instructor) return null;
  return (
    <div className="flex flex-col gap-5 rounded-3xl border bg-card p-6 sm:flex-row sm:p-8">
      <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-900 font-heading text-2xl font-bold text-white shadow-glow">
        {initials(instructor.name)}
      </span>
      <div>
        <h3 className="text-xl font-bold text-ink">{instructor.name}</h3>
        <p className="text-sm font-semibold text-primary">{instructor.title}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">

          <li className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {formatNumber(instructor.learners)} learners
          </li>
          <li className="inline-flex items-center gap-1.5">
            <BookOpen className="size-4" />
            {instructor.courses} courses
          </li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{instructor.bio}</p>
      </div>
    </div>
  );
}
