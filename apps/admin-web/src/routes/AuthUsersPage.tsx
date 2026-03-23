import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminDeleteAuthUser,
  adminListAuthUsers,
  adminUpdateAuthUser,
  type AuthUserResponse,
  type UpdateAuthUser,
} from "@smart/api";
import { PAGINATION_DEFAULTS } from "@smart/core";
import { createApiClient } from "../lib/api";
import { formatDateTime } from "../lib/adminFormat";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

type AuthUserDraft = {
  password: string;
  roles: string;
};

const emptyDraft: AuthUserDraft = {
  password: "",
  roles: "",
};

export default function AuthUsersPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<AuthUserDraft>(emptyDraft);
  const [actionBusy, setActionBusy] = useState("");

  const listQ = useQuery({
    queryKey: ["admin-auth-users"],
    queryFn: () =>
      adminListAuthUsers(api, {
        limit: PAGINATION_DEFAULTS.LIMIT_LARGE,
        offset: PAGINATION_DEFAULTS.OFFSET,
      }),
  });

  const rows = (listQ.data ?? []).filter((row) =>
    search.trim()
      ? `${row.email} ${row.roles.join(", ")}`.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const selected = rows.find((row) => row.id === selectedId);

  useEffect(() => {
    if (!selected) {
      setDraft(emptyDraft);
      return;
    }
    setDraft({
      password: "",
      roles: selected.roles.join(","),
    });
  }, [selected?.id, selected?.roles]);

  async function refreshAll() {
    await listQ.refetch();
  }

  function patchDraft<K extends keyof AuthUserDraft>(key: K, value: AuthUserDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!selected) return;

    setActionBusy("save");
    try {
      const body: UpdateAuthUser = {};
      if (draft.password) {
        body.password = draft.password;
      }
      if (draft.roles) {
        body.roles = draft.roles.split(",").map((r) => r.trim());
      }
      await adminUpdateAuthUser(api, selected.id, body);
      await refreshAll();
      setSelectedId(null);
    } finally {
      setActionBusy("");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    const ok = window.confirm(`Delete auth user ${selected.email}?`);
    if (!ok) return;

    setActionBusy("delete");
    try {
      await adminDeleteAuthUser(api, selected.id);
      setSelectedId(null);
      await listQ.refetch();
    } finally {
      setActionBusy("");
    }
  }

  const columns: DataTableColumn<AuthUserResponse>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <button onClick={() => setSelectedId(row.id)} className="app-link-button">
          {row.email}
        </button>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (row) => <span>{row.roles.join(", ") || "-"}</span>,
    },
    {
      key: "is_email_verified",
      header: "Email Verified",
      render: (row) => (
        <span
          style={{
            background: row.is_email_verified ? "var(--success-soft)" : "var(--warning-soft)",
            color: row.is_email_verified ? "var(--success)" : "var(--warning)",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {row.is_email_verified ? "✓ Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "auth_provider",
      header: "Provider",
      width: 100,
      render: (row) => (
        <span style={{ fontSize: 12, textTransform: "capitalize" }}>{row.auth_provider || "local"}</span>
      ),
    },
    {
      key: "last_login_at",
      header: "Last Login",
      width: 180,
      render: (row) => <span>{row.last_login_at ? formatDateTime(row.last_login_at) : "-"}</span>,
    },
  ];

  return (
    <Page title="Auth Users" subtitle="Manage authentication users, roles, and security">
      <Card title="Toolbar">
        <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <label className="app-label" style={{ flex: 1 }}>
            <span>Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or roles"
            />
          </label>

          <button
            onClick={() => listQ.refetch()}
            className="app-button"
            disabled={listQ.isFetching}
          >
            {listQ.isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Auth Users" right={listQ.isFetching ? "Refreshing…" : `${rows.length} users`}>
        <DataTable rows={rows} columns={columns} emptyText="No auth users found." />
      </Card>

      <OverlayPanel open={!!selectedId} title={selected?.email ?? "Auth User"} onClose={() => setSelectedId(null)}>
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="User Info">
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selected?.email}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Auth Provider</div>
                <div style={{ fontSize: 14, textTransform: "capitalize" }}>
                  {selected?.auth_provider || "local"}
                </div>
              </div>

              {selected?.google_sub && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Google Sub</div>
                  <div style={{ fontSize: 13, fontFamily: "monospace", wordBreak: "break-all" }}>
                    {selected.google_sub}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Email Verified</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: selected?.is_email_verified ? "var(--success)" : "var(--warning)",
                  }}
                >
                  {selected?.is_email_verified ? "✓ Verified" : "Pending verification"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Last Login</div>
                <div style={{ fontSize: 14 }}>
                  {selected?.last_login_at ? formatDateTime(selected.last_login_at) : "Never"}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Edit">
            <div style={{ display: "grid", gap: 12 }}>
              <label className="app-label">
                <span>Password (leave blank to keep current)</span>
                <input
                  type="password"
                  value={draft.password}
                  onChange={(e) => patchDraft("password", e.target.value)}
                  placeholder="Enter new password"
                />
              </label>

              <label className="app-label">
                <span>Roles (comma-separated)</span>
                <input
                  value={draft.roles}
                  onChange={(e) => patchDraft("roles", e.target.value)}
                  placeholder="e.g. admin, moderator"
                />
              </label>

              <button
                onClick={handleSave}
                disabled={actionBusy !== ""}
                className="app-button app-button-primary"
              >
                {actionBusy === "save" ? "Saving…" : "Save changes"}
              </button>
            </div>
          </Card>

          <Card title="Danger Zone">
            <button
              onClick={handleDelete}
              disabled={actionBusy !== ""}
              className="app-button app-button-danger"
            >
              {actionBusy === "delete" ? "Deleting…" : "Delete user"}
            </button>
          </Card>
        </div>
      </OverlayPanel>
    </Page>
  );
}
