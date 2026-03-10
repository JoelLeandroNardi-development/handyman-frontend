export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
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
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-faint)" }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text)",
        }}
      >
        {value}
      </div>
      {hint ? (
        <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>{hint}</div>
      ) : null}
    </div>
  );
}