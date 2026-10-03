import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { AdminSidebar, AdminTopBar } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Admin Panel | Hyskilled",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 shrink-0 lg:block">
        <AdminSidebar adminEmail={admin.email} className="fixed top-0 bottom-0 w-64" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopBar adminEmail={admin.email} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
