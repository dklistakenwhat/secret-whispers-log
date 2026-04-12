import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { getComments, addComment, Comment } from "@/lib/confessions";
import { useVisitor } from "@/contexts/VisitorContext";

interface Props {
  confessionId: string;
  open: boolean;
  onClose: () => void;
}

export default function CommentsDrawer({ confessionId, open, onClose }: Props) {
  const { visitor } = useVisitor();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getComments(confessionId).then((c) => { setComments(c); setLoading(false); });
    }
  }, [open, confessionId]);

  const handleSubmit = async () => {
    if (!text.trim() || !visitor) return;
    const c = await addComment(confessionId, visitor.id, text.trim());
    setComments((prev) => [...prev, c]);
    setText("");
  };

  const getTimeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-3xl"
            style={{ maxHeight: "60vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <span className="text-sm font-semibold text-foreground">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
              <button onClick={onClose} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="overflow-y-auto px-5 pb-2 no-scrollbar" style={{ maxHeight: "calc(60vh - 130px)" }}>
              {loading ? (
                <p className="py-8 text-center text-xs text-muted-foreground">loading...</p>
              ) : comments.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">no comments yet</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{getTimeAgo(c.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/90">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/30 px-5 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="add a comment..."
                  className="flex-1 rounded-full bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="rounded-full bg-primary p-2.5 text-primary-foreground disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
