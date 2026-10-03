import { KeyRound, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrantAccessDialog } from "@/features/admin/grant-access-dialog";
import { getAdminCourses, getAdminEnrollments } from "@/services/admin.service";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "App Access Sync (Enrollments) | Admin",
};

export default async function AdminEnrollmentsPage() {
  const [enrollments, courses] = await Promise.all([
    getAdminEnrollments(),
    getAdminCourses(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Mobile App Access Sync
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Live course entitlements. The Hyskilled mobile app syncs purchased and granted courses from this table.
          </p>
        </div>

        <GrantAccessDialog courses={courses} />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary flex items-start gap-3">
        <Smartphone className="size-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">How Mobile App Access Works</p>
          <p className="mt-0.5 text-muted-foreground">
            When a student completes checkout (or when you manually grant access here), an active record is inserted into the <code className="font-mono font-bold text-primary">enrollments</code> table. When the student logs in to the mobile app with the same email, their courses unlock automatically.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <KeyRound className="size-6" />
            </span>
            <p className="mt-3 font-semibold text-foreground">No course access records yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When courses are purchased or manually granted, active access entitlements will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Learner</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">App Course ID</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Granted On</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">{enr.user_name || "Learner"}</p>
                      <p className="text-[11px] text-muted-foreground">{enr.user_email}</p>
                      {enr.user_phone && (
                        <p className="text-[10px] text-emerald-600 font-mono">+91 {enr.user_phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {enr.course_title}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-primary">
                      {enr.app_course_id || enr.course_slug}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                        {enr.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(enr.granted_at, { dateStyle: "short" })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant={enr.status === "active" ? "success" : "destructive"}>
                        {enr.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
