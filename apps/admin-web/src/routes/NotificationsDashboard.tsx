import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  buildNotificationsStreamUrl,
  getMyNotifications,
  getNotificationUnreadCount,
} from "@smart/api";
import { createApiClient } from "../lib/api";
import { formatDateTime } from "../lib/adminFormat";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function NotificationsDashboard() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("unread");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sseStatus, setSseStatus] = useState<"connecting" | "connected" | "error" | "idle">("idle");

  const notificationsQ = useQuery({
    queryKey: ["admin-notifications", statusFilter],
    queryFn: () =>
      getMyNotifications(api, {
        status: statusFilter === "all" ? null : (statusFilter as any),
        limit: 100,
      }),
  });

  const unreadCountQ = useQuery({
    queryKey: ["admin-unread-count"],
    queryFn: () => getNotificationUnreadCount(api),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Test SSE connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const testSSE = () => {
      setSseStatus("connecting");
      const streamUrl = buildNotificationsStreamUrl(API_BASE_URL, token);
      const eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        setSseStatus("connected");
      };

      eventSource.onerror = () => {
        setSseStatus("error");
        eventSource.close();
      };

      // Auto-close after 5 seconds for testing
      const timeout = setTimeout(() => {
        eventSource.close();
        setSseStatus("idle");
      }, 5000);

      return () => {
        clearTimeout(timeout);
        eventSource.close();
      };
    };

    testSSE();
  }, []);

  const notifications = notificationsQ.data?.items ?? [];
  const filtered = notifications.filter((notif) =>
    search.trim()
      ? `${notif.title} ${notif.body} ${notif.message}`.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const selected = selectedIndex !== null ? filtered[selectedIndex] : null;
  const unreadCount = unreadCountQ.data?.unread_count ?? 0;

  const columns: DataTableColumn<typeof notifications[0]>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <button onClick={() => setSelectedIndex(filtered.indexOf(row))} className="app-link-button">
          {row.title || "-"}
        </button>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: 100,
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            background: "var(--surface-muted)",
            padding: "4px 8px",
            borderRadius: 4,
            textTransform: "capitalize",
          }}
        >
          {row.type || "general"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 100,
      render: (row) => (
        <span
          style={{
            background:
              row.status === "read"
                ? "var(--surface-muted)"
                : row.status === "archived"
                  ? "var(--warning-soft)"
                  : "var(--primary-soft)",
            color:
              row.status === "read"
                ? "var(--text-faint)"
                : row.status === "archived"
                  ? "var(--warning)"
                  : "var(--primary)",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {row.status || "unread"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      width: 180,
      render: (row) => <span>{row.created_at ? formatDateTime(row.created_at) : "-"}</span>,
    },
  ];

  return (
    <Page title="Notifications" subtitle="Monitor system notifications and verify notification service health">
      <Card title="Service Health">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Unread Notifications</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{unreadCount}</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
              {unreadCountQ.isFetching ? "Updating…" : "Last checked just now"}
            </div>
          </div>

          <div style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Total Notifications</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{filtered.length}</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
              Across all statuses in current view
            </div>
          </div>

          <div style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>SSE Stream Status</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginTop: 4,
                color:
                  sseStatus === "connected"
                    ? "var(--success)"
                    : sseStatus === "connecting"
                      ? "var(--warning)"
                      : sseStatus === "error"
                        ? "var(--danger)"
                        : "var(--text-faint)",
                textTransform: "capitalize",
              }}
            >
              {sseStatus}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
              Real-time notification delivery
            </div>
          </div>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Toolbar">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto" }}>
          <label className="app-label">
            <span>Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, body, or message"
            />
          </label>

          <label className="app-label">
            <span>Filter by Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>

          <button
            onClick={() => {
              notificationsQ.refetch();
              unreadCountQ.refetch();
            }}
            className="app-button"
            disabled={notificationsQ.isFetching}
          >
            {notificationsQ.isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card
        title="Notifications Feed"
        right={`${filtered.length} notifications`}
      >
        <DataTable rows={filtered} columns={columns} emptyText="No notifications found." />
      </Card>

      <OverlayPanel
        open={!!selected}
        title={selected?.title || "Notification"}
        onClose={() => setSelectedIndex(null)}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Details">
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Title</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selected?.title || "-"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Type</div>
                <div style={{ fontSize: 14, textTransform: "capitalize" }}>{selected?.type || "general"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Status</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color:
                      selected?.status === "read"
                        ? "var(--text-faint)"
                        : selected?.status === "archived"
                          ? "var(--warning)"
                          : "var(--primary)",
                    textTransform: "capitalize",
                  }}
                >
                  {selected?.status || "unread"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Notification ID</div>
                <div style={{ fontSize: 13, fontFamily: "monospace", wordBreak: "break-all" }}>
                  {selected?.notification_id || "-"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Created</div>
                <div style={{ fontSize: 14 }}>
                  {selected?.created_at ? formatDateTime(selected.created_at) : "-"}
                </div>
              </div>

              {selected?.read_at && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Read At</div>
                  <div style={{ fontSize: 14 }}>{formatDateTime(selected.read_at)}</div>
                </div>
              )}

              {selected?.archived_at && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Archived At</div>
                  <div style={{ fontSize: 14 }}>{formatDateTime(selected.archived_at)}</div>
                </div>
              )}
            </div>
          </Card>

          {selected?.body && (
            <Card title="Body">
              <div
                style={{
                  background: "var(--surface-muted)",
                  padding: 12,
                  borderRadius: 8,
                  lineHeight: 1.6,
                  color: "var(--text)",
                  fontSize: 14,
                }}
              >
                {selected.body}
              </div>
            </Card>
          )}

          {selected?.message && (
            <Card title="Message">
              <div
                style={{
                  background: "var(--surface-muted)",
                  padding: 12,
                  borderRadius: 8,
                  lineHeight: 1.6,
                  color: "var(--text)",
                  fontSize: 14,
                }}
              >
                {selected.message}
              </div>
            </Card>
          )}

          {selected?.payload && Object.keys(selected.payload).length > 0 && (
            <Card title="Payload">
              <pre
                style={{
                  background: "var(--surface-muted)",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 12,
                  overflow: "auto",
                  fontFamily: "monospace",
                  color: "var(--text)",
                }}
              >
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </OverlayPanel>
    </Page>
  );
}
