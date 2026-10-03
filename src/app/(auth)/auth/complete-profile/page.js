import { Suspense } from "react";
import { CompleteProfileForm } from "@/features/auth/complete-profile-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Complete Your Profile",
  description: "Link your phone number to complete your Hyskilled account setup.",
  path: "/auth/complete-profile",
  noIndex: true,
});

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfileForm />
    </Suspense>
  );
}
