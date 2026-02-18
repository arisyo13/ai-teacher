import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AccountPage = () => {
  const { t } = useTranslation();

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
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("account.profile.placeholder")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
