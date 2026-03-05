import React from "react";

export default function Page({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{title}</div>
        {subtitle ? <div style={{ opacity: 0.7, marginTop: 4 }}>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}