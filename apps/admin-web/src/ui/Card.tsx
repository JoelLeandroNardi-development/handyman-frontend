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
    <section className="app-card" style={{ padding: 18 }}>
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
          <div className="app-soft" style={{ fontSize: 13 }}>
            {right}
          </div>
        ) : null}
      </div>

      {children}
    </section>
  );
}