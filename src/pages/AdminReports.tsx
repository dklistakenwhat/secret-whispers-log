import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { getReports, resolveReport, deleteConfessionByReport } from "@/lib/reports";
import { useVisitor } from "@/contexts/VisitorContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminReports() {
  const { isAdmin } = useVisitor();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await getReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!isAdmin) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Access denied.</p>
        <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  const handleDismiss = async (id: string) => {
    await resolveReport(id);
    toast.success("Report dismissed.");
    refresh();
  };

  const handleDelete = async (confessionId: string, reportId: string) => {
    await deleteConfessionByReport(confessionId, reportId);
    toast.success("Confession deleted.");
    refresh();
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          back to confessions
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Reports Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {reports.length} pending report{reports.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-20 text-center">loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground py-20 text-center">No pending reports 🎉</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="font-heading text-sm font-bold text-foreground">
                  Confession #{r.confession_number ?? "?"}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-card-foreground mb-2 leading-relaxed">
                "{r.confession_text ?? "Deleted confession"}"
              </p>
              <div className="rounded-md bg-muted/50 p-3 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Report reason:</p>
                <p className="text-sm text-foreground">{r.reason}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDismiss(r.id)}
                  className="gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Dismiss
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(r.confession_id, r.id)}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Confession
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
