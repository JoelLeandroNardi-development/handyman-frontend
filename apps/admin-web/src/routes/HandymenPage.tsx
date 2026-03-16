import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminDeleteHandyman,
  adminUpdateHandyman,
  createHandyman,
  getHandyman,
  listHandymen,
  type HandymanResponse,
} from "@smart/api";
import { PAGINATION_DEFAULTS } from "@smart/core";
import { createApiClient } from "../lib/api";
import { formatDateTime } from "../lib/adminFormat";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

type HandymanDraft = {
  email: string;
  skills: string;
  years_experience: string;
  service_radius_km: string;
  latitude: string;
  longitude: string;
};

const emptyDraft: HandymanDraft = {
  email: "",
  skills: "",
  years_experience: "",
  service_radius_km: "",
  latitude: "",
  longitude: "",
};

function skillsToArray(value: string) {
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function HandymenPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<HandymanDraft>(emptyDraft);
  const [actionBusy, setActionBusy] = useState("");

  const listQ = useQuery({
    queryKey: ["admin-handymen"],
    queryFn: () => listHandymen(api, { limit: PAGINATION_DEFAULTS.LIMIT_LARGE, offset: PAGINATION_DEFAULTS.OFFSET }),
  });

  const detailQ = useQuery({
    queryKey: ["admin-handyman", selectedEmail],
    queryFn: () => getHandyman(api, selectedEmail!),
    enabled: !!selectedEmail,
  });

  const rows = (listQ.data ?? []).filter((row) =>
    search.trim()
      ? `${row.email} ${(row.skills ?? []).join(" ")}`.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const selected =
    (detailQ.data as HandymanResponse | undefined) ?? rows.find((row) => row.email === selectedEmail);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      email: selected.email ?? "",
      skills: (selected.skills ?? []).join(", "),
      years_experience: selected.years_experience != null ? String(selected.years_experience) : "",
      service_radius_km: selected.service_radius_km != null ? String(selected.service_radius_km) : "",
      latitude: selected.latitude != null ? String(selected.latitude) : "",
      longitude: selected.longitude != null ? String(selected.longitude) : "",
    });
  }, [
    selected?.email,
    selected?.skills,
    selected?.years_experience,
    selected?.service_radius_km,
    selected?.latitude,
    selected?.longitude,
  ]);

  function patchDraft<K extends keyof HandymanDraft>(key: K, value: HandymanDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function refreshAll() {
    await listQ.refetch();
    if (selectedEmail) {
      await detailQ.refetch();
    }
  }

  async function handleCreate() {
    setActionBusy("create");
    try {
      await createHandyman(api, {
        email: draft.email,
        skills: skillsToArray(draft.skills),
        years_experience: Number(draft.years_experience || 0),
        service_radius_km: Number(draft.service_radius_km || 0),
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
      await adminUpdateHandyman(api, selectedEmail, {
        skills: skillsToArray(draft.skills),
        years_experience: Number(draft.years_experience || 0),
        service_radius_km: Number(draft.service_radius_km || 0),
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
    const ok = window.confirm(`Delete handyman ${selectedEmail}?`);
    if (!ok) return;

    setActionBusy("delete");
    try {
      await adminDeleteHandyman(api, selectedEmail);
      setSelectedEmail(null);
      await listQ.refetch();
    } finally {
      setActionBusy("");
    }
  }

  const columns: DataTableColumn<HandymanResponse>[] = [
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
      key: "skills",
      header: "Skills",
      render: (row) => (
        <span>{row.skills?.length ? row.skills.join(", ") : "-"}</span>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      width: 120,
      render: (row) => <span>{row.years_experience ?? "-"}</span>,
    },
    {
      key: "radius",
      header: "Radius",
      width: 120,
      render: (row) => <span>{row.service_radius_km ?? "-"} km</span>,
    },
    {
      key: "created_at",
      header: "Created",
      width: 180,
      render: (row) => <span>{formatDateTime(row.created_at)}</span>,
    },
  ];

  return (
    <Page title="Handymen" subtitle="Create, inspect, update, and delete handyman profiles">
      <Card title="Toolbar">
        <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <label className="app-label" style={{ flex: 1 }}>
            <span>Search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or skills" />
          </label>

          <button
            onClick={() => {
              setDraft(emptyDraft);
              setCreateOpen(true);
            }}
            className="app-button app-button-primary"
          >
            Create handyman
          </button>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Handymen" right={listQ.isFetching ? "Refreshing…" : `${rows.length} handymen`}>
        <DataTable rows={rows} columns={columns} emptyText="No handymen found." />
      </Card>

      <OverlayPanel open={!!selectedEmail} title={selectedEmail ?? "Handyman"} onClose={() => setSelectedEmail(null)}>
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Details">
            <div style={{ display: "grid", gap: 12 }}>
              <label className="app-label">
                <span>Email</span>
                <input value={draft.email} disabled />
              </label>

              <label className="app-label">
                <span>Skills</span>
                <input
                  value={draft.skills}
                  onChange={(e) => patchDraft("skills", e.target.value)}
                  placeholder="comma,separated,skill_keys"
                />
              </label>

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <label className="app-label">
                  <span>Years experience</span>
                  <input
                    value={draft.years_experience}
                    onChange={(e) => patchDraft("years_experience", e.target.value)}
                  />
                </label>

                <label className="app-label">
                  <span>Service radius km</span>
                  <input
                    value={draft.service_radius_km}
                    onChange={(e) => patchDraft("service_radius_km", e.target.value)}
                  />
                </label>
              </div>

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

              <button onClick={handleSave} disabled={actionBusy !== ""} className="app-button app-button-primary">
                {actionBusy === "save" ? "Saving…" : "Save handyman"}
              </button>
            </div>
          </Card>

          <Card title="Danger zone">
            <button onClick={handleDelete} disabled={actionBusy !== ""} className="app-button app-button-danger">
              {actionBusy === "delete" ? "Deleting…" : "Delete handyman"}
            </button>
          </Card>
        </div>
      </OverlayPanel>

      <OverlayPanel open={createOpen} title="Create handyman" onClose={() => setCreateOpen(false)} width={520}>
        <div style={{ display: "grid", gap: 12 }}>
          <label className="app-label">
            <span>Email</span>
            <input value={draft.email} onChange={(e) => patchDraft("email", e.target.value)} />
          </label>

          <label className="app-label">
            <span>Skills</span>
            <input
              value={draft.skills}
              onChange={(e) => patchDraft("skills", e.target.value)}
              placeholder="comma,separated,skill_keys"
            />
          </label>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label className="app-label">
              <span>Years experience</span>
              <input value={draft.years_experience} onChange={(e) => patchDraft("years_experience", e.target.value)} />
            </label>

            <label className="app-label">
              <span>Service radius km</span>
              <input value={draft.service_radius_km} onChange={(e) => patchDraft("service_radius_km", e.target.value)} />
            </label>
          </div>

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

          <button onClick={handleCreate} disabled={actionBusy !== ""} className="app-button app-button-success">
            {actionBusy === "create" ? "Creating…" : "Create handyman"}
          </button>
        </div>
      </OverlayPanel>
    </Page>
  );
}