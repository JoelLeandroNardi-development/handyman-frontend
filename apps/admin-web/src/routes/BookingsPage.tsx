import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminDeleteBooking,
  adminListBookings,
  adminUpdateBooking,
  cancelBooking,
  confirmBooking,
  getBooking,
} from "@smart/api";
import { BOOKING_STATUS, PAGINATION_DEFAULTS } from "@smart/core";
import { createApiClient } from "../lib/api";
import { formatDateTime, getStatusTone } from "../lib/adminFormat";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

type AnyBooking = {
  booking_id?: string;
  status?: string;
  user_email?: string;
  handyman_email?: string;
  desired_start?: string;
  desired_end?: string;
  failure_reason?: string | null;
  cancellation_reason?: string | null;
};

const STATUS_OPTIONS = ["", BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.FAILED, BOOKING_STATUS.CANCELLED];

export default function BookingsPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);

  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [handymanEmail, setHandymanEmail] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editFailureReason, setEditFailureReason] = useState("");
  const [editCancellationReason, setEditCancellationReason] = useState("");
  const [actionBusy, setActionBusy] = useState("");

  const listQ = useQuery({
    queryKey: ["admin-bookings", status, userEmail, handymanEmail],
    queryFn: () =>
      adminListBookings(api, {
        limit: PAGINATION_DEFAULTS.LIMIT_SMALL,
        offset: PAGINATION_DEFAULTS.OFFSET,
        status: status || undefined,
        user_email: userEmail || undefined,
        handyman_email: handymanEmail || undefined,
      }),
  });

  const detailQ = useQuery({
    queryKey: ["admin-booking", selectedId],
    queryFn: () => getBooking(api, selectedId!),
    enabled: !!selectedId,
  });

  const rows: AnyBooking[] = Array.isArray(listQ.data) ? (listQ.data as AnyBooking[]) : [];
  const selected = (detailQ.data as AnyBooking | undefined) ?? rows.find((row) => row.booking_id === selectedId);

  useEffect(() => {
    if (!selected) return;
    setEditStatus(selected.status ?? "");
    setEditFailureReason(selected.failure_reason ?? "");
    setEditCancellationReason(selected.cancellation_reason ?? "");
  }, [selected?.booking_id, selected?.status, selected?.failure_reason, selected?.cancellation_reason]);

  async function refreshAll() {
    await listQ.refetch();
    if (selectedId) {
      await detailQ.refetch();
    }
  }

  async function handleSaveUpdate() {
    if (!selectedId) return;

    setActionBusy("save");
    try {
      await adminUpdateBooking(api, selectedId, {
        status: editStatus || null,
        failure_reason: editFailureReason || null,
        cancellation_reason: editCancellationReason || null,
      });
      await refreshAll();
    } finally {
      setActionBusy("");
    }
  }

  async function handleConfirm() {
    if (!selectedId) return;

    setActionBusy("confirm");
    try {
      await confirmBooking(api, selectedId);
      await refreshAll();
    } finally {
      setActionBusy("");
    }
  }

  async function handleCancel() {
    if (!selectedId) return;

    setActionBusy("cancel");
    try {
      await cancelBooking(api, selectedId, {
        reason: editCancellationReason || "admin_cancelled",
      });
      await refreshAll();
    } finally {
      setActionBusy("");
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    const ok = window.confirm(`Delete booking ${selectedId}?`);
    if (!ok) return;

    setActionBusy("delete");
    try {
      await adminDeleteBooking(api, selectedId);
      setSelectedId(null);
      await listQ.refetch();
    } finally {
      setActionBusy("");
    }
  }

  function clearFilters() {
    setStatus("");
    setUserEmail("");
    setHandymanEmail("");
  }

  const columns: DataTableColumn<AnyBooking>[] = [
    {
      key: "booking_id",
      header: "Booking",
      width: 280,
      render: (row) => (
        <button onClick={() => setSelectedId(row.booking_id ?? null)} className="app-link-button">
          <span
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 13,
            }}
          >
            {row.booking_id ?? "-"}
          </span>
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 140,
      render: (row) => <Badge label={row.status ?? "-"} tone={getStatusTone(row.status)} />,
    },
    {
      key: "user_email",
      header: "User",
      width: 220,
      render: (row) => <span>{row.user_email ?? "-"}</span>,
    },
    {
      key: "handyman_email",
      header: "Handyman",
      width: 220,
      render: (row) => <span>{row.handyman_email ?? "-"}</span>,
    },
    {
      key: "desired_start",
      header: "Start",
      width: 180,
      render: (row) => <span>{formatDateTime(row.desired_start)}</span>,
    },
    {
      key: "desired_end",
      header: "End",
      width: 180,
      render: (row) => <span>{formatDateTime(row.desired_end)}</span>,
    },
  ];

  return (
    <Page title="Bookings" subtitle="Filter, inspect, and administrate bookings">
      <Card title="Filters">
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "180px minmax(0, 1fr) minmax(0, 1fr) auto",
            alignItems: "end",
          }}
        >
          <label className="app-label">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option || "all"} value={option}>
                  {option || "All statuses"}
                </option>
              ))}
            </select>
          </label>

          <label className="app-label">
            <span>User email</span>
            <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Filter by user email" />
          </label>

          <label className="app-label">
            <span>Handyman email</span>
            <input
              value={handymanEmail}
              onChange={(e) => setHandymanEmail(e.target.value)}
              placeholder="Filter by handyman email"
            />
          </label>

          <button onClick={clearFilters} className="app-button app-button-primary">
            Clear
          </button>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card
        title="Results"
        right={
          listQ.isFetching
            ? "Refreshing…"
            : `${rows.length} booking${rows.length === 1 ? "" : "s"}`
        }
      >
        {listQ.error ? (
          <div
            style={{
              background: "var(--danger-soft)",
              color: "var(--danger)",
              border: "1px solid var(--danger-soft)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            {String((listQ.error as Error).message)}
          </div>
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            emptyText="No bookings match the current filters."
          />
        )}
      </Card>

      <OverlayPanel
        open={!!selectedId}
        title={selectedId ? `Booking ${selectedId}` : "Booking"}
        onClose={() => setSelectedId(null)}
      >
        {!selected ? (
          <div style={{ color: "var(--text-faint)" }}>{detailQ.isFetching ? "Loading…" : "Booking not found."}</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <Card title="Summary">
              <div style={{ display: "grid", gap: 10 }}>
                <div><strong>Status:</strong> <Badge label={selected.status ?? "-"} tone={getStatusTone(selected.status)} /></div>
                <div><strong>User:</strong> {selected.user_email ?? "-"}</div>
                <div><strong>Handyman:</strong> {selected.handyman_email ?? "-"}</div>
                <div><strong>Start:</strong> {formatDateTime(selected.desired_start)}</div>
                <div><strong>End:</strong> {formatDateTime(selected.desired_end)}</div>
                <div><strong>Failure reason:</strong> {selected.failure_reason ?? "-"}</div>
                <div><strong>Cancellation reason:</strong> {selected.cancellation_reason ?? "-"}</div>
              </div>
            </Card>

            <Card title="Admin update">
              <div style={{ display: "grid", gap: 12 }}>
                <label className="app-label">
                  <span>Status</span>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    {STATUS_OPTIONS.filter(Boolean).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="app-label">
                  <span>Failure reason</span>
                  <input value={editFailureReason} onChange={(e) => setEditFailureReason(e.target.value)} />
                </label>

                <label className="app-label">
                  <span>Cancellation reason</span>
                  <input value={editCancellationReason} onChange={(e) => setEditCancellationReason(e.target.value)} />
                </label>

                <button onClick={handleSaveUpdate} disabled={actionBusy !== ""} className="app-button app-button-primary">
                  {actionBusy === "save" ? "Saving…" : "Save update"}
                </button>
              </div>
            </Card>

            <Card title="Actions">
              <div style={{ display: "grid", gap: 10 }}>
                <button onClick={handleConfirm} disabled={actionBusy !== ""} className="app-button app-button-success">
                  {actionBusy === "confirm" ? "Confirming…" : "Confirm booking"}
                </button>

                <button onClick={handleCancel} disabled={actionBusy !== ""} className="app-button app-button-warning">
                  {actionBusy === "cancel" ? "Cancelling…" : "Cancel booking"}
                </button>

                <button onClick={handleDelete} disabled={actionBusy !== ""} className="app-button app-button-danger">
                  {actionBusy === "delete" ? "Deleting…" : "Delete booking"}
                </button>
              </div>
            </Card>
          </div>
        )}
      </OverlayPanel>
    </Page>
  );
}