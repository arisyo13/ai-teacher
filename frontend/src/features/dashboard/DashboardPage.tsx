import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  type SubjectRow,
} from "@/queries/subjects";
import {
  useClassesQuery,
  useClassesByTeacherQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} from "@/queries/classes";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const teacherId = profile?.role && ["owner", "admin", "teacher"].includes(profile.role) ? user?.id : undefined;

  const { data: subjects = [], isLoading: subjectsLoading } = useSubjectsQuery(teacherId);
  const { data: allClasses = [] } = useClassesByTeacherQuery(teacherId);
  const createSubject = useCreateSubjectMutation();

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    try {
      await createSubject.mutateAsync({
        name: newSubjectName,
        description: newSubjectDescription,
        teacherId,
      });
      setNewSubjectName("");
      setNewSubjectDescription("");
      setAddingSubject(false);
    } catch {
      // Error via createSubject.error
    }
  };

  const totalClasses = allClasses.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.subjects")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectsLoading ? "—" : subjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.classes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectsLoading ? "—" : totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.students")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.subjects.title")}</CardTitle>
          <CardDescription>{t("dashboard.subjects.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!teacherId ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.signInRequired")}</p>
          ) : (
            <>
              {!addingSubject ? (
                <Button type="button" variant="outline" onClick={() => setAddingSubject(true)}>
                  {t("dashboard.subjects.addSubject")}
                </Button>
              ) : (
                <form onSubmit={handleAddSubject} className="flex flex-col gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label htmlFor="new-subject-name">{t("dashboard.subjects.subjectName")}</Label>
                    <Input
                      id="new-subject-name"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder={t("dashboard.subjects.subjectNamePlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-subject-desc">{t("dashboard.subjects.subjectDescription")}</Label>
                    <Input
                      id="new-subject-desc"
                      value={newSubjectDescription}
                      onChange={(e) => setNewSubjectDescription(e.target.value)}
                      placeholder={t("dashboard.subjects.subjectDescriptionPlaceholder")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createSubject.isPending}>
                      {createSubject.isPending ? t("dashboard.subjects.creating") : t("dashboard.subjects.create")}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setAddingSubject(false); setNewSubjectName(""); setNewSubjectDescription(""); }}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                  {createSubject.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{createSubject.error.message}</p>
                  )}
                </form>
              )}

              {subjectsLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.loading")}</p>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.empty")}</p>
              ) : (
                <ul className="space-y-4">
                  {subjects.map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} teacherId={teacherId!} />
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function SubjectCard({ subject, teacherId }: { subject: SubjectRow; teacherId: string }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(subject.name);
  const [editDescription, setEditDescription] = useState(subject.description ?? "");
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const { data: classes = [], isLoading: classesLoading } = useClassesQuery(subject.id);
  const updateSubject = useUpdateSubjectMutation(teacherId);
  const deleteSubject = useDeleteSubjectMutation(teacherId);
  const createClass = useCreateClassMutation(teacherId);
  const updateClass = useUpdateClassMutation(teacherId);
  const deleteClass = useDeleteClassMutation(teacherId);

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSubject.mutateAsync({ id: subject.id, name: editName, description: editDescription });
      setEditing(false);
    } catch {
      // error shown below
    }
  };

  const handleDeleteSubject = () => {
    if (window.confirm(t("dashboard.subjects.confirmDeleteSubject"))) {
      deleteSubject.mutate(subject.id);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClass.mutateAsync({ name: newClassName, subjectId: subject.id });
      setNewClassName("");
      setAddClassOpen(false);
    } catch {
      // error shown below
    }
  };

  return (
    <li className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <form onSubmit={handleSaveSubject} className="flex-1 space-y-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t("dashboard.subjects.subjectNamePlaceholder")}
              required
            />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={t("dashboard.subjects.subjectDescriptionPlaceholder")}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={updateSubject.isPending}>
                {t("dashboard.subjects.save")}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setEditing(false); setEditName(subject.name); setEditDescription(subject.description ?? ""); }}>
                {t("common.cancel")}
              </Button>
            </div>
            {updateSubject.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{updateSubject.error.message}</p>
            )}
          </form>
        ) : (
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{subject.name}</h3>
            {subject.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subject.description}</p>
            )}
          </div>
        )}
        {!editing && (
          <div className="flex gap-1 shrink-0">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
              {t("dashboard.subjects.edit")}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-red-600 dark:text-red-400" onClick={handleDeleteSubject}>
              {t("dashboard.subjects.delete")}
            </Button>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("dashboard.classes.title")}</p>
        {!addClassOpen ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setAddClassOpen(true)}>
            {t("dashboard.classes.addClass")}
          </Button>
        ) : (
          <form onSubmit={handleAddClass} className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor={`class-name-${subject.id}`} className="text-xs">{t("dashboard.classes.className")}</Label>
              <Input
                id={`class-name-${subject.id}`}
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder={t("dashboard.classes.classNamePlaceholder")}
                className="h-8 w-48"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={createClass.isPending}>
              {createClass.isPending ? t("dashboard.classes.creating") : t("dashboard.classes.create")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setAddClassOpen(false); setNewClassName(""); }}>
              {t("common.cancel")}
            </Button>
            {createClass.error && (
              <p className="text-sm text-red-600 dark:text-red-400 w-full">{createClass.error.message}</p>
            )}
          </form>
        )}

        {classesLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t("dashboard.subjects.loading")}</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t("dashboard.classes.empty")}</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {classes.map((c) => (
              <ClassItem
                key={c.id}
                classRow={c}
                onUpdate={updateClass.mutateAsync}
                onDelete={() => window.confirm(t("dashboard.classes.confirmDeleteClass")) && deleteClass.mutate({ id: c.id, subjectId: subject.id })}
                t={t}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function ClassItem({
  classRow,
  onUpdate,
  onDelete,
  t,
}: {
  classRow: { id: string; name: string; subject_id: string };
  onUpdate: (v: { id: string; subjectId: string; name: string }) => Promise<unknown>;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(classRow.name);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ id: classRow.id, subjectId: classRow.subject_id, name: name.trim() });
    setEditing(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-slate-50 dark:bg-slate-800/50">
      {editing ? (
        <form onSubmit={handleSave} className="flex items-center gap-2 flex-1 min-w-0">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 flex-1 min-w-0"
            required
          />
          <Button type="submit" size="sm"> {t("dashboard.subjects.save")}</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setEditing(false); setName(classRow.name); }}>{t("common.cancel")}</Button>
        </form>
      ) : (
        <>
          <span className="text-sm truncate">{classRow.name}</span>
          <div className="flex gap-1 shrink-0">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>{t("dashboard.subjects.edit")}</Button>
            <Button type="button" variant="ghost" size="sm" className="text-red-600 dark:text-red-400" onClick={onDelete}>{t("dashboard.subjects.delete")}</Button>
          </div>
        </>
      )}
    </li>
  );
}
