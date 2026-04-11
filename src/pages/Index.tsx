import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, LogOut, User } from "lucide-react";
import ConfessionForm from "@/components/ConfessionForm";
import ConfessionCard from "@/components/ConfessionCard";
import {
  getConfessions,
  addConfession,
  toggleLikeConfession,
  getMyLikes,
  Confession,
} from "@/lib/confessions";
import { useVisitor } from "@/contexts/VisitorContext";

export default function Index() {
  const { visitor, logout } = useVisitor();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    const data = await getConfessions();
    setConfessions(data);
    if (visitor) {
      const likes = await getMyLikes(visitor.id);
      setLikedIds(likes);
    }
    setLoading(false);
  }, [visitor]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (text: string) => {
    await addConfession(text, visitor?.id);
    refresh();
  };

  const handleLike = async (id: string) => {
    if (!visitor) return;
    await toggleLikeConfession(id, visitor.id);
    refresh();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return confessions;
    // Support searching by #number or by text content
    const numMatch = q.match(/^#?(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      return confessions.filter((c) => c.confession_number === num);
    }
    return confessions.filter((c) => c.text.toLowerCase().includes(q));
  }, [confessions, search]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
{/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full overflow-hidden shadow-lg border-2 border-primary/30">
          <img src="/logo.png" alt="confessionable" className="h-16 w-16 object-cover rounded-full" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          confessionable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          anonymous · numbered · unfiltered
        </p>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <User className="h-3 w-3" />
            my confessions
          </Link>
          <span className="text-[11px] text-muted-foreground/40">·</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-3 w-3" />
            log out
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="mb-10">
        <ConfessionForm onSubmit={handleSubmit} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by #number or keyword..."
            className="w-full bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-xs font-medium text-muted-foreground">
        {search
          ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
          : `${confessions.length} confession${confessions.length !== 1 ? "s" : ""}`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {search ? "no confessions match your search." : "no confessions yet. be the first."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <ConfessionCard
              key={c.id}
              confession={c}
              onLike={handleLike}
              isMine={c.visitor_id === visitor?.id}
              liked={likedIds.has(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
