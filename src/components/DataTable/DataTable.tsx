import type { ReactNode } from 'react';

export interface ColumnHeader<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnHeader<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto w-full rounded-xl border border-slate-800 bg-slate-900/30 ${className}`}>
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
        <thead className="bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-4">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/10">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-800/40 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-slate-200">
                    {column.render ? column.render(row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
