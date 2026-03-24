import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminDeleteUser,
  adminListUsers,
  adminUpdateUser,
  createUser,
  getUser,
  type UserResponse,
} from "@smart/api";
import { PAGINATION_DEFAULTS } from "@smart/core";
import { useAdminApiClient, useActionBusy } from "../lib/api";
import { formatDateTime } from "../lib/adminFormat";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

type UserDraft = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  latitude: string;
  longitude: string;
};

const emptyDraft: UserDraft = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  latitude: "",
  longitude: "",
};

export default function UsersPage() {
  const api = useAdminApiClient();
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const { busy, is, run } = useActionBusy();

  const listQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminListUsers(api, { limit: PAGINATION_DEFAULTS.LIMIT_LARGE, offset: PAGINATION_DEFAULTS.OFFSET }),
  });

  const detailQ = useQuery({
    queryKey: ["admin-user", selectedEmail],
    queryFn: () => getUser(api, selectedEmail!),
    enabled: !!selectedEmail,
  });

  const rows = (listQ.data ?? []).filter((row) =>
    search.trim()
      ? `${row.email} ${row.first_name ?? ""} ${row.last_name ?? ""}`.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const selected = (detailQ.data as UserResponse | undefined) ?? rows.find((row) => row.email === selectedEmail);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      email: selected.email ?? "",
      first_name: selected.first_name ?? "",
      last_name: selected.last_name ?? "",
      phone: selected.phone ?? "",
      latitude: selected.latitude != null ? String(selected.latitude) : "",
      longitude: selected.longitude != null ? String(selected.longitude) : "",
    });
  }, [selected?.email, selected?.first_name, selected?.last_name, selected?.phone, selected?.latitude, selected?.longitude]);

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
    await run("create", async () => {
      await createUser(api, {
        email: draft.email,
        first_name: draft.first_name || null,
        last_name: draft.last_name || null,
        phone: draft.phone || null,
        latitude: draft.latitude ? Number(draft.latitude) : null,
        longitude: draft.longitude ? Number(draft.longitude) : null,
      });
      setCreateOpen(false);
      setDraft(emptyDraft);
      await listQ.refetch();
    });
  }

  async function handleSave() {
    if (!selectedEmail) return;
    await run("save", async () => {
      await adminUpdateUser(api, selectedEmail, {
        first_name: draft.first_name || null,
        last_name: draft.last_name || null,
        phone: draft.phone || null,
        latitude: draft.latitude ? Number(draft.latitude) : null,
        longitude: draft.longitude ? Number(draft.longitude) : null,
      });
      await refreshAll();
    });
  }

  async function handleDelete() {
    if (!selectedEmail) return;
    const ok = window.confirm(`Delete user ${selectedEmail}?`);
    if (!ok) return;
    await run("delete", async () => {
      await adminDeleteUser(api, selectedEmail);
      setSelectedEmail(null);
      await listQ.refetch();
    });
  }

  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <button onClick={() => setSelectedEmail(row.email)} className="app-link-button">
          {row.email}
        </button>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (row) => <span>{row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.first_name || row.last_name || "-"}</span>,
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
          <label className="app-label" style={{ flex: 1 }}>
            <span>Search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or full name" />
          </label>

          <button
            onClick={() => {
              setDraft(emptyDraft);
              setCreateOpen(true);
            }}
            className="app-button app-button-primary"
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
              <label className="app-label">
                <span>Email</span>
                <input value={draft.email} disabled />
              </label>

              <label className="app-label">
                <span>First name</span>
                <input value={draft.first_name} onChange={(e) => patchDraft("first_name", e.target.value)} />
              </label>

              <label className="app-label">
                <span>Last name</span>
                <input value={draft.last_name} onChange={(e) => patchDraft("last_name", e.target.value)} />
              </label>

              <label className="app-label">
                <span>Phone</span>
                <input value={draft.phone} onChange={(e) => patchDraft("phone", e.target.value)} />
              </label>

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <label className="app-label">
                  <span>Latitude</span>
                  <input value={draft.latitude} onChange={(e) => patchDraft("latitude", e.target.value)} />
                </label>

                <label className="app-label">
                  <span>Longitude</span>
                  <input value={draft.longitude} onChange={(e) => patchDraft("longitude", e.target.value)} />
                </label>
              </div>

              <button onClick={handleSave} disabled={busy} className="app-button app-button-primary">
                {is("save") ? "Saving…" : "Save user"}
              </button>
            </div>
          </Card>

          <Card title="Danger zone">
            <button onClick={handleDelete} disabled={busy} className="app-button app-button-danger">
              {is("delete") ? "Deleting…" : "Delete user"}
            </button>
          </Card>
        </div>
      </OverlayPanel>

      <OverlayPanel open={createOpen} title="Create user" onClose={() => setCreateOpen(false)} width={480}>
        <div style={{ display: "grid", gap: 16 }}>
          <label className="app-label">
            <span>Email</span>
            <input value={draft.email} onChange={(e) => patchDraft("email", e.target.value)} />
          </label>

          <label className="app-label">
            <span>First name</span>
            <input value={draft.first_name} onChange={(e) => patchDraft("first_name", e.target.value)} />
          </label>

          <label className="app-label">
            <span>Last name</span>
            <input value={draft.last_name} onChange={(e) => patchDraft("last_name", e.target.value)} />
          </label>

          <label className="app-label">
            <span>Phone</span>
            <input value={draft.phone} onChange={(e) => patchDraft("phone", e.target.value)} />
          </label>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label className="app-label">
              <span>Latitude</span>
              <input value={draft.latitude} onChange={(e) => patchDraft("latitude", e.target.value)} />
            </label>

            <label className="app-label">
              <span>Longitude</span>
              <input value={draft.longitude} onChange={(e) => patchDraft("longitude", e.target.value)} />
            </label>
          </div>

          <button onClick={handleCreate} disabled={busy} className="app-button app-button-success">
            {is("create") ? "Creating…" : "Create user"}
          </button>
        </div>
      </OverlayPanel>
    </Page>
  );
}