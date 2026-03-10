type Tone = "neutral" | "success" | "warning" | "danger" | "info";

function getToneStyles(tone: Tone) {
  switch (tone) {
    case "success":
      return {
        background: "var(--success-soft)",
        color: "var(--success)",
        border: "var(--success-soft)",
      };
    case "warning":
      return {
        background: "var(--warning-soft)",
        color: "var(--warning)",
        border: "var(--warning-soft)",
      };
    case "danger":
      return {
        background: "var(--danger-soft)",
        color: "var(--danger)",
        border: "var(--danger-soft)",
      };
    case "info":
      return {
        background: "var(--primary-soft)",
        color: "var(--primary)",
        border: "var(--primary-soft)",
      };
    default:
      return {
        background: "var(--surface-muted)",
        color: "var(--text)",
        border: "var(--border)",
      };
  }
}

export default function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  const styles = getToneStyles(tone);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${styles.border}`,
        background: styles.background,
        color: styles.color,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}