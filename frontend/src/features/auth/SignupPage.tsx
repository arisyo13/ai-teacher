import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUpMutation } from "@/queries/auth";

export const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmEmailMessage, setConfirmEmailMessage] = useState<string | null>(null);
  const signUp = useSignUpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmEmailMessage(null);
    try {
      const data = await signUp.mutateAsync({ email, password, firstName: firstName.trim(), lastName: lastName.trim() });
      if (data.session) {
        navigate("/account", { replace: true });
      } else {
        setConfirmEmailMessage(t("auth.signup.confirmEmail"));
      }
    } catch {
      // Error shown via signUp.error
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md min-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("auth.signup.title")}</CardTitle>
          <CardDescription>{t("auth.signup.description")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(signUp.error || confirmEmailMessage) && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {signUp.error?.message ?? confirmEmailMessage}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.signup.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("auth.signup.firstName")}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t("auth.signup.firstNamePlaceholder")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("auth.signup.lastName")}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t("auth.signup.lastNamePlaceholder")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={signUp.isPending}>
              {signUp.isPending ? t("auth.signup.submitting") : t("auth.signup.submit")}
            </Button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t("auth.signup.hasAccount")}{" "}
              <Link to="/login" className="text-slate-900 dark:text-slate-100 font-medium underline-offset-4 hover:underline">
                {t("auth.signup.signInLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
