import React from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  width?: string | number;
  render: (row: T) => React.ReactNode;
};

export default function DataTable<T>({
  rows,
  columns,
  emptyText = "No data available.",
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  emptyText?: string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid var(--border)",
                  padding: "0 12px 12px 12px",
                  width: column.width,
                  color: "var(--text-faint)",
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "16px 12px",
                  color: "#64748b",
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: "14px 12px",
                      borderBottom: "1px solid var(--border)",
                      verticalAlign: "top",
                      color: "var(--text)",
                    }}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}