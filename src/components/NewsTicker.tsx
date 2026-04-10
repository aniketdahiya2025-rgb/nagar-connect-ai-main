import { useComplaints } from "@/lib/use-complaints";
import { categoryLabels } from "@/lib/sample-data";

export function NewsTicker() {
  const complaints = useComplaints();
  const latest = complaints.slice(0, 5);

  return (
    <div className="overflow-hidden border-b border-border bg-primary/5 py-2">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-1 px-4">
        {latest.map((item) => (
          <span key={item.id} className="text-sm text-muted-foreground">
            {categoryLabels[item.category]} • {item.title} • {item.status.replace("_", " ")}
          </span>
        ))}
        {latest.length === 0 && <span className="text-sm text-muted-foreground">No live complaint updates yet.</span>}
      </div>
    </div>
  );
}
