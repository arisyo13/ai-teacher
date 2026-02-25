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
import { useSubjectsPaginatedQuery, useCreateSubjectMutation } from "@/queries/subjects";
import type { SubjectRow } from "@/queries/subjects";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const SubjectsPage: FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const teacherId = profile?.role && ["owner", "admin", "teacher"].includes(profile.role) ? user?.id : undefined;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: paginatedResult, isLoading } = useSubjectsPaginatedQuery(teacherId, page, pageSize);
  const subjects = paginatedResult?.data ?? [];
  const total = paginatedResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const createSubject = useCreateSubjectMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    try {
      await createSubject.mutateAsync({
        name: newName.trim(),
        description: newDescription.trim(),
        teacherId,
      });
      setNewName("");
      setNewDescription("");
      setAddOpen(false);
      setPage(1);
    } catch {
      // Error via createSubject.error
    }
  };

  const columns = useMemo<ColumnDef<SubjectRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("dashboard.subjects.subjectName"),
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">{getValue() as string ?? "—"}</span>
        ),
      },
      {
        accessorKey: "description",
        header: t("dashboard.subjects.subjectDescription"),
        cell: ({ getValue }) => (
          <span className="text-slate-600 dark:text-slate-400">{(getValue() as string | null) || "—"}</span>
        ),
      },
    ],
    [t]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable refs; safe for our usage
  const table = useReactTable({
    data: subjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.subjectsPage.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("dashboard.subjectsPage.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.subjectsPage.cardTitle")}</CardTitle>
          <CardDescription>{t("dashboard.subjectsPage.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!teacherId ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.signInRequired")}</p>
          ) : (
            <>
              {!addOpen ? (
                <Button type="button" variant="outline" onClick={() => setAddOpen(true)}>
                  {t("dashboard.subjects.addSubject")}
                </Button>
              ) : (
                <form
                  onSubmit={handleAddSubject}
                  className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="space-y-2 min-w-[200px]">
                    <Label htmlFor="new-subject-name">{t("dashboard.subjects.subjectName")}</Label>
                    <Input
                      id="new-subject-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t("dashboard.subjects.subjectNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2 min-w-[200px]">
                    <Label htmlFor="new-subject-desc">{t("dashboard.subjects.subjectDescription")}</Label>
                    <Input
                      id="new-subject-desc"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder={t("dashboard.subjects.subjectDescriptionPlaceholder")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createSubject.isPending}>
                      {createSubject.isPending ? t("dashboard.subjects.creating") : t("dashboard.subjects.create")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setAddOpen(false);
                        setNewName("");
                        setNewDescription("");
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                  {createSubject.error && (
                    <p className="w-full text-sm text-red-600 dark:text-red-400">{createSubject.error.message}</p>
                  )}
                </form>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                {!isLoading && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {total === 0
                      ? t("dashboard.subjectsPage.empty")
                      : t("dashboard.subjects.showingRange", { from, to, total })}
                  </p>
                )}
                {total > 0 && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="subjects-page-size" className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t("dashboard.subjects.perPage")}
                    </Label>
                    <select
                      id="subjects-page-size"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="flex h-9 min-w-[70px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {isLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.loading")}</p>
              ) : subjects.length === 0 && total === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjectsPage.empty")}</p>
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

              {!isLoading && total > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("dashboard.subjects.previousPage")}
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t("dashboard.subjects.pageOf", { page, totalPages })}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {t("dashboard.subjects.nextPage")}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
