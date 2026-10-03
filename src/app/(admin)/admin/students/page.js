import { Users, Phone, Mail, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAdminStudents } from "@/services/admin.service";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Learners & Students | Admin",
};

export default async function AdminStudentsPage() {
  const students = await getAdminStudents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Students & Learners
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            All registered learners authenticated via Google Auth with linked mobile numbers.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Users className="size-6" />
            </span>
            <p className="mt-3 font-semibold text-foreground">No students registered yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When users sign in via Google Auth and provide their mobile number, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Learner</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Active Courses</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {student.name?.slice(0, 2).toUpperCase() || "ST"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <p className="text-[11px] text-muted-foreground">ID #{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-1.5 font-medium text-foreground">
                        <Mail className="size-3 text-muted-foreground" />
                        {student.email}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="size-3 text-emerald-600" />
                        {student.phone ? `+91 ${student.phone}` : "No phone linked"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <CheckCircle2 className="size-3" />
                        {student.enrolled_courses_count || 0} enrolled
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant={student.status === "active" ? "success" : "destructive"}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(student.created_at, { dateStyle: "medium" })}
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
