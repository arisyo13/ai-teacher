import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/queries/auth";
import { useUpdateProfileMutation } from "@/queries/auth";
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
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const updateProfile = useUpdateProfileMutation();

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
  }, [profile?.first_name, profile?.last_name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    updateProfile.mutate({ firstName: firstName.trim(), lastName: lastName.trim(), userId: user.id });
  };

  const birthDateFormatted = profile?.birth_date
    ? formatDate(profile.birth_date.includes("T") ? profile.birth_date : `${profile.birth_date}T00:00:00`)
    : "—";

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-firstName">{t("account.profile.firstName")}</Label>
              <Input
                id="account-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-lastName">{t("account.profile.lastName")}</Label>
              <Input
                id="account-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
            {updateProfile.error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {updateProfile.error.message}
              </p>
            )}
            {updateProfile.isSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {t("account.profile.saved")}
              </p>
            )}
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? t("account.profile.saving") : t("account.profile.save")}
            </Button>
          </form>

          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("account.profile.birthDate")}
            </p>
            <p className="text-slate-900 dark:text-slate-100">{birthDateFormatted}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("account.profile.role")}
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {profile ? t(`account.profile.${roleKey(profile.role)}`) : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("account.profile.memberSince")}
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              {profile?.created_at ? formatDate(profile.created_at) : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
