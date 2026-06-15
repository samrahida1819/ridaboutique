import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  empty = "No records yet."
}: {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-green/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-brand-cream text-xs uppercase tracking-[0.18em] text-brand-green/70">
            <tr>
              {columns.map((column) => (
                <th className={cn("px-5 py-4 font-semibold", column.className)} key={column.header}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-green/10">
            {rows.length ? (
              rows.map((row, index) => (
                <tr className="transition hover:bg-brand-cream/45" key={index}>
                  {columns.map((column) => (
                    <td className={cn("px-5 py-4 text-brand-charcoal/75", column.className)} key={column.header}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-brand-charcoal/55" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
