import { Fragment, useCallback, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isOwner } from "@/queries/auth";
import type { Role } from "@/queries/auth";
import { useCreateInviteMutation, sendInviteEmail } from "@/queries/invites";
import { useAllProfilesWithEmailQuery, useUpdateUserProfileMutation, type ProfileWithEmail } from "@/queries/users";
import { formatDate } from "@/services/time";

const roleKey = (role: Role): "roleOwner" | "roleAdmin" | "roleTeacher" | "roleStudent" => {
  switch (role) {
    case "owner": return "roleOwner";
    case "admin": return "roleAdmin";
    case "teacher": return "roleTeacher";
    default: return "roleStudent";
  }
};

const ROLES: Role[] = ["owner", "admin", "teacher", "student"];

type SortKey = "email" | "first_name" | "last_name" | "birth_date" | "role";
type SortDir = "asc" | "desc";

function filterAndSortUsers(
  users: ProfileWithEmail[],
  searchQuery: string,
  roleFilter: Role | "",
  sortKey: SortKey,
  sortDir: SortDir
): ProfileWithEmail[] {
  const q = searchQuery.trim().toLowerCase();
  let list = users;
  if (q) {
    list = list.filter(
      (u) =>
        (u.email?.toLowerCase().includes(q) ?? false) ||
        (u.first_name?.toLowerCase().includes(q) ?? false) ||
        (u.last_name?.toLowerCase().includes(q) ?? false)
    );
  }
  if (roleFilter) {
    list = list.filter((u) => u.role === roleFilter);
  }
  const dir = sortDir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    let aVal: string | null = null;
    let bVal: string | null = null;
    if (sortKey === "email") {
      aVal = a.email ?? "";
      bVal = b.email ?? "";
    } else if (sortKey === "first_name") {
      aVal = a.first_name ?? "";
      bVal = b.first_name ?? "";
    } else if (sortKey === "last_name") {
      aVal = a.last_name ?? "";
      bVal = b.last_name ?? "";
    } else if (sortKey === "birth_date") {
      aVal = a.birth_date ?? "";
      bVal = b.birth_date ?? "";
    } else {
      aVal = a.role;
      bVal = b.role;
    }
    const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
    return dir * cmp;
  });
}

