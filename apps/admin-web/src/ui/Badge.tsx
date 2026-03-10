type Tone = "neutral" | "success" | "warning" | "danger" | "info";

function getToneStyles(tone: Tone) {
  switch (tone) {
    case "success":
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "#bbf7d0",
      };
    case "warning":
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "#fde68a",
      };
    case "danger":
      return {
        background: "#fee2e2",
        color: "#991b1b",
        border: "#fecaca",
      };
    case "info":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "#bfdbfe",
      };
    default:
      return {
        background: "#f8fafc",
        color: "#334155",
        border: "#e2e8f0",
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