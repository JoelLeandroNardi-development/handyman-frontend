import React from "react";

export default function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: string | React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: "-0.01em",
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        {right ? (
          <div style={{ color: "#64748b", fontSize: 13 }}>
            {right}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}