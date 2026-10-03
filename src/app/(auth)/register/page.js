import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/register-form";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Create account",
  description: "Create your free Hyskilled account to buy courses and unlock them in the app.",
  path: ROUTES.register(),
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
