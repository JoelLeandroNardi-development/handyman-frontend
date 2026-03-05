import React from "react";

export default function Badge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid #e6e8ef",
        background: "#fff",
        fontSize: 12
      }}
    >
      {label}
    </span>
  );
}