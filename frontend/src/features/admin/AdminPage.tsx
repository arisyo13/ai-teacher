import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateTeacherMutation } from "@/queries/auth";

export const AdminPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const createTeacher = useCreateTeacherMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    try {
      const result = await createTeacher.mutateAsync({ email, password, firstName: firstName.trim(), lastName: lastName.trim() });
      setSuccessMessage(t("admin.createTeacher.success", { email: result.email ?? email }));
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    } catch {
      // Error shown via createTeacher.error
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t("admin.title")}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t("admin.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.createTeacher.title")}</CardTitle>
          <CardDescription>{t("admin.createTeacher.description")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(createTeacher.error || successMessage) && (
              <p
                className={`text-sm ${successMessage ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                role="alert"
              >
                {successMessage ?? createTeacher.error?.message}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t("auth.login.email")}</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">{t("admin.createTeacher.password")}</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-firstName">{t("auth.signup.firstName")}</Label>
              <Input
                id="admin-firstName"
                type="text"
                placeholder={t("auth.signup.firstNamePlaceholder")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-lastName">{t("auth.signup.lastName")}</Label>
              <Input
                id="admin-lastName"
                type="text"
                placeholder={t("auth.signup.lastNamePlaceholder")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={createTeacher.isPending}>
              {createTeacher.isPending ? t("admin.createTeacher.submitting") : t("admin.createTeacher.submit")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
