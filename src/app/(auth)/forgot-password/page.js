import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Reset password",
  description: "Reset your Hyskilled account password.",
  path: ROUTES.forgotPassword,
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
