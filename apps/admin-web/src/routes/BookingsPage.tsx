import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminListBookings } from "@smart/api";
import { createApiClient } from "../lib/api";
import Card from "../ui/Card";
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

export default function BookingsPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);

  const [status, setStatus] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [handymanEmail, setHandymanEmail] = useState<string>("");

  const q = useQuery({
    queryKey: ["admin-bookings", status, userEmail, handymanEmail],
    queryFn: () =>
      adminListBookings(api, {
        limit: 50,
        offset: 0,
        status: status || null,
        user_email: userEmail || null,
        handyman_email: handymanEmail || null,
      }),
  });

  const data = q.data;

  const asArray: AnyBooking[] | null = Array.isArray(data) ? (data as AnyBooking[]) : null;

  return (
    <Page title="Bookings" subtitle="Filter and inspect bookings">
      <Card title="Filters">
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <label>
            Status
            <input value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </label>
          <label>
            User email
            <input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            Handyman email
            <input
              value={handymanEmail}
              onChange={(e) => setHandymanEmail(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Results" right={q.isFetching ? "Loading…" : undefined}>
        {q.error ? (
          <div>{String((q.error as Error).message)}</div>
        ) : asArray ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["booking_id", "status", "user_email", "handyman_email", "desired_start", "desired_end"].map((h) => (
                    <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #e6e8ef", padding: "10px 8px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {asArray.map((b) => (
                  <tr key={b.booking_id ?? Math.random()}>
                    <td style={{ borderBottom: "1px solid #f0f2f7", padding: "10px 8px", fontFamily: "monospace" }}>
                      {b.booking_id ?? "-"}
                    </td>
                    <td style={{ borderBottom: "1px solid #f0f2f7", padding: "10px 8px" }}>{b.status ?? "-"}</td>
                    <td style={{ borderBottom: "1px solid #f0f2f7", padding: "10px 8px" }}>{b.user_email ?? "-"}</td>
                    <td style={{ borderBottom: "1px solid #f0f2f7", padding: "10px 8px" }}>{b.handyman_email ?? "-"}</td>
                    <td style={{ borderBottom: "1px solid #f0f2f7", padding: "10px 8px" }}>{b.desired_start ?? "-"}</td>
                    <td style={{ borderBottom: "1px solid #f0f2f7", padding: "10px 8px" }}>{b.desired_end ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(data ?? {}, null, 2)}</pre>
        )}
      </Card>
    </Page>
  );
}