export const UsersPage: FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const owner = isOwner(profile?.role);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("email");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useAllProfilesWithEmailQuery(!!owner);
  const updateProfile = useUpdateUserProfileMutation();
  const createInvite = useCreateInviteMutation();

  const [inviteEmail, setInviteEmail] = useState("");
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [lastInviteEmail, setLastInviteEmail] = useState<string | null>(null);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const filteredAndSortedUsers = useMemo(
    () => filterAndSortUsers(users, searchQuery, roleFilter, sortKey, sortDir),
    [users, searchQuery, roleFilter, sortKey, sortDir]
  );

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey]);

  const columns = useMemo<ColumnDef<ProfileWithEmail>[]>(
    () => [
      {
        accessorKey: "email",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("email")}
            className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            {t("account.profile.email")}
            {sortKey === "email" && <span className="text-xs" aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ),
        cell: ({ getValue }) => <span className="text-slate-900 dark:text-slate-100">{getValue() as string ?? "—"}</span>,
      },
      {
        accessorKey: "first_name",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("first_name")}
            className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            {t("account.profile.firstName")}
            {sortKey === "first_name" && <span className="text-xs" aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ),
        cell: ({ getValue }) => <span className="text-slate-900 dark:text-slate-100">{getValue() as string ?? "—"}</span>,
      },
      {
        accessorKey: "last_name",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("last_name")}
            className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            {t("account.profile.lastName")}
            {sortKey === "last_name" && <span className="text-xs" aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ),
        cell: ({ getValue }) => <span className="text-slate-900 dark:text-slate-100">{getValue() as string ?? "—"}</span>,
      },
      {
        accessorKey: "birth_date",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("birth_date")}
            className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            {t("account.profile.birthDate")}
            {sortKey === "birth_date" && <span className="text-xs" aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ),
        cell: ({ getValue }) => {
          const raw = getValue() as string | null;
          const display = raw
            ? formatDate(raw.includes("T") ? raw : `${raw}T00:00:00`)
            : "—";
          return <span className="text-slate-900 dark:text-slate-100">{display}</span>;
        },
      },
      {
        accessorKey: "role",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("role")}
            className="hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            {t("account.profile.role")}
            {sortKey === "role" && <span className="text-xs" aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-slate-900 dark:text-slate-100">{t(`account.profile.${roleKey(getValue() as Role)}`)}</span>
        ),
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(row.original.id)}>
            {t("dashboard.subjects.edit")}
          </Button>
        ),
      },
    ],
    [t, sortKey, sortDir, handleSort]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable refs; safe for our usage
  const table = useReactTable({
    data: filteredAndSortedUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!owner) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.users.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t("admin.users.subtitle")}</p>
      </div>

      {owner && profile?.institution_id && (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.inviteTeacher.title")}</CardTitle>
            <CardDescription>{t("admin.inviteTeacher.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!inviteEmail.trim() || !profile?.institution_id) return;
                setLastInviteLink(null);
                setLastInviteEmail(null);
                setEmailSendError(null);
                const email = inviteEmail.trim();
                try {
                  const { token, inviteLink } = await createInvite.mutateAsync({
                    email,
                    institutionId: profile.institution_id,
                    role: "teacher",
                  });
                  setLastInviteLink(inviteLink);
                  setLastInviteEmail(email);
                  setInviteEmail("");
                  try {
                    await sendInviteEmail(token);
                  } catch (err) {
                    setEmailSendError(err instanceof Error ? err.message : String(err));
                  }
                } catch {
                  // Error via createInvite.error
                }
              }}
              className="flex flex-wrap items-end gap-4"
            >
              <div className="space-y-2 min-w-[200px] flex-1 max-w-sm">
                <Label htmlFor="invite-email">{t("admin.inviteTeacher.emailLabel")}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder={t("admin.inviteTeacher.emailPlaceholder")}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={createInvite.isPending}>
                {createInvite.isPending ? t("admin.inviteTeacher.submitting") : t("admin.inviteTeacher.submit")}
              </Button>
            </form>
            {createInvite.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{createInvite.error.message}</p>
            )}
            {lastInviteLink && (
              <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                {emailSendError ? (
                  <>
                    <p className="text-sm text-amber-600 dark:text-amber-400">{t("admin.inviteTeacher.emailSendFailed")}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t("admin.inviteTeacher.success")}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("admin.inviteTeacher.successEmailSent", { email: lastInviteEmail ?? "" })}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <code className="flex-1 min-w-0 break-all text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded">
                    {lastInviteLink}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(lastInviteLink!);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                  >
                    {copySuccess ? t("admin.inviteTeacher.copied") : t("admin.inviteTeacher.copyLink")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users.cardTitle")}</CardTitle>
          <CardDescription>{t("admin.users.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px] flex-1 max-w-sm">
              <Label htmlFor="users-search" className="sr-only">
                {t("admin.users.search")}
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="users-search"
                  type="search"
                  placeholder={t("admin.users.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon align="inline-start">
                  <Icon name="search" size={18} className="text-slate-500 dark:text-slate-400" />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="users-role-filter" className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {t("admin.users.filterByRole")}
              </Label>
              <select
                id="users-role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter((e.target.value || "") as Role | "")}
                className="flex h-9 min-w-[120px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1 text-sm"
              >
                <option value="">{t("admin.users.allRoles")}</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(`account.profile.${roleKey(r)}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isLoading && users.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("admin.users.showingCount", { count: filteredAndSortedUsers.length, total: users.length })}
            </p>
          )}

          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.subjects.loading")}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.users.empty")}</p>
          ) : (
            <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className={header.id === "actions" ? "w-[100px]" : undefined}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500 dark:text-slate-400">
                        {t("admin.users.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <Fragment key={row.id}>
                        <TableRow>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {editingId === row.original.id && (
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell colSpan={6}>
                              <EditUserForm
                                user={row.original}
                                onUpdate={updateProfile.mutateAsync}
                                onCancel={() => setEditingId(null)}
                                roleKey={roleKey}
                                t={t}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface EditUserFormProps {
  user: ProfileWithEmail;
  onUpdate: (params: {
    id: string;
    role: Role;
    first_name: string | null;
    last_name: string | null;
    birth_date: string | null;
  }) => Promise<unknown>;
  onCancel: () => void;
  roleKey: (r: Role) => string;
  t: (key: string) => string;
}

const EditUserForm: FC<EditUserFormProps> = ({ user, onUpdate, onCancel, roleKey, t }) => {
  const [role, setRole] = useState<Role>(user.role);
  const [firstName, setFirstName] = useState(user.first_name ?? "");
  const [lastName, setLastName] = useState(user.last_name ?? "");
  const [birthDate, setBirthDate] = useState(user.birth_date ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await onUpdate({
        id: user.id,
        role,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        birth_date: birthDate.trim() || null,
      });
      onCancel();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancel = () => {
    setSaveError(null);
    setRole(user.role);
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setBirthDate(user.birth_date ?? "");
    onCancel();
  };

  return (
    <form onSubmit={handleSave} className="flex flex-wrap items-end gap-4">
      <div className="space-y-1 min-w-[140px]">
        <Label className="text-xs">{t("account.profile.firstName")}</Label>
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-8" />
      </div>
      <div className="space-y-1 min-w-[140px]">
        <Label className="text-xs">{t("account.profile.lastName")}</Label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-8" />
      </div>
      <div className="space-y-1 min-w-[140px]">
        <Label className="text-xs">{t("account.profile.birthDate")}</Label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="h-8"
        />
      </div>
      <div className="space-y-1 min-w-[120px]">
        <Label className="text-xs">{t("account.profile.role")}</Label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="flex h-8 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`account.profile.${roleKey(r)}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">{t("account.profile.save")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
          {t("common.cancel")}
        </Button>
      </div>
      {saveError && <p className="w-full text-sm text-red-600 dark:text-red-400">{saveError}</p>}
    </form>
  );
};
