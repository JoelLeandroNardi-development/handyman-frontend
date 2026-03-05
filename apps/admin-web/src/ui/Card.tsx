import React from "react";

export default function Card({
  title,
  right,
  children
}: {
  title: string;
  right?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e6e8ef", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        {right ? <div style={{ opacity: 0.6, fontSize: 12 }}>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}