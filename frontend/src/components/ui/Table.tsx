import type { ReactNode } from "react";

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage ?? "No records found."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-white/[0.06]">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.03]">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] bg-white dark:bg-transparent">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="group transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 align-top"
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Row count footer */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.05] px-4 py-2.5 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
          {data.length} {data.length === 1 ? "record" : "records"}
        </p>
      </div>
    </div>
  );
}
