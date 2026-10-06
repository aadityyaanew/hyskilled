import { getAdminInstructors } from "@/services/admin.service";
import { InstructorsManager } from "@/features/admin/instructors-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Instructors & Mentors Management | Admin",
};

export default async function AdminInstructorsPage() {
  const instructors = await getAdminInstructors();

  return <InstructorsManager initialInstructors={instructors} />;
}
