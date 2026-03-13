import React from "react";

export default function OverlayPanel({
  open,
  title,
  onClose,
  children,
  width = 520,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 8, 20, 0.56)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 30,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{title}</div>

          <button
            onClick={onClose}
            className="app-button app-button-secondary"
            style={{ minHeight: 38 }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 20, overflow: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}