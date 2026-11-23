import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
}

export function Table<T>({ columns, rows, rowKey, onRowClick, empty }: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-[10px] border border-border bg-surface-1 text-[13px] text-muted">
        {empty ?? "Nothing here yet."}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface-1">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.header}
                className={`border-b border-border px-3 py-2.5 text-left text-[12px] font-medium text-muted ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-border last:border-0 transition-colors duration-100 ${
                onRowClick ? "cursor-pointer hover:bg-surface-2" : ""
              }`}
            >
              {columns.map((c) => (
                <td key={c.header} className={`px-3 py-2.5 align-middle ${c.className ?? ""}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
