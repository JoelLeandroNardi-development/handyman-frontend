import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listHandymen,
  listHandymanReviews,
  type HandymanReviewResponse,
} from "@smart/api";
import { PAGINATION_DEFAULTS } from "@smart/core";
import { createApiClient } from "../lib/api";
import { formatDateTime } from "../lib/adminFormat";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import OverlayPanel from "../ui/OverlayPanel";
import Page from "../ui/Page";

type ReviewWithHandyman = HandymanReviewResponse & {
  handyman_email?: string;
};

export default function ReviewsManagementPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null);
  const [allReviewsData, setAllReviewsData] = useState<ReviewWithHandyman[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const handymenQ = useQuery({
    queryKey: ["admin-handymen-for-reviews"],
    queryFn: () =>
      listHandymen(api, {
        limit: PAGINATION_DEFAULTS.LIMIT_LARGE,
        offset: PAGINATION_DEFAULTS.OFFSET,
      }),
  });

  // Fetch reviews for all handymen using an effect (not in a loop with useQuery)
  useEffect(() => {
    const fetchAllReviews = async () => {
      if (!handymenQ.data || handymenQ.data.length === 0) return;

      setIsLoadingReviews(true);
      try {
        const reviewsPromises = handymenQ.data.map((handyman) =>
          listHandymanReviews(api, handyman.email, {
            limit: 100,
            offset: 0,
          }).then((reviews) =>
            reviews.map((review) => ({
              ...review,
              handyman_email: handyman.email,
            }))
          )
        );

        const allReviews = await Promise.all(reviewsPromises);
        setAllReviewsData(allReviews.flat());
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setAllReviewsData([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchAllReviews();
  }, [handymenQ.data, api]);

  // Filter and sort reviews
  const filteredReviews = allReviewsData
    .filter((review) => {
      const matchesSearch = search.trim()
        ? `${review.handyman_email} ${review.user_email} ${review.review_text || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const matchesRating = review.rating ? review.rating >= minRating : false;
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate; // Sort by newest first
    });

  const selected = selectedReviewIndex !== null ? filteredReviews[selectedReviewIndex] : null;
  const isFetching = handymenQ.isFetching || isLoadingReviews;

  const columns: DataTableColumn<ReviewWithHandyman>[] = [
    {
      key: "handyman_email",
      header: "Handyman",
      render: (row) => (
        <button onClick={() => setSelectedReviewIndex(filteredReviews.indexOf(row))} className="app-link-button">
          {row.handyman_email}
        </button>
      ),
    },
    {
      key: "reviewer",
      header: "Reviewer",
      render: (row) => <span>{row.user_email}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      width: 80,
      render: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 700 }}>{row.rating}</span>
          <span>⭐</span>
        </div>
      ),
    },
    {
      key: "review_text",
      header: "Review",
      render: (row) => (
        <span style={{ maxWidth: 400, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {row.review_text || "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      width: 180,
      render: (row) => <span>{row.created_at ? formatDateTime(row.created_at) : "-"}</span>,
    },
  ];

  const avgRating =
    filteredReviews.length > 0
      ? (filteredReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / filteredReviews.length).toFixed(1)
      : "N/A";

  return (
    <Page title="Reviews" subtitle="View and manage handyman reviews and ratings">
      <Card title="Toolbar">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto auto" }}>
          <label className="app-label">
            <span>Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by handyman, reviewer email, or review text"
            />
          </label>

          <label className="app-label">
            <span>Minimum Rating</span>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              <option value={0}>All</option>
              <option value={1}>1+ ⭐</option>
              <option value={2}>2+ ⭐</option>
              <option value={3}>3+ ⭐</option>
              <option value={4}>4+ ⭐</option>
              <option value={5}>5 ⭐</option>
            </select>
          </label>

          <button
            onClick={() => {
              handymenQ.refetch();
            }}
            className="app-button"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Statistics">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Total Reviews</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{filteredReviews.length}</div>
          </div>
          <div style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Average Rating</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
              {avgRating} ⭐
            </div>
          </div>
          <div style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Handymen</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
              {handymenQ.data?.length || 0}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Reviews" right={`${filteredReviews.length} reviews`}>
        <DataTable rows={filteredReviews} columns={columns} emptyText="No reviews found." />
      </Card>

      <OverlayPanel
        open={!!selected}
        title={`Review - ${selected?.user_email || "Unknown"}`}
        onClose={() => setSelectedReviewIndex(null)}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Review Details">
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Handyman</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selected?.handyman_email}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Reviewer Email</div>
                <div style={{ fontSize: 14 }}>{selected?.user_email || "-"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Rating</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {selected?.rating}
                  <span style={{ marginLeft: 4 }}>⭐</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>Date</div>
                <div style={{ fontSize: 14 }}>
                  {selected?.created_at ? formatDateTime(selected.created_at) : "-"}
                </div>
              </div>
            </div>
          </Card>

          {selected?.review_text && (
            <Card title="Review Text">
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
                {selected.review_text}
              </div>
            </Card>
          )}
        </div>
      </OverlayPanel>
    </Page>
  );
}
