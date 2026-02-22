import { useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjectsQuery } from "@/queries/subjects";
import { useClassesByTeacherQuery, useCreateClassMutation, type ClassRow } from "@/queries/classes";

export const ClassesPage: FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const teacherId = profile?.role && ["owner", "admin", "teacher"].includes(profile.role) ? user?.id : undefined;

  const { data: subjects = [], isLoading: subjectsLoading } = useSubjectsQuery(teacherId);
  const { data: classes = [], isLoading: classesLoading } = useClassesByTeacherQuery(teacherId);
  const createClass = useCreateClassMutation(teacherId ?? "");

  const [addOpen, setAddOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubjectId, setNewClassSubjectId] = useState("");

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s.name])), [subjects]);
  const isLoading = subjectsLoading || classesLoading;

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !newClassSubjectId.trim()) return;
    try {
      await createClass.mutateAsync({ name: newClassName.trim(), subjectId: newClassSubjectId });
      setNewClassName("");
      setNewClassSubjectId("");
      setAddOpen(false);
    } catch {
      // Error via createClass.error
    }
  };

  const columns = useMemo<ColumnDef<ClassRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("dashboard.classes.className"),
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">{getValue() as string ?? "—"}</span>
        ),
      },
      {
        id: "subject",
        header: t("dashboard.classesPage.subjectLabel"),
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400">
            {subjectMap.get(row.original.subject_id) ?? "—"}
          </span>
        ),
      },
    ],
    [t, subjectMap]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable refs; safe for our usage
  const table = useReactTable({
    data: classes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.classesPage.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("dashboard.classesPage.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.classesPage.cardTitle")}</CardTitle>
          <CardDescription>{t("dashboard.classesPage.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!teacherId ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.signInRequired")}</p>
          ) : (
            <>
              {!addOpen ? (
                <Button type="button" variant="outline" onClick={() => setAddOpen(true)}>
                  {t("dashboard.classesPage.addClass")}
                </Button>
              ) : (
                <form
                  onSubmit={handleAddClass}
                  className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="space-y-2 min-w-[200px]">
                    <Label htmlFor="new-class-subject">{t("dashboard.classesPage.subjectLabel")}</Label>
                    <select
                      id="new-class-subject"
                      value={newClassSubjectId}
                      onChange={(e) => setNewClassSubjectId(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300"
                    >
                      <option value="">{t("dashboard.classesPage.subjectPlaceholder")}</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {subjects.length === 0 && !subjectsLoading && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.classesPage.noSubjects")}</p>
                    )}
                  </div>
                  <div className="space-y-2 min-w-[200px]">
                    <Label htmlFor="new-class-name">{t("dashboard.classes.className")}</Label>
                    <Input
                      id="new-class-name"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder={t("dashboard.classes.classNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createClass.isPending}>
                      {createClass.isPending ? t("dashboard.classes.creating") : t("dashboard.classes.create")}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setAddOpen(false); setNewClassName(""); setNewClassSubjectId(""); }}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                  {createClass.error && (
                    <p className="w-full text-sm text-red-600 dark:text-red-400">{createClass.error.message}</p>
                  )}
                </form>
              )}

              {isLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.loading")}</p>
              ) : classes.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.classesPage.empty")}</p>
              ) : (
                <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
