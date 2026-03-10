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
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#0f172a",
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