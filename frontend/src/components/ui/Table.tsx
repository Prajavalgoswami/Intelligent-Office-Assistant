import type { ReactNode } from "react";

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {emptyMessage ?? "No records found."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={
                rowIndex % 2 === 0
                  ? "bg-white dark:bg-slate-800/30"
                  : "bg-slate-50/60 dark:bg-slate-800/50"
              }
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 align-top"
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

