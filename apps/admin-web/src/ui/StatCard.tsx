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
    <div className="app-card" style={{ padding: 18 }}>
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
        <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-faint)" }}>{hint}</div>
      ) : null}
    </div>
  );
}