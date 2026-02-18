import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DUMMY_STATS = [
  { key: "classes", value: 3, labelKey: "dashboard.stats.classes" },
  { key: "students", value: 24, labelKey: "dashboard.stats.students" },
  { key: "questions", value: 12, labelKey: "dashboard.stats.questionsThisWeek" },
] as const;

const DUMMY_RECENT = [
  { id: "1", titleKey: "dashboard.recent.item1", timeKey: "dashboard.recent.minutesAgo" },
  { id: "2", titleKey: "dashboard.recent.item2", timeKey: "dashboard.recent.hoursAgo" },
  { id: "3", titleKey: "dashboard.recent.item3", timeKey: "dashboard.recent.yesterday" },
] as const;

export const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DUMMY_STATS.map(({ key, value, labelKey }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(labelKey)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
          <CardDescription>{t("dashboard.recent.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {DUMMY_RECENT.map(({ id, titleKey, timeKey }) => (
              <li key={id} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium">{t(titleKey)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t(timeKey)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
