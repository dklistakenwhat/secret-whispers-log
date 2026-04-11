import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Confession } from "@/lib/confessions";
import ReportDialog from "@/components/ReportDialog";

interface Props {
  confession: Confession;
  onLike: (id: string) => void;
  isMine?: boolean;
  liked?: boolean;
}

export default function ConfessionCard({ confession, onLike, isMine, liked }: Props) {
  const date = new Date(confession.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeAgo = getTimeAgo(date.getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group rounded-lg border bg-card p-5 transition-colors hover:bg-confession-hover"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-heading text-base font-bold text-foreground">
          #{confession.confession_number}
        </span>
        <div className="flex items-center gap-2">
          {isMine && (
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" title="" />
          )}
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-card-foreground">
        {confession.text}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-confession-number">{formattedDate}</span>
        <div className="flex items-center gap-3">
          <ReportDialog confessionId={confession.id} />
          <button
            onClick={() => onLike(confession.id)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              liked
                ? "text-red-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
            {confession.likes > 0 && <span>{confession.likes}</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
