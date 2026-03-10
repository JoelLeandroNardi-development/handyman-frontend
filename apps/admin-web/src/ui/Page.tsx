import React from "react";

export default function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text)",
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              color: "var(--text-faint)",
              marginTop: 8,
              fontSize: 15,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}