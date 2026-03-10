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
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: 18,
        boxShadow: "var(--shadow-sm)",
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
            color: "var(--text)",
          }}
        >
          {title}
        </div>

        {right ? (
          <div style={{ color: "var(--text-soft)", fontSize: 13 }}>
            {right}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}