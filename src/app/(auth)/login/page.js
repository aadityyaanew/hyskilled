import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Log in",
  description: "Log in to your Hyskilled account.",
  path: ROUTES.login(),
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
