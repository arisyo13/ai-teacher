import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/queries/auth";
import { formatDate } from "@/services/time";

const roleKey = (role: Role): "roleOwner" | "roleAdmin" | "roleTeacher" | "roleStudent" => {
  switch (role) {
    case "owner": return "roleOwner";
    case "admin": return "roleAdmin";
    case "teacher": return "roleTeacher";
    default: return "roleStudent";
  }
};

export const AccountPage = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const userDetails = [
    {
      label: t("account.profile.email"),
      value: user?.email ?? "—",
    },
    {
      label: t("account.profile.displayName"),
      value: profile?.display_name ?? "—",
    },
    {
      label: t("account.profile.role"),
      value: profile ? t(`account.profile.${roleKey(profile.role)}`) : "—",
    },
    {
      label: t("account.profile.memberSince"),
      value: profile?.created_at ? formatDate(profile.created_at) : "—",
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t("account.title")}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t("account.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("account.profile.title")}</CardTitle>
          <CardDescription>{t("account.profile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userDetails.map(({ label, value }) => (
            <div key={label}>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
