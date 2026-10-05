import { query } from "@/lib/db";
import { Download, Inbox } from "lucide-react";

export const metadata = {
  title: "Job Applications | Admin",
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const applications = await query(
    "SELECT id, full_name, phone_no, email, role, experience, resume_url, created_at FROM job_applications ORDER BY created_at DESC"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Job Applications</h1>
          <p className="text-sm text-muted-foreground">View and manage candidate applications submitted via the Careers page.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
            <Inbox className="mb-4 size-10 text-muted-foreground/50" />
            <h3 className="font-semibold text-foreground">No applications found</h3>
            <p className="mt-1 text-sm">When candidates apply on the Careers page, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Candidate</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Contact</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Experience</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Applied On</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-4 font-medium text-foreground">{app.full_name}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-foreground">{app.email}</span>
                        <span className="text-muted-foreground">{app.phone_no}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{app.role}</td>
                    <td className="px-5 py-4">{app.experience}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                      >
                        <Download className="size-3.5" /> Resume
                      </a>
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
