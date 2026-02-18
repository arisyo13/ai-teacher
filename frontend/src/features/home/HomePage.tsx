import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto">
      <section className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("home.hero.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          {t("home.hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link to="/signup">{t("common.getStarted")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">{t("common.logIn")}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold">{t("home.forTeachers.title")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("home.forTeachers.description")}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{t("home.forStudents.title")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("home.forStudents.description")}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{t("home.howItWorks.title")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("home.howItWorks.description")}
          </p>
        </div>
      </section>

      <section className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700 text-center">
        <p className="text-muted-foreground">{t("home.cta.ready")}</p>
        <Button asChild className="mt-3">
          <Link to="/signup">{t("common.signUp")}</Link>
        </Button>
      </section>
    </div>
  );
};
