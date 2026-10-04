import { SettingsManager } from "@/features/admin/settings-manager";

export const metadata = {
  title: "Settings - Admin | Hyskilled",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SettingsManager />
    </div>
  );
}
