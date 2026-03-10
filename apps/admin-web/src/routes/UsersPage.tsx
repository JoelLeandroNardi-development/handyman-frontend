import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminDeleteUser,
  adminListUsers,
  adminUpdateUser,
  createUser,
  getUser,
  type UserResponse,
} from "@smart/api";
import { createApiClient } from "../lib/api";
import { formatDateTime } from "../lib/adminFormat";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

type UserDraft = {
  email: string;
  full_name: string;
  latitude: string;
  longitude: string;
};

const emptyDraft: UserDraft = {
  email: "",
  full_name: "",
  latitude: "",
  longitude: "",
};

export default function UsersPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [actionBusy, setActionBusy] = useState("");

  const listQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminListUsers(api, { limit: 200, offset: 0 }),
  });

  const detailQ = useQuery({
    queryKey: ["admin-user", selectedEmail],
    queryFn: () => getUser(api, selectedEmail!),
    enabled: !!selectedEmail,
  });

  const rows = (listQ.data ?? []).filter((row) =>
    search.trim()
      ? `${row.email} ${row.full_name ?? ""}`.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const selected = (detailQ.data as UserResponse | undefined) ?? rows.find((row) => row.email === selectedEmail);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      email: selected.email ?? "",
      full_name: selected.full_name ?? "",
      latitude: selected.latitude != null ? String(selected.latitude) : "",
      longitude: selected.longitude != null ? String(selected.longitude) : "",
    });
  }, [selected?.email, selected?.full_name, selected?.latitude, selected?.longitude]);

  async function refreshAll() {
    await listQ.refetch();
    if (selectedEmail) {
      await detailQ.refetch();
    }
  }

  function patchDraft<K extends keyof UserDraft>(key: K, value: UserDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setActionBusy("create");
    try {
      await createUser(api, {
        email: draft.email,
        full_name: draft.full_name || null,
        latitude: draft.latitude ? Number(draft.latitude) : null,
        longitude: draft.longitude ? Number(draft.longitude) : null,
      });
      setCreateOpen(false);
      setDraft(emptyDraft);
      await listQ.refetch();
    } finally {
      setActionBusy("");
    }
  }

  async function handleSave() {
    if (!selectedEmail) return;

    setActionBusy("save");
    try {
      await adminUpdateUser(api, selectedEmail, {
        full_name: draft.full_name || null,
        latitude: draft.latitude ? Number(draft.latitude) : null,
        longitude: draft.longitude ? Number(draft.longitude) : null,
      });
      await refreshAll();
    } finally {
      setActionBusy("");
    }
  }

  async function handleDelete() {
    if (!selectedEmail) return;
    const ok = window.confirm(`Delete user ${selectedEmail}?`);
    if (!ok) return;

    setActionBusy("delete");
    try {
      await adminDeleteUser(api, selectedEmail);
      setSelectedEmail(null);
      await listQ.refetch();
    } finally {
      setActionBusy("");
    }
  }

  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <button
          onClick={() => setSelectedEmail(row.email)}
          style={{ background: "transparent", padding: 0, color: "#1d4ed8", fontWeight: 700, cursor: "pointer" }}
        >
          {row.email}
        </button>
      ),
    },
    {
      key: "full_name",
      header: "Full name",
      render: (row) => <span>{row.full_name ?? "-"}</span>,
    },
    {
      key: "location",
      header: "Location",
      render: (row) => (
        <span>
          {row.latitude != null && row.longitude != null ? `${row.latitude}, ${row.longitude}` : "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      width: 180,
      render: (row) => <span>{formatDateTime(row.created_at)}</span>,
    },
  ];

  return (
    <Page title="Users" subtitle="Create, inspect, update, and delete users">
      <Card title="Toolbar">
        <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <label style={{ flex: 1, display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or full name" />
          </label>

          <button
            onClick={() => {
              setDraft(emptyDraft);
              setCreateOpen(true);
            }}
            style={{
              padding: "11px 14px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              height: 44,
            }}
          >
            Create user
          </button>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Users" right={listQ.isFetching ? "Refreshing…" : `${rows.length} users`}>
        <DataTable rows={rows} columns={columns} emptyText="No users found." />
      </Card>

      <OverlayPanel open={!!selectedEmail} title={selectedEmail ?? "User"} onClose={() => setSelectedEmail(null)}>
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Details">
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Email</span>
                <input value={draft.email} disabled />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Full name</span>
                <input value={draft.full_name} onChange={(e) => patchDraft("full_name", e.target.value)} />
              </label>

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Latitude</span>
                  <input value={draft.latitude} onChange={(e) => patchDraft("latitude", e.target.value)} />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Longitude</span>
                  <input value={draft.longitude} onChange={(e) => patchDraft("longitude", e.target.value)} />
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={actionBusy !== ""}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {actionBusy === "save" ? "Saving…" : "Save user"}
              </button>
            </div>
          </Card>

          <Card title="Danger zone">
            <button
              onClick={handleDelete}
              disabled={actionBusy !== ""}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {actionBusy === "delete" ? "Deleting…" : "Delete user"}
            </button>
          </Card>
        </div>
      </OverlayPanel>

      <OverlayPanel open={createOpen} title="Create user" onClose={() => setCreateOpen(false)} width={480}>
        <div style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Email</span>
            <input value={draft.email} onChange={(e) => patchDraft("email", e.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Full name</span>
            <input value={draft.full_name} onChange={(e) => patchDraft("full_name", e.target.value)} />
          </label>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Latitude</span>
              <input value={draft.latitude} onChange={(e) => patchDraft("latitude", e.target.value)} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Longitude</span>
              <input value={draft.longitude} onChange={(e) => patchDraft("longitude", e.target.value)} />
            </label>
          </div>

          <button
            onClick={handleCreate}
            disabled={actionBusy !== ""}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "#16a34a",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {actionBusy === "create" ? "Creating…" : "Create user"}
          </button>
        </div>
      </OverlayPanel>
    </Page>
  );
}