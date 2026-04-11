import { useState } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReport } from "@/lib/reports";
import { useVisitor } from "@/contexts/VisitorContext";
import { toast } from "sonner";

interface Props {
  confessionId: string;
}

export default function ReportDialog({ confessionId }: Props) {
  const { visitor } = useVisitor();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!visitor || !reason.trim()) return;
    setSubmitting(true);
    try {
      await submitReport(confessionId, visitor.id, reason.trim());
      toast.success("Report submitted. Thank you.");
      setReason("");
      setOpen(false);
    } catch {
      toast.error("Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground/50 hover:text-destructive transition-colors"
          title="Report"
        >
          <Flag className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Confession</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this confession?"
            maxLength={500}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={submitting || !reason.trim()}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
