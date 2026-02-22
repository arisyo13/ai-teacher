import { type FC } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const HomePage: FC = () => {
  const { t } = useTranslation();
  const content = [
    {
      title: t("home.forTeachers.title"),
      description: t("home.forTeachers.description"),
    },
    {
      title: t("home.forStudents.title"),
      description: t("home.forStudents.description"),
    },
    {
      title: t("home.howItWorks.title"),
      description: t("home.howItWorks.description"),
    },
  ];

  const actions = [
    {
      label: t("common.getStarted"),
      to: "/signup",
    },
    {
      label: t("common.logIn"),
      to: "/login",
    },
    {
      label: t("dashboard.title"),
      to: "/dashboard",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <section className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("home.hero.title")}
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {t("home.hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {actions.map(({ label, to }) => (
            <Button key={label} asChild>
              <Link to={to}>{label}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-16 space-y-10">
        {content.map((item) => (
          <div key={item.title}>
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400">{t("home.cta.ready")}</p>
        <Button asChild className="mt-3">
          <Link to="/signup">{t("common.signUp")}</Link>
        </Button>
      </section>
    </div>
  );
};
