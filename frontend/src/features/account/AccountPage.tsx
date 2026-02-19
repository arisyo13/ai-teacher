import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/queries/auth";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function roleKey(role: Role): "roleOwner" | "roleAdmin" | "roleTeacher" | "roleStudent" {
  switch (role) {
    case "owner": return "roleOwner";
    case "admin": return "roleAdmin";
    case "teacher": return "roleTeacher";
    default: return "roleStudent";
  }
}

export const AccountPage = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

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
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("account.profile.email")}
            </p>
            <p className="text-slate-900 dark:text-slate-100">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("account.profile.displayName")}
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {profile?.display_name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("account.profile.role")}
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {profile ? t(`account.profile.${roleKey(profile.role)}`) : "—"}
            </p>
          </div>
          {profile?.created_at && (
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("account.profile.memberSince")}
              </p>
              <p className="text-slate-900 dark:text-slate-100">
                {formatDate(profile.created_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
