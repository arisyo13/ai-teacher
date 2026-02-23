import { useEffect, useState, type FC } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSignUpMutation,
  completeOwnerSignup,
  consumeInvite,
  getInviteByToken,
  authKeys,
} from "@/queries/auth";

const SIGNUP_INVITE_KEY = "signup_invite_token";

export const SignupPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") ?? undefined;
  const inviteFromStorage =
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem(SIGNUP_INVITE_KEY) : null;
  const inviteToken = inviteFromUrl ?? inviteFromStorage ?? undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [confirmEmailMessage, setConfirmEmailMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<{
    email: string;
    institution_name: string;
    role: string;
  } | null>(null);

  const signUp = useSignUpMutation();

  // Persist invite token so we keep it if the URL is stripped (e.g. by router/host)
  useEffect(() => {
    if (!inviteToken || typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(SIGNUP_INVITE_KEY, inviteToken);
  }, [inviteToken]);

  // Restore invite in URL when we have it from storage but URL was cleared
  useEffect(() => {
    if (!inviteFromStorage || inviteFromUrl) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("invite", inviteFromStorage);
      return next;
    }, { replace: true });
  }, [inviteFromStorage, inviteFromUrl, setSearchParams]);

  useEffect(() => {
    if (!inviteToken) return;
    getInviteByToken(inviteToken).then((info) => {
      setInviteInfo(info ?? null);
      if (info?.email) setEmail(info.email);
    });
  }, [inviteToken]);

  const isFormValid =
    email.trim() !== "" &&
    password.length >= 6 &&
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    birthDate !== "" &&
    (inviteToken ? true : institutionName.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmEmailMessage(null);
    setValidationError(null);
    if (!isFormValid) {
      setValidationError(t("auth.signup.fillAllFields"));
      return;
    }
    try {
      const data = await signUp.mutateAsync({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate,
      });
      if (data.session && data.user) {
        if (inviteToken) {
          await consumeInvite(inviteToken);
          try {
            sessionStorage.removeItem(SIGNUP_INVITE_KEY);
          } catch {
            /* ignore */
          }
        } else {
          await completeOwnerSignup(institutionName.trim());
        }
        await queryClient.invalidateQueries({ queryKey: authKeys.session() });
        navigate("/account", { replace: true });
      } else {
        if (!inviteToken && institutionName.trim()) {
          try {
            sessionStorage.setItem("pending_owner_institution", institutionName.trim());
          } catch {
            /* ignore */
          }
        }
        setConfirmEmailMessage(t("auth.signup.confirmEmail"));
      }
    } catch {
      // Error shown via signUp.error or from RPC
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md min-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("auth.signup.title")}</CardTitle>
          <CardDescription>
            {inviteInfo
              ? t("auth.signup.inviteDescription", { institution: inviteInfo.institution_name })
              : t("auth.signup.description")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(signUp.error || confirmEmailMessage || validationError) && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {signUp.error?.message ?? confirmEmailMessage ?? validationError}
              </p>
            )}
            {inviteToken && inviteInfo === null && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t("auth.signup.inviteInvalidOrExpired")}
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
                readOnly={!!inviteInfo?.email}
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
            <div className="space-y-2">
              <Label htmlFor="birthDate">{t("auth.signup.birthDate")}</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            {!inviteToken && (
              <div className="space-y-2">
                <Label htmlFor="institutionName">{t("auth.signup.institutionName")}</Label>
                <Input
                  id="institutionName"
                  type="text"
                  placeholder={t("auth.signup.institutionNamePlaceholder")}
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  autoComplete="organization"
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={signUp.isPending || !isFormValid}>
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
