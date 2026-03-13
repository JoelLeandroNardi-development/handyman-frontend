type Tone = "neutral" | "success" | "warning" | "danger" | "info";

function getToneStyles(tone: Tone) {
  switch (tone) {
    case "success":
      return {
        background: "var(--success-soft)",
        color: "var(--success)",
        border: "color-mix(in srgb, var(--success) 30%, transparent)",
      };
    case "warning":
      return {
        background: "var(--warning-soft)",
        color: "var(--warning)",
        border: "color-mix(in srgb, var(--warning) 30%, transparent)",
      };
    case "danger":
      return {
        background: "var(--danger-soft)",
        color: "var(--danger)",
        border: "color-mix(in srgb, var(--danger) 30%, transparent)",
      };
    case "info":
      return {
        background: "var(--primary-soft)",
        color: "var(--primary)",
        border: "color-mix(in srgb, var(--primary) 30%, transparent)",
      };
    default:
      return {
        background: "var(--surface-muted)",
        color: "var(--text-soft)",
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
        minHeight: 24,
        padding: "0 10px",
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