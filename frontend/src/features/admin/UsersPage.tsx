import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isOwner } from "@/queries/auth";
import type { Role } from "@/queries/auth";
import { useAllProfilesWithEmailQuery, useUpdateUserProfileMutation, type ProfileWithEmail } from "@/queries/users";
import { formatDate } from "@/services/time";

const roleKey = (role: Role): "roleOwner" | "roleAdmin" | "roleTeacher" | "roleStudent" => {
  switch (role) {
    case "owner": return "roleOwner";
    case "admin": return "roleAdmin";
    case "teacher": return "roleTeacher";
    default: return "roleStudent";
  }
};

const ROLES: Role[] = ["owner", "admin", "teacher", "student"];

export const UsersPage = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const owner = isOwner(profile?.role);

  const { data: users = [], isLoading } = useAllProfilesWithEmailQuery(!!owner);
  const updateProfile = useUpdateUserProfileMutation();

  if (!owner) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.users.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("admin.users.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users.cardTitle")}</CardTitle>
          <CardDescription>{t("admin.users.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.loading")}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.users.empty")}</p>
          ) : (
            <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left font-medium text-slate-600 dark:text-slate-400 px-4 py-3">{t("account.profile.email")}</th>
                    <th className="text-left font-medium text-slate-600 dark:text-slate-400 px-4 py-3">{t("account.profile.firstName")}</th>
                    <th className="text-left font-medium text-slate-600 dark:text-slate-400 px-4 py-3">{t("account.profile.lastName")}</th>
                    <th className="text-left font-medium text-slate-600 dark:text-slate-400 px-4 py-3">{t("account.profile.birthDate")}</th>
                    <th className="text-left font-medium text-slate-600 dark:text-slate-400 px-4 py-3">{t("account.profile.role")}</th>
                    <th className="w-[100px]" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onUpdate={updateProfile.mutateAsync}
                      roleKey={roleKey}
                      t={t}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function UserRow({
  user,
  onUpdate,
  roleKey,
  t,
}: {
  user: ProfileWithEmail;
  onUpdate: (params: {
    id: string;
    role: Role;
    first_name: string | null;
    last_name: string | null;
    birth_date: string | null;
  }) => Promise<unknown>;
  roleKey: (r: Role) => string;
  t: (key: string) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState<Role>(user.role);
  const [firstName, setFirstName] = useState(user.first_name ?? "");
  const [lastName, setLastName] = useState(user.last_name ?? "");
  const [birthDate, setBirthDate] = useState(user.birth_date ?? "");

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await onUpdate({
        id: user.id,
        role,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        birth_date: birthDate.trim() || null,
      });
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancel = () => {
    setSaveError(null);
    setRole(user.role);
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setBirthDate(user.birth_date ?? "");
    setEditing(false);
  };

  const birthDateDisplay = user.birth_date
    ? formatDate(user.birth_date.includes("T") ? user.birth_date : `${user.birth_date}T00:00:00`)
    : "—";

  return (
    <>
      <tr className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
        <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{user.email ?? "—"}</td>
        <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{user.first_name ?? "—"}</td>
        <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{user.last_name ?? "—"}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{birthDateDisplay}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t(`account.profile.${roleKey(user.role)}`)}</td>
        <td className="px-4 py-3">
          {!editing ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t("dashboard.subjects.edit")}
            </Button>
          ) : null}
        </td>
      </tr>
      {editing && (
        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
          <td colSpan={6} className="px-4 py-3">
            <form onSubmit={handleSave} className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs">{t("account.profile.firstName")}</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs">{t("account.profile.lastName")}</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1 min-w-[140px]">
                <Label className="text-xs">{t("account.profile.birthDate")}</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1 min-w-[120px]">
                <Label className="text-xs">{t("account.profile.role")}</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="flex h-8 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {t(`account.profile.${roleKey(r)}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">{t("account.profile.save")}</Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
                  {t("common.cancel")}
                </Button>
              </div>
              {saveError && (
                <p className="w-full text-sm text-red-600 dark:text-red-400">{saveError}</p>
              )}
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
