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
        background: "rgba(15, 23, 42, 0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 30,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          height: "100%",
          background: "#fff",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-12px 0 32px rgba(15,23,42,0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>

          <button
            onClick={onClose}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "#e2e8f0",
              color: "#0f172a",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 20, overflow: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}