import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, EyeOff, Eye, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useVisitor } from "@/contexts/VisitorContext";
import {
  getMyConfessions,
  editConfession,
  deleteConfession,
  toggleHideConfession,
  Confession,
} from "@/lib/confessions";

export default function Dashboard() {
  const { visitor } = useVisitor();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const refresh = useCallback(async () => {
    if (!visitor) return;
    const data = await getMyConfessions(visitor.id);
    setConfessions(data);
    setLoading(false);
  }, [visitor]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleEdit = (c: Confession) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await editConfession(editingId, editText.trim());
    setEditingId(null);
    setEditText("");
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteConfession(id);
    refresh();
  };

  const handleToggleHide = async (c: Confession) => {
    await toggleHideConfession(c.id, !c.hidden);
    refresh();
  };

  const date = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          back to feed
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">your confessions</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {confessions.length} confession{confessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          loading...
        </div>
      ) : confessions.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          you haven't confessed anything yet.
        </div>
      ) : (
        <div className="space-y-3">
          {confessions.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-lg border bg-card p-5 ${c.hidden ? "opacity-60" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-bold text-foreground">
                    #{c.confession_number}
                  </span>
                  {c.hidden && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      hidden
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {date(c.created_at)}
                </span>
              </div>

              {editingId === c.id ? (
                <div className="mb-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editText.trim()}
                      className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      <Check className="h-3 w-3" />
                      save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mb-4 text-sm leading-relaxed text-card-foreground">
                  {c.text}
                </p>
              )}

              {editingId !== c.id && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                    edit
                  </button>
                  <button
                    onClick={() => handleToggleHide(c)}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {c.hidden ? (
                      <>
                        <Eye className="h-3 w-3" />
                        unhide
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        hide
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
