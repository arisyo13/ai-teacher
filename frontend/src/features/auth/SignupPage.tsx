import { useTranslation } from "react-i18next";

export const SignupPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("auth.signup.title")}</h1>
      <p className="mt-2">{t("auth.signup.placeholder")}</p>
    </div>
  );
};
