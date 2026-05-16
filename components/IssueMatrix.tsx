import type { IssueMatrix as IssueMatrixData } from "@/lib/types";

export default function IssueMatrix({ data }: { data: IssueMatrixData }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-lg sm:border sm:border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted-bg/60 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="sticky left-0 z-10 bg-muted-bg/95 px-3 py-2 backdrop-blur">
              Issue
            </th>
            {data.partyHeaders.map((p) => (
              <th key={p} className="px-3 py-2 whitespace-nowrap">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.rows.map((row) => (
            <tr key={row.issue} className="bg-background align-top">
              <td className="sticky left-0 z-10 max-w-[12rem] bg-background px-3 py-2 font-medium">
                {row.issue}
              </td>
              {data.partyHeaders.map((p) => (
                <td key={p} className="min-w-[14rem] px-3 py-2 text-muted">
                  {row.stances[p] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
